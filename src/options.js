// Saves options to chrome.storage
function save_options() {
  var hosts = document.getElementById('hosts').value;
  chrome.storage.sync.set({
    hosts: hosts,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    hosts: 'https://gitlab.com'
  }, function(items) {
    document.getElementById('hosts').value = items.hosts;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);