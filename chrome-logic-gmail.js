
/*********************************** GMAIL ***********************************/

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
//var CLIENT_ID = '242163669253-6bn5d979ub7sbvohgemfe46soihad193.apps.googleusercontent.com'; // JS
//var CLIENT_ID = '242163669253-u4fmahm4dklc3b1l42paf29netvs5to5.apps.googleusercontent.com'; // CHROME STORE
var CLIENT_ID = '242163669253-6cjg35vha2ghq2fkre864fb79o8a8n6o.apps.googleusercontent.com'; // CHROME - DEV
                 
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

var LPMail = {
  label: null,
  cbFn: null
};


function injectGoogleAPIScript() {
  /*
  var po = document.createElement('script'); po.type = 'text/javascript'; 
  document.body.appendChild(po);
  //var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  po.onload = importGMailLabel;
  po.src = 'https://apis.google.com/js/client.js';
  */
  /*
  var script = document.createElement("script");
  document.body.appendChild(script);
  script.setAttribute("src", "https://apis.google.com/js/client.js?onload=importGMailLabel");
  

  function callbackFn() {
    console.log('IMPORTED GMAIL');
  }
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = "https://apis.google.com/js/client.js?cb=callbackFn";
  head.appendChild(script);
  */
}

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    loadGmailApi();
  } else {
    console.error(authResult);
  }
}

/**
 * Load Gmail API client library. List labels once client library
 * is loaded.
 */
function loadGmailApi() {
  gapi.client.load('gmail', 'v1', function() {
    // gmail api loaded - do stuff now.
    console.info('GMAIL API LOADED...');
  });
}

/**
 * Initiate message fetching.
 */
function importGMailLabel(label, cbFn) {
  LPMail.label = label;
  LPMail.cbFn = cbFn;
  listMessagesWrapper();
}

// Final callback with the final messages
function handleLabelMessages(messages) {
  console.log('Decorating finished!');
  console.log(messages);
  // send the messages to the content-script.
  LPMail.cbFn(messages.filter(function(msg) { return !!msg.decodedPayload; }));
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
  var getPageOfMessages = function(request, result) {
    request.execute(function(resp) {
      if (!resp.messages || resp.messages.length === 0) { callback(result); return; }
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': 'label:' + query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
    'userId': userId,
    'q': 'label:' + query
  });
  getPageOfMessages(initialRequest, []);
}

function listMessagesWrapper() {
    listMessages('me', LPMail.label, function(messages) {
        //console.log(messages);
        console.log('Received messages from label: ', LPMail.label);
        console.log('Decorating the messages...', messages.length);
        decorateMessages('me', messages, handleLabelMessages);
    });
}

function decorateMessages(userId, messages, callback) {
    console.log(messages);
    if (!messages || messages.length === 0) { console.log("No messages"); callback([]); return; }
    var i = 0;
    var totalMessages = messages.length;

    var getMessage = function(request, result) {
      request.execute(function(resp) {
        result[i].email = resp;
        if (resp.payload.body.size > 0) {
            console.log(resp.payload.body.data);
            //result[i].decodedPayload = atob(resp.payload.body.data);
            result[i].decodedPayload = B64.decode(resp.payload.body.data);
        }
        i += 1;
        var finished = i === totalMessages;
        if (!finished) {
          var currentMessage = result[i];
          request = gapi.client.gmail.users.messages.get({
              'userId': userId,
              'id': currentMessage.id,
              'format': 'full'
          });

          getMessage(request, result);
        } else {
          callback(result);
        }
      });
    };
    var initialRequest = gapi.client.gmail.users.messages.get({
        'userId': userId,
        'id': messages[0].id,
        'format': 'full'
    });
    getMessage(initialRequest, messages);
}
