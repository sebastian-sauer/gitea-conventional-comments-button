(function () {
	'use strict';

	function NestedProxy(target) {
		return new Proxy(target, {
			get(target, prop) {
				if (typeof target[prop] !== 'function') {
					return new NestedProxy(target[prop]);
				}
				return (...arguments_) =>
					new Promise((resolve, reject) => {
						target[prop](...arguments_, result => {
							if (chrome.runtime.lastError) {
								reject(new Error(chrome.runtime.lastError.message));
							} else {
								resolve(result);
							}
						});
					});
			}
		});
	}
	const chromeP = globalThis.chrome && new NestedProxy(globalThis.chrome);

	const gotScripting = typeof chrome === 'object' && 'scripting' in chrome;
	function castTarget(target) {
	    return typeof target === 'object' ? target : {
	        tabId: target,
	        frameId: 0,
	    };
	}
	async function executeFunction(target, function_, ...args) {
	    const { frameId, tabId } = castTarget(target);
	    if (gotScripting) {
	        const [injection] = await chrome.scripting.executeScript({
	            target: {
	                tabId,
	                frameIds: [frameId],
	            },
	            func: function_,
	            args,
	        });
	        return injection === null || injection === void 0 ? void 0 : injection.result;
	    }
	    const [result] = await chromeP.tabs.executeScript(tabId, {
	        code: `(${function_.toString()})(...${JSON.stringify(args)})`,
	        frameId,
	    });
	    return result;
	}
	function arrayOrUndefined(value) {
	    return typeof value === 'undefined' ? undefined : [value];
	}
	function insertCSS({ tabId, frameId, files, allFrames, matchAboutBlank, runAt, }) {
	    for (let content of files) {
	        if (typeof content === 'string') {
	            content = { file: content };
	        }
	        if (gotScripting) {
	            void chrome.scripting.insertCSS({
	                target: {
	                    tabId,
	                    frameIds: arrayOrUndefined(frameId),
	                    allFrames,
	                },
	                files: 'file' in content ? [content.file] : undefined,
	                css: 'code' in content ? content.code : undefined,
	            });
	        }
	        else {
	            void chromeP.tabs.insertCSS(tabId, {
	                ...content,
	                matchAboutBlank,
	                allFrames,
	                frameId,
	                runAt: runAt !== null && runAt !== void 0 ? runAt : 'document_start',
	            });
	        }
	    }
	}
	async function executeScript({ tabId, frameId, files, allFrames, matchAboutBlank, runAt, }) {
	    let lastInjection;
	    for (let content of files) {
	        if (typeof content === 'string') {
	            content = { file: content };
	        }
	        if (gotScripting) {
	            if ('code' in content) {
	                throw new Error('chrome.scripting does not support injecting strings of `code`');
	            }
	            void chrome.scripting.executeScript({
	                target: {
	                    tabId,
	                    frameIds: arrayOrUndefined(frameId),
	                    allFrames,
	                },
	                files: [content.file],
	            });
	        }
	        else {
	            if ('code' in content) {
	                await lastInjection;
	            }
	            lastInjection = chromeP.tabs.executeScript(tabId, {
	                ...content,
	                matchAboutBlank,
	                allFrames,
	                frameId,
	                runAt,
	            });
	        }
	    }
	}

	const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;
	const isFirefox = typeof navigator === 'object' && navigator.userAgent.includes('Firefox/');
	const allStarsRegex = isFirefox ? /^(https?|wss?):[/][/][^/]+([/].*)?$/ : /^https?:[/][/][^/]+([/].*)?$/;
	const allUrlsRegex = /^(https?|file|ftp):[/]+/;
	function getRawRegex(matchPattern) {
	    if (!patternValidationRegex.test(matchPattern)) {
	        throw new Error(matchPattern + ' is an invalid pattern, it must match ' + String(patternValidationRegex));
	    }
	    let [, protocol, host, pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);
	    protocol = protocol
	        .replace('*', isFirefox ? '(https?|wss?)' : 'https?')
	        .replace(/[/]/g, '[/]');
	    host = (host !== null && host !== void 0 ? host : '')
	        .replace(/^[*][.]/, '([^/]+.)*')
	        .replace(/^[*]$/, '[^/]+')
	        .replace(/[.]/g, '[.]')
	        .replace(/[*]$/g, '[^.]+');
	    pathname = pathname
	        .replace(/[/]/g, '[/]')
	        .replace(/[.]/g, '[.]')
	        .replace(/[*]/g, '.*');
	    return '^' + protocol + host + '(' + pathname + ')?$';
	}
	function patternToRegex(...matchPatterns) {
	    if (matchPatterns.length === 0) {
	        return /$./;
	    }
	    if (matchPatterns.includes('<all_urls>')) {
	        return allUrlsRegex;
	    }
	    if (matchPatterns.includes('*://*/*')) {
	        return allStarsRegex;
	    }
	    return new RegExp(matchPatterns.map(x => getRawRegex(x)).join('|'));
	}

	const gotNavigation = typeof chrome === 'object' && 'webNavigation' in chrome;
	async function isOriginPermitted(url) {
	    return chromeP.permissions.contains({
	        origins: [new URL(url).origin + '/*'],
	    });
	}
	async function wasPreviouslyLoaded(target, assets) {
	    const loadCheck = (key) => {
	        const wasLoaded = document[key];
	        document[key] = true;
	        return wasLoaded;
	    };
	    return executeFunction(target, loadCheck, JSON.stringify(assets));
	}
	async function registerContentScript(contentScriptOptions, callback) {
	    const { js = [], css = [], matchAboutBlank, matches, excludeMatches, runAt, } = contentScriptOptions;
	    let { allFrames } = contentScriptOptions;
	    if (gotNavigation) {
	        allFrames = false;
	    }
	    else if (allFrames) {
	        console.warn('`allFrames: true` requires the `webNavigation` permission to work correctly: https://github.com/fregante/content-scripts-register-polyfill#permissions');
	    }
	    const matchesRegex = patternToRegex(...matches);
	    const excludeMatchesRegex = patternToRegex(...excludeMatches !== null && excludeMatches !== void 0 ? excludeMatches : []);
	    const inject = async (url, tabId, frameId = 0) => {
	        if (!matchesRegex.test(url)
	            || excludeMatchesRegex.test(url)
	            || !await isOriginPermitted(url)
	            || await wasPreviouslyLoaded({ tabId, frameId }, { js, css })
	        ) {
	            return;
	        }
	        insertCSS({
	            tabId,
	            frameId,
	            files: css,
	            matchAboutBlank,
	            runAt,
	        });
	        await executeScript({
	            tabId,
	            frameId,
	            files: js,
	            matchAboutBlank,
	            runAt,
	        });
	    };
	    const tabListener = async (tabId, { status }, { url }) => {
	        if (status && url) {
	            void inject(url, tabId);
	        }
	    };
	    const navListener = async ({ tabId, frameId, url, }) => {
	        void inject(url, tabId, frameId);
	    };
	    if (gotNavigation) {
	        chrome.webNavigation.onCommitted.addListener(navListener);
	    }
	    else {
	        chrome.tabs.onUpdated.addListener(tabListener);
	    }
	    const registeredContentScript = {
	        async unregister() {
	            if (gotNavigation) {
	                chrome.webNavigation.onCommitted.removeListener(navListener);
	            }
	            else {
	                chrome.tabs.onUpdated.removeListener(tabListener);
	            }
	        },
	    };
	    if (typeof callback === 'function') {
	        callback(registeredContentScript);
	    }
	    return registeredContentScript;
	}

	if (typeof chrome === 'object' && !chrome.contentScripts) {
	    chrome.contentScripts = { register: registerContentScript };
	}

}());
