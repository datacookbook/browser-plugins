
/*
 * file: IData-termSearch-API.js
 * purpose: Implements integration of IData term search API code with a web
 *    site.  Is essentially a widget.
 * preconditions: This javascript should be loaded before you try to place term
 *    search HTML on the page, so it is available.
 */

/*
 * Function: IDataService_processResponse( data_IN )
 * Accepts JSON object structured as follows:
{
	ServiceName : "term_search",
	ResponseStatus : {
		ResponseCode : 0,
		ResponseMessage : "Success!"
	},
	TermList : [
		{
			"version": {
				"perma_link_url": "http://idata.datacookbook.com/institution/terms/154",
				"name": "Admitted student",
				"term_id": 154,
				"id": 184,
				"term_functional_definition": "Applicant who is offered admission to a degree-granting program at your institution."
			}
		},
		{
			"version": {
				"perma_link_url": "http://idata.datacookbook.com/institution/terms/159",
				"name": "Books and supplies",
				"term_id": 159,
				"id": 189,
				"term_functional_definition": "Average cost of books and supplies. Do not include unusual costs for special groups of students (e.g., engineering or art majors), unless they constitute the majority of students at your institution."
			}
		}
	]
}
 * Processes the information within, outputs an alert if there is an error,
 *    either in the processing of the request or indicated by the status code
 *    returned from the service.
 * postconditions: If cookies are passed in this object, sets them all before
 *    exiting.
 */
