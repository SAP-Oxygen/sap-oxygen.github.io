function sayHello(){
  console.log(helloMessage);
}

function makeODataCall(){
  gadgets.io.makeRequest("https://developer.sapjam.com/api/v1/OData/Self?$format=json",
    function(result) {
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

function logODataCall(itemToLog){
  console.log(itemToLog);
}

// Initializes gadget, sets callbacks
function init() {
    sayHello();
    makeODataCall();
}

var helloMessage = "Hello there";

// Initializes gadget after receiving a notification that the page is loaded and the DOM is ready.
gadgets.util.registerOnLoadHandler(init);