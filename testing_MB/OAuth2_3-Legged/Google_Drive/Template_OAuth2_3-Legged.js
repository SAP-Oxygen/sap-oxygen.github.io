function showStep(stepToShow) {
  var steps = [ 'step_01_seekApproval', 'step_02_accessApproved', 'step_03_result', 'error' ];
  for (var i=0; i < steps.length; ++i) {
    var step = steps[i];
    var stepElement = document.getElementById(step);
    if (step === stepToShow) {
      stepElement.style.display = "block";
    } else {
      stepElement.style.display = "none";
    }
  }
}

function fetchData() {

  // Google+ OData API Call
  url = "https://www.googleapis.com/plus/v1/people/me";

  // makeRequest parameters
  var params = {};

  // OAuth2 Authorization Type
  params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH2;

  // JSON Content Type
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;

  // GET Request
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;

  // The nickname the gadget uses to refer to the OAuth <Service> element from its XML spec.
  params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "googleAPI";

  // Explicitly sets the lifespan of cached content.
  params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = "0";

  // Fetches content from the provided URL and feeds that content into the callback function.
  // gadgets.io.makeRequest(url, callback, params)
  gadgets.io.makeRequest(url, oDataProcessing, params);
}

function oDataProcessing(response) {
  if (response.oauthApprovalUrl) {
    var onOpen = function() {
      showStep('step_02_accessApproved');
  }
  var onClose = function() {
    fetchData();
  }
  var popup = new gadgets.oauth.Popup(response.oauthApprovalUrl, null, onOpen, onClose);
  document.getElementById('personalize').onclick = popup.createOpenerOnClick();
  document.getElementById('approvaldone').onclick = popup.createApprovedOnClick();
  showStep('step_01_seekApproval');
  }
  else if (response.data) {
    document.getElementById('name').innerHTML = response.data.displayName;
    document.getElementById('image').innerHTML = '<img style="height: 100px; width: 100px;" src="' + response.data.image.url + '"/>';
    document.getElementById('occupation').innerHTML = response.data.occupation;
    showStep('step_03_result');
  }
  else {
    document.getElementById('error_code').appendChild(document.createTextNode(response.oauthError));
    document.getElementById('error_uri').appendChild(document.createTextNode(response.oauthErrorUri));
    document.getElementById('error_description').appendChild(document.createTextNode(response.oauthErrorText));
    document.getElementById('error_explanation').appendChild(document.createTextNode(response.oauthErrorExplanation));
    document.getElementById('error_trace').appendChild(document.createTextNode(response.oauthErrorTrace));
    showStep('error');
  }
}

gadgets.util.registerOnLoadHandler(fetchData);