function IDataService_processResponse( data_IN )
{
    // declare variables
    var DIV_ID_TERM_SEARCH_OUTPUT = 'data_cookbook_search_results';
    var HTML_NO_MATCHES_FOUND = '<div class="Events_ListItem event"><span class=\"vevent\"><div class="eventTitle summary"><div class="eventTitle summary"><p>Search completed.  No matches found for search term.</p></div></span></div>';
    var requestType = '';
    var responseCode = '';
    var responseMessage = '';
    var termList = '';
    var termCount = -1;
    var termListIndex = -1;
    var currentTerm = null;
    var termName = '';
    var termFunctionalDefinition = '';
    var termUrl = '';
    var resultsElement = '';
    var headerElement = '';
    var headerTextElement = null;
    var listElement = '';
    var termListHtml = '';
    var bodyElement = '';

    alert( "In callback IDataService_processResponse, data: " + data_IN );

    // get response status
    responseCode = data_IN.ResponseStatus.ResponseCode;
    responseMessage = data_IN.ResponseStatus.ResponseMessage;

    // if success (code = 0), get requestType
    if ( responseCode == 0 )
    {
        // success.  Get request type to see what we need to do now.
        requestType = data_IN.ServiceName;
        //alert( "Request succeeded. ServiceName = " + requestType );

        // got a request type?
        if ( requestType != '' )
        {
            // if term search, build HTML output of returned search
            //    results.
            if ( ( requestType == "term_search" ) || ( requestType == 'term_lookup' ) )
            {
                // set up the results area.
                // get the div into which we will place the HTML, clear it
                //    out, then set it to invisible.
                resultsElement = document.getElementById( DIV_ID_TERM_SEARCH_OUTPUT );
                resultsElement.style.display = "none";
                resultsElement.innerHTML = "";

                // create the results header  HTML string
                headerElement = document.createElement( "div" );
                headerElement.setAttribute( "class", "viewHeader" );

                // add a br
                headerElement.appendChild( document.createElement( "br" ) )

                // add results title
                headerTextElement = document.createElement( "h3" );
                headerTextElement.appendChild( document.createTextNode("Search Results") );
                headerElement.appendChild( headerTextElement );

                // append to results
                resultsElement.appendChild( headerElement );

                // now, build and attach the element that will hold the
                //    returned search terms
                bodyElement = document.createElement( "div" );
                bodyElement.setAttribute( "class", "viewBody" );
                // bodyElement.appendChild( document.createElement( "br" ) );
                resultsElement.appendChild( bodyElement );

                listElement = document.createElement( "div" );
                listElement.setAttribute( "class", "eventList Events_List" );
                bodyElement.appendChild( listElement );

                // loop over term array, load and render each
                //    term in the list.
                termList = data_IN.TermList;

                // got a term list?
                if ( termList != null )
                {
                    // get count, see if we have terms.
                    termCount = termList.length;
                    if ( termCount > 0 )
                    {
                        // got at least one term.  Get the element we will store the
                        //    results in, then output stuff that goes before the
                        //    list of terms.

                        // got at least three terms?
                        if ( termCount > 3 )
                        {
                            // yes!  Set height and make box scroll.
                            bodyElement.style.height = "300px";
                            //resultsElement.style.width = "100px";
                            bodyElement.style.overflow = "scroll";
                        }

                        //alert( "Request type has terms.  Before loop. Term count: " + termCount );
                        for( termListIndex = 0; termListIndex < termCount; termListIndex++ )
                        {
                            //alert( "Top of term loop. Term index: " + termListIndex );
                            // get next term to process.
                            currentTerm = termList[ termListIndex ][ 'version' ];

                            // get cookie properties
                            //cookieName = currentCookie.Name + "_test";
                            termName = currentTerm.name;
                            termFunctionalDefinition = currentTerm.term_functional_definition;
                            termUrl = currentTerm.perma_link_url;

                            //alert( "In term loop. Values for term " + termListIndex + ": name=" + termName + ", URL=" + termUrl + ", functional definition=" + termFunctionalDefinition );

                            // create list HTML for term.
                            termListHtml += "<div class=\"Events_ListItem event\">\n";
                            termListHtml += "<span class=\"vevent\">\n";
                            termListHtml += "<div class=\"eventTitle summary\">\n";
                            termListHtml += "<a class=\"eventLink url\" href=\"" + termUrl + "\">" + termName + "</a>\n";
                            termListHtml += "</div>\n";
                            termListHtml += "<div class=\"eventTitle summary\">\n";
                            termListHtml += "<p>" + termFunctionalDefinition + "</p>\n";
                            termListHtml += "</div>\n";
                            termListHtml += "</span>\n";
                            termListHtml += "</div>\n";

                            //alert( "Outputting term: " + termHtml );
                            // output the HTML

                        } //-- end loop over terms. --//

                        // put the list of terms in the list element
                        listElement.innerHTML = termListHtml;

                    } //-- end check to see if we have any terms --//
                    else //-- no matches found. --//
                    {
                        listElement.innerHTML = HTML_NO_MATCHES_FOUND;
                    }

                }
                else
                {
                    // no terms returned.  Output a no results message.
                    listElement.innerHTML = HTML_NO_MATCHES_FOUND;
                }

                 // done with the loop, so make visible
                resultsElement.style.display = "block";

            } //-- end conditional to find known services. --//
            else
            {
                alert( "Error processing IData Data Cookbook service request: Service " + requestType + " unknown.  ResponseCode: " + responseCode + "; ResponseMessage: " + responseMessage );
            }
        }
        else //-- no request type in response - which service? --//
        {
            // no request type returned.  Error.
            alert( "Error processing IData Data Cookbook service request: No service type returned.  ResponseCode: " + responseCode + "; ResponseMessage: " + responseMessage );
        }
    }
    else //-- error response code returned --//
    {
        // error.  Output alert, do nothing.
        alert( "Error processing IData Data Cookbook service request:  Error code returned.  ResponseCode: " + responseCode + "; ResponseMessage: " + responseMessage );
    }
} //-- end function IDataService_processResponse --//


/*
 * IDataService class holds variables and methods for integrating
 *    with IData Data Cookbook services.
 */
