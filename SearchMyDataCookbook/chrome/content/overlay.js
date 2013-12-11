// windows preferences dialog is funny
// need to host add-on on  mozilla (need certificate?)



var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefBranch);



var SearchMyDataCookbook = {
	onLoad: function() {
		// initialization code
		this.initialized = true;
		this.strings = document.getElementById("SearchMyDataCookbook-strings");
	},


	onMenuItemCommand: function(e) {
		var search = getBrowserSelection();
		toggleSidebar('viewSidebar_SearchMyDataCookbook',true);
		var sidebarWindow=document.getElementById("sidebar").contentWindow;
		if (sidebarWindow.location.href == "chrome://searchmydatacookbook/content/ff-sidebar.xul") {
			sidebarWindow.updateContent(search,'search in progress... please wait.');
		} 
		request = new dcb_serviceRequest();
		request.requestType = 'term_search';
		request.service_url = DCB_BASE_URL + '/institution/terms/search';
		request.search = search;
		
		
		if (request.username > "" && request.password > "") {
			//
			// Standard AJAX load request, results are posted into a document element
			//
			var requestURL = request.createRequestURL();
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", requestURL, true); 
			xmlhttp.onreadystatechange = function() { 
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var sidebarWindow=document.getElementById("sidebar").contentWindow;
					if (sidebarWindow.location.href == "chrome://searchmydatacookbook/content/ff-sidebar.xul") {
						// call "yourNotificationFunction" in the sidebar's context:
						var responseText = xmlhttp.responseText;
						
						sidebarWindow.updateContent(getBrowserSelection(),responseText.replace(/a href/gi, 'a target="_blank" href'));
					} 

				} 
			} 
			xmlhttp.send(null); 
		} else {
			var sidebarWindow=document.getElementById("sidebar").contentWindow;
			if (sidebarWindow.location.href == "chrome://searchmydatacookbook/content/ff-sidebar.xul") {
				// call "yourNotificationFunction" in the sidebar's context:
				sidebarWindow.updateContent(getBrowserSelection(),"Your preferences are not complete.  Please specify your Data Cookbook account and login information by clicking on the preferences button at the bottom of this window.");
			} 
		}

		
/*
		var requestURL = '';

		// create an IDataService object.
		request = new IDataService();
		
		// set up the request
		request.requestType = "term_search";
		request.search = getBrowserSelection();
		request.username = prefManager.getCharPref("extensions.SearchMyDataCookbook.login");
		request.password = prefManager.getCharPref("extensions.SearchMyDataCookbook.password");
		request.SERVICE_URL_HOST = prefManager.getCharPref("extensions.SearchMyDataCookbook.account") + ".datacookbook.com";

		request.SERVICE_PROTOCOL = IDATA_SERVICE_PROTOCOL;
		request.SERVICE_URL_PATH = request.SERVICE_URL_PATH_TERM_SEARCH;
		request.outputFormat = "json";
		request.jsonFunction = request.SERVICE_CALLBACK;

		requestURL = request.createRequestURL();

		toggleSidebar('viewSidebar_SearchMyDataCookbook',true);
		
		if (request.username > "" && request.password > "") {
			//
			// Standard AJAX load request, results are posted into a document element
			//
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", requestURL, true); 
			xmlhttp.onreadystatechange = function() { 
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) { 
					var sidebarWindow=document.getElementById("sidebar").contentWindow;
					if (sidebarWindow.location.href == "chrome://searchmydatacookbook/content/ff-sidebar.xul") {
						// call "yourNotificationFunction" in the sidebar's context:
						var responseText = xmlhttp.responseText;
						
						sidebarWindow.updateContent(getBrowserSelection(),responseText.replace(/a href/gi, 'a target="_blank" href'));
						alert("received text back from the ajax call: " + responseText);
					} 
				} 
			} 
			xmlhttp.send(null); 
		} else {
			var sidebarWindow=document.getElementById("sidebar").contentWindow;
			if (sidebarWindow.location.href == "chrome://searchmydatacookbook/content/ff-sidebar.xul") {
				// call "yourNotificationFunction" in the sidebar's context:
				sidebarWindow.updateContent(getBrowserSelection(),"Your preferences are not complete.  Please specify your Data Cookbook account and login information by clicking on the preferences button at the bottom of this window.");
			} 
		}
*/
	},

	onToolbarButtonCommand: function(e) {
		// just reuse the function above.  you can change this, obviously!
		SearchMyDataCookbook.onMenuItemCommand(e);
	}
};


window.addEventListener("load", SearchMyDataCookbook.onLoad, false);


DCB_USERNAME = prefManager.getCharPref("extensions.SearchMyDataCookbook.login");
DCB_PASSWORD = prefManager.getCharPref("extensions.SearchMyDataCookbook.password");
DCB_SUBDOMAIN = prefManager.getCharPref("extensions.SearchMyDataCookbook.account");



