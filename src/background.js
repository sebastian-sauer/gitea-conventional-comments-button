const scriptId = "conventional-comments-button";
const defaultHost = 'https://gitea.com';

async function registerContentScripts(hosts) {
  hosts = hosts.split('\n');

  for (var index in hosts) {
    hosts[index] = hosts[index].trim() + "/*";
  }
  await chrome.scripting.registerContentScripts([{
    id: scriptId,
    matches: hosts,
    js: ["src/inject/inject.js"],
    css: ["src/inject/inject.css"],
    runAt: "document_idle",
  }]);
}

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
})

chrome.storage.sync.get({ hosts: defaultHost }, async function (result) {
  console.log('Hosts is currently ', result);

  var hosts = result.hosts;

  console.log('Setting hosts to ' + hosts);
  registerContentScripts(hosts);

});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (changes['hosts']) {
    await chrome.scripting.unregisterContentScripts({ ids: [scriptId] });
    console.log("Setting new hosts to " + changes['hosts']['newValue']);
    await registerContentScripts(changes['hosts']['newValue']);
  }
}
)
