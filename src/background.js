const scriptId = "conventional-comments-button";
const defaultHost = 'https://gitlab.com';

async function registerContentScripts(hosts)
{
  hosts = hosts.split(',');
  
  for (var index in hosts) {
    hosts[index] += "/*";
  }

  await chrome.scripting.registerContentScripts([{
    id: scriptId,
    matches: hosts,
    js: ["src/inject/inject.js"],
    css: ["src/inject/inject.css"],
    runAt: "document_idle",
  }]);
}

chrome.storage.sync.get({hosts: defaultHost}, async function(result) {
  console.log('Hosts is currently ', result);

  var hosts = result.hosts;

  console.log('Setting hosts to ' + hosts);
  registerContentScripts(hosts);

});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (changes['hosts']) {
      await chrome.scripting.unregisterContentScripts({ids: [scriptId]});
      console.log("Setting new hosts to " + changes['hosts']['newValue']);
      await registerContentScripts(changes['hosts']['newValue']);
    }
  }
)