/*(function($) {
  var GroupList = React.createClass({displayName: "GroupList",
    // Standard React API
    render: function() {
      var self = this;
      var prefs = new gadgets.Prefs();

      return (
        React.createElement("div", null, 
          React.createElement("div", null, "Email Address:"),
          React.createElement("div", null, this.state.data.d.results.Email)
        )
      );
    },
    getInitialState: function() {
      return {data: {d: {results: []}}, users: []};
    },
    componentDidMount: function() {
      this.loadGroups();
      gadgets.window.adjustHeight();
    },
    componentDidUpdate: function(prevProps, prevState) {
      gadgets.window.adjustHeight();
    },
    // Gadget Calling SAP Jam API
    // 1. Request resources (OAuth 2.0  Service Name, OData request)
    // 7. Response (OData - JSON, XML)
    // 
    // gadgets.io.makeRequest Parameters
    // ---------------------------------
    // gadgets.io.makeRequest(url, callback, opt_params);
    // url: OData Call URL
    // callback: Callback function used to process the response.
    // opt_params: Additional OData proxy request parameters (shown below):
    //    AUTHORIZATION: The type of authentication to use when fetching the content.
    //    OAUTH_SERVICE_NAME: The nickname the gadget uses to refer to the OAuth <Service> element from its XML spec.
    //    CONTENT_TYPE: The type of content to retrieve at the specified URL.
    loadGroups: function() {
      var self = this;
      gadgets.io.makeRequest("https://developer.sapjam.com/api/v1/OData/Self?$format=json",
        function(result) {
          console.log(result);
          self.setState({data: result.data, users: self.state.users});
          console.log("Email Address: " + this.state.data.d.results.Email);
        },
        {
          AUTHORIZATION: 'OAUTH2',
          OAUTH_SERVICE_NAME: 'gadgetOauth2SAMLBearerFlow',
          CONTENT_TYPE: gadgets.io.ContentType.JSON
        });
    }
  });

  gadgets.util.registerOnLoadHandler(function() {
    React.render(
      React.createElement(GroupList, null),
      document.body
    );
  });
})(jQuery);
*/

function sayHello(){
  console.log(helloMessage);
}

function makeODataCall(){
  //var self = this;
  gadgets.io.makeRequest("https://developer.sapjam.com/api/v1/OData/Self?$format=json",
    function(result) {
      //console.log(result);
      //self.setState({data: result.data, users: self.state.users});
      console.log("Email Address: " + result.data.d.results.Email);
      var emailAddress = result.data.d.results.Email;
      console.log("Email Address: " + emailAddress);
      logODataCall(emailAddress);
    },
    {
      AUTHORIZATION: 'OAUTH2',
      OAUTH_SERVICE_NAME: 'gadgetOauth2SAMLBearerFlow',
      CONTENT_TYPE: gadgets.io.ContentType.JSON
    });
}

function logODataCall(){
  console.log("Email Address: " + emailAddress);
}

// Initializes gadget, sets callbacks
function init() {
    sayHello();
    makeODataCall();
}

var helloMessage = "Hello there";

// Initializes gadget after receiving a notification that the page is loaded and the DOM is ready.
gadgets.util.registerOnLoadHandler(init);
//init();