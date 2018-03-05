# LP Gmail-Keep Importer

Easily imports your Gmail messages into Google Keep. Can also be used to transfer your Apple Notes, which are stored as emails labelled 'Notes', into Google Keep.

## Notes

* This is a highly **experimental** Chrome extension.
* Since Google Keep does not provide any open API I am using directly the website of the service. Therefore, in order for you to use the extension you **have to** be logged in to your account and be on the Google Keep website. - https://keep.google.com/#home
* **Caution** - The extension might become unusable at any time in case Google updates the website of Google Keep since the structure of the page (class names) is used throughout the extension. I will try to update it whenever I notice something broke.

## How to use

1. First install the plugin from Chrome extension store: https://chrome.google.com/webstore/detail/lp-gmail-keep-importer/ingomolknmgnfbafknpkmklapabaednn
2. Now visit the Google Keep website and log in, https://keep.google.com/#home
3. Click the **LP G2K** icon on your Chrome extension bar to open the small popup of this extension 
4. Type the label you want to import from Gmail.
5. Click **Import GMail Label** and then if some email messages are ready to be imported click **Start importing**.
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
