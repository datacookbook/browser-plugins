SearchMyDataCookbook.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ SearchMyDataCookbook.showFirefoxContextMenu(e); }, false);
};

SearchMyDataCookbook.showFirefoxContextMenu = function(event) {
	// set hidden to TRUE is NO text is selected
	//  In other words - show this item if they have text selected.
	document.getElementById("context-SearchMyDataCookbook").hidden = !gContextMenu.isContentSelected;
	
	// set the label to contain the selected text  
	var suffix = '';
	if (getBrowserSelection().length > 20)	{
		suffix = '...';
	}
	
	document.getElementById("context-SearchMyDataCookbook").label = 'Search my Data Cookbook for "' + getBrowserSelection().substring(0,20) + suffix + '"';
};

window.addEventListener("load", SearchMyDataCookbook.onFirefoxLoad, false);