function IDataService()
{
	// declare variables
	//this.SERVICE_PROTOCOL = 'https';
        this.SERVICE_URL_PREFIX = '://';
        //this.SERVICE_URL_HOST = 'idatau.demo.datacookbook.com';
        this.SERVICE_URL_PATH_TERM_SEARCH = '/institution/terms/search';
        this.SERVICE_URL_PATH_TERM_LOOKUP = '/institution/terms/lookup';
        this.SERVICE_URL_PATH = this.SERVICE_URL_PATH_TERM_SEARCH;
	this.SERVICE_DIV_ID = 'IDataServiceInclude';
	this.SERVICE_CALLBACK = 'IDataService.processResponse';

	// required parameter names for GET/POST parameters.
        this.PARAM_PASSWORD = 'pw';
	this.PARAM_REQUEST_TYPE = 'requestType';
        this.PARAM_SEARCH = 'search';
        this.PARAM_USERNAME = 'un';

        // optional parameters
        this.PARAM_JSON_FUNCTION = 'jsonFunction';
        this.PARAM_JSON_VARIABLE = 'jsonVariable';
        this.PARAM_OUTPUT_FORMAT = 'outputFormat';

        // parameters for lookup
        this.PARAM_LOOKUP = 'lookup';
        this.PARAM_MATCH_TYPE = 'matchType';

	// parameter values
	this.PARAM_VALUE_REQUEST_TYPE_TERM_SEARCH = 'term_search';
        this.PARAM_VALUE_REQUEST_TYPE_TERM_LOOKUP = 'term_lookup';
	this.PARAM_VALUE_OUTPUT_FORMAT_JSON = 'json';
        this.PARAM_VALUE_MATCH_TYPE_EXACT_TEXT = 'exact_text';

	// instance variables to hold parameters for request, from GCION cookie.
	this.jsonFunction = '';
        this.jsonVariable = '';
	this.outputFormat = '';
	this.password = '';
        this.requestType = '';
        this.search = '';
	this.username = '';

        // variables for term_lookup request type.
        this.lookup = '';
        this.matchType = '';

	// bind functions
	this.processResponse = IDataService_processResponse;

	// declare functions
	/**
	 * Uses variables internal to this object to create the URL of the JSONP
	 *    javascript include service for our request. Returns URL.
	 * preconditions: the variables in this object must have been populated from
	 *    the GMTI user objects (which GMTI tells us are changing with their
	 *    next UserAuth Release, so keep that in mind).
	 *
	 * @return String - request URL for IData service.
	 */
	this.createRequestURL = function()
	{
		// return reference
		var URL_OUT = '';

		// declare variables
		var paramPrefix = '?';

		// first, create the URL.
		URL_OUT = this.SERVICE_PROTOCOL + this.SERVICE_URL_PREFIX + this.SERVICE_URL_HOST + this.SERVICE_URL_PATH;

		// see what properties have values, append those with values.

		// request type - this.requestType
		if ( this.requestType != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_REQUEST_TYPE + "=" + this.requestType;
			paramPrefix = '&';
		}

		// username value - this.username
		if ( this.username != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_USERNAME + "=" + this.username;
			paramPrefix = '&';
		}

		// password value - this.password
		if ( this.password != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_PASSWORD + "=" + this.password;
			paramPrefix = '&';
		}

		// search value - this.search
		if ( this.search != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_SEARCH + "=" + this.search;
			paramPrefix = '&';
		}

		// output format value - this.outputFormat
		if ( this.outputFormat != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_OUTPUT_FORMAT + "=" + this.outputFormat;
			paramPrefix = '&';
		}

		// JSON callback function name - this.jsonFunction
		if ( this.jsonFunction != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_JSON_FUNCTION + "=" + this.jsonFunction;
			paramPrefix = '&';
		}

		// JSON assignment variable name - this.jsonVariable
		if ( this.jsonVariable != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_JSON_VARIABLE + "=" + this.jsonVariable;
			paramPrefix = '&';
		}

		// match type - this.matchType
		if ( this.matchType != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_MATCH_TYPE + "=" + this.matchType;
			paramPrefix = '&';
		}

		// lookup value - this.lookup
		if ( this.lookup != '' )
		{
			URL_OUT += paramPrefix + this.PARAM_LOOKUP + "=" + this.lookup;
			paramPrefix = '&';
		}

                return URL_OUT;
	}; //-- end function createRequestURL() --//


	/**
	 * Outputs contents of this object as a string.
	 *
	 * @return string - contents of this object.
	 */
	this.outputContents = function()
	{
		// return reference
		var string_OUT = '';

		// declare variables
		var currentPropName = '';
		var outputArray = new Array();
		var itemCount = 0;
		var currentValue = '';
		var currentValueType = '';

		// loop over properties
		for( currentPropName in this )
		{
			// add current property to output array
			currentValue = this[ currentPropName ];

			// only output strings, numbers, and booleans.
			currentValueType = typeof( currentValue );
			if ( ( currentValueType == "string" ) || ( currentValueType == "number" ) || ( currentValueType == "boolean" ) )
			{
				outputArray[ itemCount ] = currentPropName + "=\"" + this[ currentPropName ] + "\"";
				itemCount++;
			}
		}

		// join the items in array together with "; ".
		string_OUT = outputArray.join( ";\n " );

		// append name of this class to the front.
		string_OUT = "Contents of IDataService instance: " + string_OUT;

		return string_OUT;
	} //-- end function outputContents() --//


} //-- end IDataService constructor/class definition --//

