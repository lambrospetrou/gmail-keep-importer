// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '242163669253-6bn5d979ub7sbvohgemfe46soihad193.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

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
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    if (authorizeDiv) {
        authorizeDiv.style.display = 'none';
    }
    loadGmailApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    if (authorizeDiv) {
        authorizeDiv.style.display = 'inline';
    }
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Gmail API client library. List labels once client library
 * is loaded.
 */
function loadGmailApi() {
  //gapi.client.load('gmail', 'v1', listLabels);
  gapi.client.load('gmail', 'v1', listMessagesWrapper);
}

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
function listLabels() {
  var request = gapi.client.gmail.users.labels.list({
    'userId': 'me'
  });

  request.execute(function(resp) {
    var labels = resp.labels;
    appendPre('Labels:');

    if (labels && labels.length > 0) {
      for (i = 0; i < labels.length; i++) {
        var label = labels[i];
        appendPre(label.name)
      }
    } else {
      appendPre('No Labels found.');
    }
  });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
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
      result = result.concat(resp.messages);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query
        });
        getPageOfMessages(request, result);
      } else {
        callback(result);
      }
    });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
    'userId': userId,
    'q': query
  });
  getPageOfMessages(initialRequest, []);
}

function listMessagesWrapper() {
    listMessages('me', 'DigitalOcean', function(messages) {
        console.log(messages);
        decorateMessages('me', messages, handleLabelMessages);
    });
}

function handleLabelMessages(messages) {
    console.log(messages);
}

function decorateMessages(userId, messages, callback) {
    if (!messages || messages.length === 0) { console.log("No messages"); return; }
    var i = 0;
    var totalMessages = messages.length;

    var getMessage = function(request, result) {
      request.execute(function(resp) {
        result[i].email = resp;
        if (resp.payload.body.size > 0) {
            console.log(resp.payload.body.data);
            result[i].decodedPayload = atob(resp.payload.body.data);
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