// This currently supports term_search, and report_information ( which groups report_lookup and report_termlist together)
//
// To add a new API, you will need to add a new section in both dcb_processEvents and dcb_processResponse
// as well as modifying the HTML that calls this to pass in your new requestType
//
// Initializations:
//
// set the URL for all service requests, assumes DCB_SUBDOMAIN is set BEFORE this script
// we also have an assumption that DCB_USERNAME and DCB_PASSWORD are set BEFORE this script
// a better implementation is to establish a token using the service_login API first
//
DCB_BASE_URL = 'https://' + DCB_SUBDOMAIN + '.datacookbook.com';
//
// set the standard parameter names for constructing URLs
//
PARAM_USERNAME = 'un';
PARAM_PASSWORD = 'pw';
PARAM_TOKEN = 'OR';
PARAM_REQUEST_TYPE = 'requestType';
PARAM_LOOKUP = 'lookup';
PARAM_SEARCH = 'search';
PARAM_JSON_FUNCTION = 'jsonFunction';
PARAM_JSON_VARIABLE = 'jsonVariable';
PARAM_OUTPUT_FORMAT = 'outputFormat';
PARAM_MATCH_TYPE = 'matchType';

///////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Main class definition for an API call
//
function dcb_serviceRequest() {
	//
	// these are standard for every instance of this class
	//
	this.token = '';
	this.username = DCB_USERNAME;
	this.password = DCB_PASSWORD;
	this.outputFormat = 'html';
	this.jsonFunction = 'dcb_processResponse';
	this.jsonFunction = '';
	this.jsonVariable = '';
	//
	// these should be set based on form data when creating an instance
	//
	this.requestType = '';
	this.lookup = '';
	this.search = '';
	this.matchType = '';
	this.service_url = '';
	// 
	// Pieces together the arguments for the request URL
	//
	this.createRequestURL = function() {
		// initialize the variable to hold the complete URL being constructed
		var URL_OUT = this.service_url;

		// set the first paramater prefix, after the first one, a & will be used.
		var paramPrefix = '?';

		// see what properties have values, append those with values.

		if ( this.requestType != '' ) {
			URL_OUT += paramPrefix + PARAM_REQUEST_TYPE + "=" + this.requestType;
			paramPrefix = '&';
		}
		if ( this.username != '' ) {
			URL_OUT += paramPrefix + PARAM_USERNAME + "=" + this.username;
			paramPrefix = '&';
		}
		if ( this.token != '' ) {
			URL_OUT += paramPrefix + PARAM_TOKEN + "=" + this.token;
			paramPrefix = '&';
		}
		if ( this.password != '' ) {
			URL_OUT += paramPrefix + PARAM_PASSWORD + "=" + this.password;
			paramPrefix = '&';
		}
		if ( this.outputFormat != '' ) {
			URL_OUT += paramPrefix + PARAM_OUTPUT_FORMAT + "=" + this.outputFormat;
			paramPrefix = '&';
		}
		if ( this.jsonFunction != '' ) {
			URL_OUT += paramPrefix + PARAM_JSON_FUNCTION + "=" + this.jsonFunction;
			paramPrefix = '&';
		}
		if ( this.jsonVariable != '' ) {
			URL_OUT += paramPrefix + PARAM_JSON_VARIABLE + "=" + this.jsonVariable;
			paramPrefix = '&';
		}
		if ( this.matchType != '' ) {
			URL_OUT += paramPrefix + PARAM_MATCH_TYPE + "=" + this.matchType;
			paramPrefix = '&';
		}
		if ( this.lookup != '' ) {
			URL_OUT += paramPrefix + PARAM_LOOKUP + "=" + this.lookup;
			paramPrefix = '&';
		}
		if ( this.search != '' ) {
			URL_OUT += paramPrefix + PARAM_SEARCH + "=" + this.search;
			paramPrefix = '&';
		}

		return URL_OUT;
	};

	//
	// Outputs contents of this object as a string.
	//
	// @return string - contents of this object.	
	//
	this.outputContents = function() {
		// return reference
		var string_OUT = '';

		// declare variables
		var currentPropName = '';
		var outputArray = new Array();
		var itemCount = 0;
		var currentValue = '';
		var currentValueType = '';

		// loop over properties
		for( currentPropName in this ) {
			// add current property to output array
			currentValue = this[ currentPropName ];

			// only output strings, numbers, and booleans.
			currentValueType = typeof( currentValue );
			if ( ( currentValueType == "string" ) || ( currentValueType == "number" ) || ( currentValueType == "boolean" ) ) {
				outputArray[ itemCount ] = currentPropName + "=\"" + this[ currentPropName ] + "\"";
				itemCount++;
			}
		}
		// join the items in array together with "; ".
		string_OUT = outputArray.join( ";\n " );
		// append name of this class to the front.
		string_OUT = "Contents of service request: " + string_OUT;
		return string_OUT;
	};

	//
	// Uses variables internal to this object to create the URL of the JSONP
	// javascript include service for our request, then writes the request
	// into a script tag at the end of the document
	//
	this.submitRequest = function() {
		// declare variables
		var requestURL = '';
		var scriptElement = null;

		// get request URL
		requestURL = this.createRequestURL();

		alert('URL created: ' + requestURL);
		
		//
		// Insert the script into the document body
		//		
		scriptElement = document.createElement( "script" );
		scriptElement.setAttribute( "src", requestURL );
		scriptElement.setAttribute( "type", "text/javascript" );
		document.body.appendChild( scriptElement );
	};

}


