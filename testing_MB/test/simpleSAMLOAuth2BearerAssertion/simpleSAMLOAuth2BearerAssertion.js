function makeODataCall(){
  gadgets.io.makeRequest("https://developer.sapjam.com/api/v1/OData/Self?$format=json",
    function(result) {
      var emailAddress = result.data.d.results.Email;
      console.log("Email Address: " + emailAddress);
      var fullURL = "https://whoknows.com/app/profiles/embed/" + emailAddress;
      console.log(fullURL);
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