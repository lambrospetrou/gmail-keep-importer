/*************************************
 * MAKE THE COMMUNICATION WITH THE CONTENT SCRIPT TO GET DOM.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(sender.tab ?
		"from a content script:" + sender.tab.url :
        "from the extension");
    if (request.action == "import.mail.label") {
    	//sendResponse({dom: document.all[0].outerHTML});
    	importMessagesIntoKeep(document, request.label, request.messages);
    	//console.log('Content-Script:: Msg received: ' + JSON.stringify(request.action));
    	sendResponse('Finished importing ' + String(request.messages.length) + ' messages.');
    }
});

/*************************************/

function importMessagesIntoKeep(pageDom, label, messages) {
  	LP.dom = pageDom;

  	messages.forEach(function(message, index, array) {
  		if (!message.decodedPayload) { return; }
  		//console.info('message ', index, message.decodedPayload);
  		createKeepNote(message.decodedPayload);
  	});

  	//createKeepNote('Hello LP plugin');
}
