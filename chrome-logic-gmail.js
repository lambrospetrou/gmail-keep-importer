/*********************************** GMAIL ***********************************/
// Your Client ID can be retrieved from your project in the Google
// Change the manifest.json with the right client id
// Developer Console, https://console.developers.google.com
//var CLIENT_ID = '242163669253-u4fmahm4dklc3b1l42paf29netvs5to5.apps.googleusercontent.com'; // CHROME STORE
//var CLIENT_ID = '242163669253-vhppkeaedtsk7gvs92ibvh2nrl79f6nk.apps.googleusercontent.com'; // mac dev
//var CLIENT_ID = '242163669253-ik8dmmtqkh8gskkqaihm8lj3ij2t663e.apps.googleusercontent.com'; // linux dev
//var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'].join(' ');
var GMAIL_API_KEY='<PUT_YOUR_API_KEY_HERE>';
/////////////////////////////////////////////////////////////////////////////////

(function() {

    var LPMail = {
        /**
         * Initiate message fetching.
         */
        importGMailLabel: function(label, cbFn, cbErrorFn) {
            console.info(':: Starting importing messages for label: ', label);
            try {
                listMessagesWrapper(label, cbFn);
            } catch(e) {
                cbErrorFn(e);
            } finally {
                console.info(':: Finished importing messages for label: ', label);
            }
        }
    };

// Final callback with the final messages.
// Will call the callback with all the messages from Gmail that have content
// and are of the specified label.
function buildDecoratedMessagesHandler(cbFn) {
    return function handleLabelMessages(messages) {
        console.log('Decorating finished!');
        console.log(messages);
        // send the messages to the content-script.
        cbFn(messages.filter(function(msg) { return !!msg.decodedPayload; }));
    };
}

/**
 * Starts the fetching of the messages from GMail.
 */
function listMessagesWrapper(label, cbFn) {
    listMessages('me', label, function(messages) {
        //console.log(messages);
        console.log('Received messages from label: ', label);
        console.log('Decorating the messages with decoded body...', messages.length);
        decorateMessages('me', messages, buildDecoratedMessagesHandler(cbFn));
    });
}

/**
 * Retrieve Messages in user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Messages listed.
 * @param  {Function} callback Function to call when the request is complete.
 */
function listMessages(userId, query, callback) {
    function getPageOfMessages(args, result) {
        fetchMessagesList(function(resp) {
            if (!resp.messages || resp.messages.length === 0) { callback(result); return; }
            result = result.concat(resp.messages);
            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
                args = {
                    'userId': userId,
                    'pageToken': nextPageToken,
                    'q': 'label:' + query
                };
                getPageOfMessages(args, result);
            } else {
                var reversed = result.reverse();
                callback(reversed); return;
            }
        }, args);
    }
    var args = {
        'userId': userId,
        'q': 'label:' + query
    };
    getPageOfMessages(args, []);
}

/*
 * Queries the GMail API for the full content of each message given.
 * It adds to the final messages the Base64 decoded body message.
 */
function decorateMessages(userId, messages, callback) {
    console.log(messages);
    if (!messages || messages.length === 0) { console.log("No messages"); callback([]); return; }
    var i = 0;
    var totalMessages = messages.length;

    var getMessage = function(args, result) {
        fetchMessage(function(resp) {
            result[i].email = resp;
            var part = extractBodyPayload(resp);
            if (!!part) {
                result[i].decodedPayload = part;
                //console.log(part);
            }
            i += 1;
            var finished = i === totalMessages;
            if (!finished) {
                var currentMessage = result[i];
                args = {
                    'userId': userId,
                    'id': currentMessage.id,
                    'format': 'full'
                };

                getMessage(args, result);
            } else {
                callback(result);
            }
        }, args);
    };
    var args = {
        'userId': userId,
        'id': messages[0].id,
        'format': 'full'
    };
    getMessage(args, messages);
}

function extractBodyPayload(email) {
    payload = extractBodyPayloadMime(email.payload);
    if (payload && payload.body && payload.body.size && payload.body.size > 0) {
        if (payload.mimeType.toLowerCase() === "text/plain") {
            return convertPlainToText(payload.body.data);
        } else if (payload.mimeType.toLowerCase() === "text/html") {
            return convertHtmlToText(payload.body.data);
        }
    }
    return null;
}

function extractBodyPayloadMime(payload) {
    //console.info(payload, mimeType);
    if ((payload.mimeType.toLowerCase() === "text/html") || (payload.mimeType.toLowerCase() === "text/plain")) {
        return payload;
    } else if ((payload.mimeType.toLowerCase().indexOf("multipart") === 0) && payload.parts) {
        var validParts = payload.parts.map(function(part) {
            return extractBodyPayloadMime(part);
        }).filter(function(payload) {
            return !!payload;
        });
        //console.log('Valid parts', validParts);
        if (validParts && validParts.length > 0) {
            return validParts[0];
        } else {
            return null;
        }
    }
    console.info('Unsupported email response format!', payload);
    return null;
}

function convertPlainToText(plainText64) {
    return B64.decode(plainText64);
}

function convertHtmlToText(htmlText64) {
    if (!htmlText64) { return ''; }
    var div = document.createElement('div');
    div.innerHTML = B64.decode(htmlText64) || '';
    return div.innerText;
}

// https://developer.chrome.com/apps/tut_oauth
// https://developers.google.com/gmail/api/v1/reference/
function fetchMessagesList(onSuccess, args) {
    var qp = Object.keys(args).map(k => `${k}=${encodeURIComponent(args[k])}`).join('&');
    var userId = args.userId;
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        let init = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            'contentType': 'json'
        };
        fetch(
            `https://www.googleapis.com/gmail/v1/users/${encodeURIComponent(userId)}/messages?key=${GMAIL_API_KEY}&${qp}`, init)
            .then(response => response.json())
            .then(data => onSuccess(data));
    });
}

function fetchMessage(onSuccess, args) {
    var qp = Object.keys(args).map(k => `${k}=${encodeURIComponent(args[k])}`).join('&');
    var userId = args.userId;
    var msgId = args.id;
    chrome.identity.getAuthToken({interactive: true}, function(token) {
        let init = {
            method: 'GET',
            async: true,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            'contentType': 'json'
        };
        fetch(
            `https://www.googleapis.com/gmail/v1/users/${encodeURIComponent(userId)}/messages/${msgId}?key=${GMAIL_API_KEY}&${qp}`, init)
            .then(response => response.json())
            .then(data => onSuccess(data));
    });
}

this.LPMail = LPMail;

}).call(this);
