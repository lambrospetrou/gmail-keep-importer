/*************************************
 * MAKE THE COMMUNICATION WITH THE CONTENT SCRIPT TO GET DOM.
 */
document.addEventListener('DOMContentLoaded', function() {
  var btnImport = document.querySelector('#btnImport');
  
  btnImport.addEventListener('click', function() {
    var label = document.querySelector('#txtLabel').value;
    chrome.tabs.getSelected(null, tabSelectedCallbackWrapper(label));
  }, false);
  
}, false); // end of DOMContentLoaded

/*************************************/

function tabSelectedCallbackWrapper(label) {
  return function(tab) {
    importClickCallback(tab, label);
  }
}

function importClickCallback(tab, label) {
  console.log('Ready to start importing messages from label: ', label);

  importGMailLabel(label, function(messages) {

    if (!messages || messages.length === 0) {
      alert('No messages can be imported for label: ' + label);
      return;
    }

    if (!window.confirm("Total messages to import " + String(messages.length) + '. Continue ?')) { 
      console.info('Importing aborted!!!');
      return;
    }

    // send the action to the content-script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "import.mail.label", label: label, messages: messages}, function(response) {
        console.log(response);

        alert(response);
      });
    }); // message action to content-script
  });

}