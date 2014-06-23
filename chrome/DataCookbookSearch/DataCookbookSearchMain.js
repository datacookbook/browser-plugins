var DataCookbookSearch = function () {
	var searchString = '';
	
	var sidebarOpen = false;
	
	return {
		/*
		 * Initializes the plugin
		 */
		init : function () {
			/*chrome.contextMenus.create(
				{
					"title" : "Search Data Cookbook For \"%s\"",
					"contexts" : [
						"selection"
					],
					"id" : "contextmenuitem",
					"onclick" : function () { DataCookbookSearch.searchDataCookbook(); }
				}
			);*/
		},
		toggleTheSidebar : function (event) {
			if (sidebarOpen) {
                var el = document.getElementById('DataCookbookSearchResults');
                el.parentNode.removeChild(el);
                sidebarOpen = false;
			} else {
				var sidebar = document.createElement('div');
				sidebar.id = "DataCookbookSearchResults";
				sidebar.innerHTML = "\
					<div id=\"DataCookbookSearchSideBarLogo\"/>\
					<div id=\"DataCookbookSearchResultsDiv\" class=\"IDATA_services\" type=\"content\">\
					<div class=\"IDATA_DC_TermName\">No search results yet</div>\
					<div class=\"IDATA_DC_FunctionalDefinition\">Select some text and right-click to search your Data Cookbook.</div>\
					</div>\
				";
				sidebar.style.cssText = "\
					position:fixed;\
					top:0px;\
					left:0px;\
					width:240px;\
					height:100%;\
					z-index:999999;\
				";
				document.body.appendChild(sidebar);
				
				document.getElementById('DataCookbookSearchSideBarLogo').style.backgroundImage = chrome.extension.getURL("/largelog.png")
				sidebarOpen = true;
			}
		},
		searchDataCookbook : function (event) {
			if (sidebarOpen == true) {
				this.toggleTheSidebar();
			}
			this.toggleTheSidebar();
			
			var requestURL = '';
			
			// create an IDataService object.
			IDataRequest = new IDataService();
			// set up the request
			IDataRequest.requestType = "term_search";
			IDataRequest.search = getSelection();
			IDataRequest.username = '';
			IDataRequest.password = '';
			IDataRequest.SERVICE_URL_HOST = "rochester.datacookbook.com";
			IDataRequest.SERVICE_PROTOCOL = IDATA_SERVICE_PROTOCOL;
			IDataRequest.SERVICE_URL_PATH = IDataRequest.SERVICE_URL_PATH_TERM_SEARCH;
			IDataRequest.outputFormat = "html";
			IDataRequest.jsonFunction = IDataRequest.SERVICE_CALLBACK;
			requestURL = IDataRequest.createRequestURL() + '&uniq=' + Math.round(new Date().getTime() / 1000);
			
			
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", requestURL, true); 
			xmlhttp.onreadystatechange = function() {
				var sidebarWindow = document.getElementById("DataCookbookSearchResultsDiv");
				
				sidebarWindow.innerHTML = '<div class="IDATA_DC_TermName">Searching for terms matching:</div><div class="IDATA_DC_FunctionalDefinition">"' + getSelection() + '"</div>';
			
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					if (xmlhttp.responseText.indexOf('IDATA_services') != -1) {
						var divElement = document.createElement('div');
						divElement.innerHTML = xmlhttp.responseText;
						for (var i = 0; i < divElement.getElementsByTagName('a').length; i++) {
							divElement.getElementsByTagName('a')[i].className = 'IDATA_DC_LINK';
							divElement.getElementsByTagName('a')[i].innerHTML = 'Get more information';
							divElement.getElementsByTagName('a')[i].setAttribute('target', '_blank');
						}
						sidebarWindow.innerHTML = '<div class="IDATA_DC_TermName">Data Cookbook results for:</div><div class="IDATA_DC_FunctionalDefinition">"' + getSelection() + '"</div>' + divElement.innerHTML;
					} else {
						sidebarWindow.innerHTML = '<div class="IDATA_DC_TermName">An error has occured:</div><div class="IDATA_DC_FunctionalDefinition">Please make sure you are authenticated by visiting <a class="IDATA_DC_LINK" href="https://rochester.datacookbook.com/" target="_blank">Data Cookbook</a></div>';
					}
				} 
			} 
			xmlhttp.send(null);
		}
	};
}();

DataCookbookSearch.init();

var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('skin.css');
(document.head||document.documentElement).appendChild(style);

style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('branding.css');
(document.head||document.documentElement).appendChild(style);

/*Handle requests from background.html*/
function handleRequest(
        //The object data with the request params
        request,
        //These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
        sender, sendResponse
        ) {
        if (request.callFunction == "toggleSidebar") {
                DataCookbookSearch.toggleTheSidebar();
		}
}

chrome.extension.onRequest.addListener(handleRequest);

chrome.extension.onMessage.addListener(function (message, sender, callback) {
    if (message.functiontoInvoke == "searchDataCookbook") {
        DataCookbookSearch.searchDataCookbook();
    }
});