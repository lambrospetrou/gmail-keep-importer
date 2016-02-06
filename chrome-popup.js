/*************************************
 * MAKE THE COMMUNICATION WITH THE CONTENT SCRIPT TO GET DOM.
 */
document.addEventListener('DOMContentLoaded', function() {
    var btnImport = document.querySelector('#btnImport');
    var btnAuthorize = document.querySelector('#btnAuthorize');

    btnAuthorize.addEventListener('click', function(event) {
        LPMail.checkAuthClick(onAuthSuccess, onAuthError);
        return false;
    }, false);

    btnImport.addEventListener('click', function() {
        var label = document.querySelector('#txtLabel').value;
        chrome.tabs.getSelected(null, tabSelectedCallbackWrapper(label));
    }, false);

    document.querySelector('#dialog-container').classList.add('elem-remove');
}, false); // end of DOMContentLoaded

/*************************************/

function onAuthSuccess() {
    document.querySelector('#authorize-div').classList.add('elem-remove');
    document.querySelector('#form-div').classList.add('elem-block');
}

function onAuthError(authError, noAlert) {
    console.error(authError);
    if (noAlert !== false) {
        alert('Authentication failed...' + String(authError));
    }
    document.querySelector('#authorize-div').classList.add('elem-block');
    document.querySelector('#form-div').classList.add('elem-remove');
}

function onGogleClientLoaded() {
    LPMail.checkAuthSilent(onAuthSuccess, function(authError) { onAuthError(authError, false) });
}

function tabSelectedCallbackWrapper(label) {
    return function(tab) {
        importClickCallback(tab, label);
    }
}

function importClickCallback(tab, label) {
    console.log('Ready to start importing messages from label: ', label);

    // Hide the result view
    document.querySelector('#dialog-container').classList.add('elem-remove');

    LPMail.importGMailLabel(label, function(messages) {
        
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

                chrome.tabs.sendMessage(tabs[0].id, {action: "import.mail.label", label: label, messages: messages}, function(response) {
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