//==============================================================================
// class-level stuff
//==============================================================================

// static functions
IDataService.processResponse = IDataService_processResponse;

// static variables
IDataService.PARAM_VALUE_REQUEST_TYPE_TERM_SEARCH = 'term_search';
IDataService.PARAM_VALUE_REQUEST_TYPE_TERM_LOOKUP = 'term_lookup';
IDataService.PARAM_VALUE_OUTPUT_FORMAT_JSON = 'json';

IDATA_SERVICE_PROTOCOL = 'https';

/*
 * Accepts request type value, uses it to create service instance, populates the
 *    instance from the GCIONID cookie, then invokes the service and deals with
 *    the result.
 */
function IDataService_processEvents( formID_IN )
{
    // declare variables
    var formElement = null;
    var requestType = '';
    var searchString = '';
    var exactMatchFlag = '';
    var request = null;


    //alert( "In IDataService_processUAEvents, event = " + eventID_IN );

    // got a form ID?
    if ( formID_IN != '' )
    {
        // retrieve the form element
        formElement = document.getElementById( formID_IN );

        // retrieve request type
        requestType = formElement.IData_requestType.value;

        // see if the exact match checkbox is present.
        if ( typeof( formElement.IData_exact_text ) != 'undefined' )
        {
            // the field is there - get its checked value.
            exactMatchFlag = formElement.IData_exact_text.checked;

            // see if we are checked.
            if ( exactMatchFlag == true )
            {
                // it is checked.  Switch request type to TERM_LOOKUP.
                requestType = IDataService.PARAM_VALUE_REQUEST_TYPE_TERM_LOOKUP;
            }
        }

        // got a request type?
        if ( requestType == IDataService.PARAM_VALUE_REQUEST_TYPE_TERM_SEARCH )
        {
            // search.  Do we have a search string?
            searchString = formElement.IData_search.value;
            if ( searchString != '' )
            {
                // create an IDataService object.
                request = new IDataService();

                // set up the request
                request.requestType = requestType;
                request.search = searchString;
                request.username = IDATA_SERVICE_USERNAME;
                request.password = IDATA_SERVICE_PASSWORD;
                request.SERVICE_PROTOCOL = IDATA_SERVICE_PROTOCOL;
                request.SERVICE_URL_HOST = IDATA_SERVICE_HOST;
                request.SERVICE_URL_PATH = request.SERVICE_URL_PATH_TERM_SEARCH;
                request.outputFormat = IDataService.PARAM_VALUE_OUTPUT_FORMAT_JSON;
                request.jsonFunction = request.SERVICE_CALLBACK;

                //alert( "Contents of request: " + request.outputContents() );

                // run the request
                request.submitRequest();
            }
            else
            {
                alert( "No search string, so no search." );
            }
        }
        else if ( requestType == IDataService.PARAM_VALUE_REQUEST_TYPE_TERM_LOOKUP )
        {
            // search.  Do we have a search string?
            searchString = formElement.IData_search.value;
            if ( searchString != '' )
            {
                // create a IDataService object.
                request = new IDataService();

                // set up the request
                request.requestType = requestType;
                request.lookup = searchString;
                request.username = IDATA_SERVICE_USERNAME;
                request.password = IDATA_SERVICE_PASSWORD;
                request.SERVICE_PROTOCOL = IDATA_SERVICE_PROTOCOL;
                request.SERVICE_URL_HOST = IDATA_SERVICE_HOST;
                request.SERVICE_URL_PATH = request.SERVICE_URL_PATH_TERM_LOOKUP;
                request.outputFormat = IDataService.PARAM_VALUE_OUTPUT_FORMAT_JSON;
                request.jsonFunction = request.SERVICE_CALLBACK;
                request.matchType = request.PARAM_VALUE_MATCH_TYPE_EXACT_TEXT;

                //alert( "Contents of request: " + request.outputContents() );

                // run the request
                request.submitRequest();
            }
            else
            {
                alert( "No search string, so no search." );
            }
        }
        else //-- no search string. --//
        {
            alert( "Unknown request type " + requestType + "." );
        }
    }
    else
    {
        alert( "Error processing IData service request: No form ID passed in." );
    }

    return false;
} //-- end function IDataService_processEvents() --//

