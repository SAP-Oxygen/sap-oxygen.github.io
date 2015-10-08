function makeODataCall(){
  gadgets.io.makeRequest("https://developer.sapjam.com/api/v1/OData/Self?$format=json",
    function(result) {
      console.log("Email Address: " + result.data.d.results.Email);
    },
    {
      AUTHORIZATION: 'OAUTH2',
      OAUTH_SERVICE_NAME: 'gadgetOauth2SAMLBearerFlow',
      CONTENT_TYPE: gadgets.io.ContentType.JSON
    });
}

// Initializes gadget, sets callbacks
function init() {
    makeODataCall();
}

// Initializes gadget after receiving a notification that the page is loaded and the DOM is ready.
gadgets.util.registerOnLoadHandler(init);