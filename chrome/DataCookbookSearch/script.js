/*Handle requests from background.html*/
function handleRequest(
        //The object data with the request params
        request,
        //These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
        sender, sendResponse
        ) {
        if (request.callFunction == "toggleSidebar") {
                DataCookbookSearch.toggleSidebar();
		}
}

chrome.extension.onRequest.addListener(handleRequest);

