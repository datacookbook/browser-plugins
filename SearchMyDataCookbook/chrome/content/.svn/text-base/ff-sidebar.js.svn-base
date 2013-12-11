var mainWindow = null;

function startup() {
  mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);

  // Sidebar is loaded and mainwindow is ready                   
}

function shutdown() {
  // Sidebar is unloading
}

function updateContent( searchText, updateText ) {

	updateText = '<h3>Results for: "' + searchText + '"</h3>' + updateText;
	
	// get the HTML div element that is inside the custom XUL tooltip
	var div = document.getElementById("SearchMyDataCookbook-Results-Div");
	
	//clear the HTML div element of any prior shown custom HTML 
	while(div.firstChild) 
		div.removeChild(div.firstChild);
	
	//safely convert HTML string to a simple DOM object, striping it of javascript and more complex tags
	var injectHTML = Components.classes["@mozilla.org/feed-unescapehtml;1"] 
	.getService(Components.interfaces.nsIScriptableUnescapeHTML) 
	.parseFragment(updateText, false, null, div); 
	
	//attach the DOM object to the HTML div element 
	div.appendChild(injectHTML);
}


window.addEventListener("load", startup, false);
window.addEventListener("unload", shutdown, false);
