var urlController = function() {
    return {
		init: function(gadget) {
		    var URL_REGEX = "(https)?(http)?\:?(\/\/)?(www)?\\.?(.*)";
		    var URL_PREFIX = "//";
		    var HEIGHT_REGEX = "([0-9]+)(px)?";
		    
		    var urlFieldStr = "<input type='text' class='form-control url-gadget-input' id='url-field' placeholder='URL' />";
		    var goBtnStr = "<button id='go-btn' class='btn url-gadget-btn url-gadget-input'>Go</button>";
		    var heightFieldStr = "<input type='text' class='form-control url-gadget-input-small url-gadget-input' id='height-field' placeholder='height'/>";
		    var setBtnStr = "<button id='set-btn' class='btn url-gadget-btn url-gadget-input'>Set</button>";
		    var saveBtnStr = "<button id='save-btn' class='btn btn-primary url-gadget-save-btn url-gadget-input'>Save</button>";
		    //var inputGroup = $("<div class='url-gadget-input-group'>"+urlFieldStr+goBtnStr+""+heightFieldStr+setBtnStr+""+saveBtnStr+"</div>");
		    //var inputGroup = $("<div class='url-gadget-input-group'>"+goBtnStr+"</div>");
		    var inputGroup = $("<div class='url-gadget-input-group'></div>");
		    var displayFrame = $("<iframe id='url-frame' class='url-gadget-display-frame' src=''></iframe>");

		    var inited = false;

		    makeODataCall();
		    
			function makeODataCall(){
			  gadgets.io.makeRequest("https://developer.sapjam.com/api/v1/OData/Self?$format=json",
			    function(result) {
			      console.log("Email Address: " + result.data.d.results.Email);
			      url = "https://whoknows.com/app/profiles/embed/" + result.data.d.results.Email;
			      //url = "https://whoknows.com/app/profiles/embed/marc.bell@sap.com";
			      window.console.log("navigating to: "+url);
			      displayFrame.slideDown();
			      displayFrame.attr("src", url);
			    },
			    {
			      AUTHORIZATION: 'OAUTH2',
			      OAUTH_SERVICE_NAME: 'gadgetOauth2SAMLBearerFlow',
			      CONTENT_TYPE: gadgets.io.ContentType.JSON
			    });
			}
		    
		    function render() {

			//var inputs = $(gadget).find("#inputs");
			var display = $(gadget).find("#display");
			
			/*if(wave.getViewer() != null) {
			    var viewerId = wave.getViewer().getId();
			    if(owner == "" || viewerId == owner) {
				inputs.append(inputGroup);
			    } else {
				inputGroup.slideUp();
			    }
			}*/
			
			/*if(!inited) {
			    display.append(displayFrame);
			}*/
		    
		    function init() {
				display.append(displayFrame);
				render();

				/*if(wave && wave.isInWaveContainer()) {
				    wave.setStateCallback(render);
				    wave.setParticipantCallback(render);
				}*/
			}

			gadgets.util.registerOnLoadHandler(init);
		}
    };
}();
