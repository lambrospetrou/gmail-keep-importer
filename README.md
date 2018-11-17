# LP Gmail-Keep Importer

Easily imports your Gmail messages into Google Keep. Can also be used to transfer your Apple Notes, which are stored as emails labelled 'Notes', into Google Keep.

## Notes

* This is a highly **experimental** Chrome extension.
* Since Google Keep does not provide any open API I am using directly the website of the service. Therefore, in order for you to use the extension you **have to** be logged in to your account and be on the Google Keep website. - https://keep.google.com/#home
* **Caution** - The extension might become unusable at any time in case Google updates the website of Google Keep since the structure of the page (class names) is used throughout the extension. I will try to update it whenever I notice something broke.

## How to use

Full instruction is here: https://developer.chrome.com/apps/tut_oauth

*Long-story short:*
1. First clone/download this plugin from this repo
2. Now visit the https://chrome.google.com/webstore/developer/dashboard website 
3. Package the extension directory into a .zip file and upload it to the Chrome Developer Dashboard without publishing it (save as draft)
4. Enter your extension **public key** in manifest.json ("key" field)
5. Now visit the https://developer.chrome.com/apps/tut\_oauth\#oauth_client and read about get **API key** and **OAuth 2.0 Client ID**
6. Enter Client ID in manifest.json and enter API key in 'chrome-logic-gmail.js' twice
7. On chrome://extensions page load this extension (before this turn on "Developer Mode")
6. Click **Import GMail Label** and then if some email messages are ready to be imported click **Start importing**.
6. Done ;)

## Todos - Future work

* Add titles in Google Keep (email subject or 1st line of the message). **Done since v0.10**
* Use the labels of the email as tags in Google Keep.
* **Most importantly** - Find a way to make it robust against Google's changes on the website.

## Feedback / Suggestions

Please provide some feedback with the errors you get or suggestions you have.

### Debug the extension

* Visit chrome://extensions
* Enable the **Developer Mode**
* Open the **Console** from Chrome's developer tools
    * **Right click** the extension's icon
    * Click **Inspect Popup**
    * Open the **Console** tab in order to see any error message or logging message
* Follow the **How to use** procedure again
