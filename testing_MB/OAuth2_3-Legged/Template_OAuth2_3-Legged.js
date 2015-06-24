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
  url = "https://www.googleapis.com/plus/v1/people/me";
  var params = {};
  params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
  params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.OAUTH2;
  params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
  params[gadgets.io.RequestParameters.OAUTH_SERVICE_NAME] = "googleAPI";
  params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = "0";
  //$(edit_link).click(function(){ return changeViewMode(myvar); });
  //$(edit_link).click(function(){ changeViewMode(myvar); });
  //gadgets.io.makeRequest(url, oDataProcessing(response), params);
  //gadgets.io.makeRequest(url, function (response)
  //gadgets.io.makeRequest(url, function(){ return oDataProcessing(response); }, params);
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
  getElement('personalize').onclick = popup.createOpenerOnClick();
  getElement('approvaldone').onclick = popup.createApprovedOnClick();
  showStep('step_01_seekApproval');
  }
  else if (response.data) {
    getElement('name').innerHTML = response.data.displayName;
    getElement('image').innerHTML = '<img style="height: 100px; width: 100px;" src="' + response.data.image.url + '"/>';
    getElement('occupation').innerHTML = response.data.occupation;
    showStep('step_03_result');
  }
  else {
    getElement('error_code').appendChild(document.createTextNode(response.oauthError));
    getElement('error_uri').appendChild(document.createTextNode(response.oauthErrorUri));
    getElement('error_description').appendChild(document.createTextNode(response.oauthErrorText));
    getElement('error_explanation').appendChild(document.createTextNode(response.oauthErrorExplanation));
    getElement('error_trace').appendChild(document.createTextNode(response.oauthErrorTrace));
    showStep('error');
  }
}

gadgets.util.registerOnLoadHandler(fetchData);