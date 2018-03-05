/*************************************
 * MAKE THE COMMUNICATION WITH THE CONTENT SCRIPT TO GET DOM.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.action == "import.mail.label") {
        console.info('Content-Script received request for import task to Keep...');
        //console.log('Content-Script:: Msg received: ' + JSON.stringify(request.action));

        //sendResponse({dom: document.all[0].outerHTML});
        try {
            importMessagesIntoKeep(document, request.label, request.messages);

            sendResponse('Finished importing ' + String(request.messages.length) + ' messages.');
        } catch (e) {
            sendResponse('Error while importing ' + String(e));
        }
    }

});

/*************************************/

function importMessagesIntoKeep(pageDom, label, messages) {
    LPKeep.setDom(pageDom);

    messages.forEach(function(message, index, array) {
        if (!message.decodedPayload) { return; }
        console.info('message ', index, message.decodedPayload);
        LPKeep.createKeepNote(message.decodedPayload);
    });
}
