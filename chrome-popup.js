/*************************************
 * MAKE THE COMMUNICATION WITH THE CONTENT SCRIPT TO GET DOM.
 */
document.addEventListener('DOMContentLoaded', function() {
    var btnImport = document.querySelector('#btnImport');

    btnImport.addEventListener('click', function() {
        var label = document.querySelector('#txtLabel').value;
        chrome.tabs.getSelected(null, tabSelectedCallbackWrapper(label));
    }, false);

    document.querySelector('#dialog-container').classList.add('elem-remove');
    document.querySelector('#loading-container').classList.add('elem-remove');
}, false); // end of DOMContentLoaded

/*************************************/

function tabSelectedCallbackWrapper(label) {
    return function(tab) {
        importClickCallback(tab, label);
    }
}

function importClickCallback(tab, label) {
    console.log('Ready to start importing messages from label: ', label);

    // Hide the result view
    document.querySelector('#dialog-container').classList.add('elem-remove');
    document.querySelector('#loading-container').classList.remove('elem-remove');

    LPMail.importGMailLabel(label, function(messages) {

        document.querySelector('#loading-container').classList.add('elem-remove');

        // Show the result view
        document.querySelector('#dialog-msg').innerHTML = '';
        document.querySelector('#btnImportDialog').classList.add('elem-remove');
        document.querySelector('#dialog-container').classList.remove('elem-remove');

        if (!messages || messages.length === 0) {
            document.querySelector('#dialog-msg').innerHTML = 'No messages can be imported for label: ' + label;
            return;
        }

        // Show the Import button and update the message for the to be imported messages
        document.querySelector('#dialog-msg').innerHTML = "Total messages to import " + String(messages.length);
        document.querySelector('#btnImportDialog').classList.remove('elem-remove');
        document.querySelector('#btnImportDialog').addEventListener('click', function() {
            // send the action to the content-script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                console.info(':: Starting importing of messages into Keep...');

                chrome.tabs.sendMessage(tabs[0].id, {action: "import.mail.label", label: label, messages: messages}, null, function(response) {
                    console.info(':: Finished importing of messages into Keep.');
                    console.log(response);

                    document.querySelector('#dialog-msg').innerHTML = response;
                    document.querySelector('#btnImportDialog').classList.add('elem-remove');
                });
            }); // message action to content-script
        }, false);

    }, function(errorMsg) {
            console.error(errorMsg);
            document.querySelector('#dialog-msg').innerHTML = 'There was a problem while fetching your emails...' + String(error);
            document.querySelector('#btnImportDialog').classList.add('elem-remove');
            document.querySelector('#dialog-container').classList.remove('elem-remove');
       });

}
