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
	    var inputGroup = $("<div class='url-gadget-input-group'>"+urlFieldStr+goBtnStr+""+heightFieldStr+setBtnStr+""+saveBtnStr+"</div>");
	    var displayFrame = $("<iframe id='url-frame' class='url-gadget-display-frame' src=''></iframe>");

	    var inited = false;
	    
	    function saveState() {
		var state = wave.getState();
		var viewerId = wave.getViewer().getId();
		var url = displayFrame.attr("src");
		var height = displayFrame.height();
		state.submitDelta({"url": url, "height": height, "owner": viewerId});
	    }

	    function sanitizeUrl(url) {
		var m = url.match(URL_REGEX);
		return  m[m.length-1];
	    }
	    
	    function sanitizeHeight(height) {
		var m = height.match(HEIGHT_REGEX);
		if(m) {
		    return m[1];
		}
		return null;
	    }

	    function setHeight(newHeight, heightField) {
		heightField.val(newHeight+"px");
		displayFrame.animate({
		    height: newHeight
		}, 1000, function() {
		    gadgets.window.adjustHeight();
		});
	    }
	    
	    function goUrl(url) {
		//taking out url sanitzing 2015-08-18
		/*
		var baseUrl = sanitizeUrl(url);
		displayFrame.slideDown();
		displayFrame.attr("src", URL_PREFIX+baseUrl);
		*/
		url = "https://whoknows.com/app/profiles/embed/marc.bell@sap.com";
		window.console.log("navigating to: "+url);
		displayFrame.slideDown();
		displayFrame.attr("src", url);
	    }
	    
	    function render() {
		
		if(!wave.getState()) {
		    return;
		}

		var state = wave.getState();

		var url = state.get("url", "");
		var height = state.get("height", "");
		var owner = state.get("owner", "");

		var inputs = $(gadget).find("#inputs");
		var display = $(gadget).find("#display");
		
		if(wave.getViewer() != null) {
		    var viewerId = wave.getViewer().getId();
		    if(owner == "" || viewerId == owner) {
			inputs.append(inputGroup);
		    } else {
			inputGroup.slideUp();
		    }
		}
		
		if(!inited) {
		    displayFrame.hide();
		    display.append(displayFrame);

		    var urlField = $("#url-field");
		    var goBtn = $("#go-btn");
		    var heightField = $("#height-field");
		    var setBtn = $("#set-btn");
		    var saveBtn = $("#save-btn");

		    function getSetHeight() {
			var newHeight = heightField.val();
			var height = sanitizeHeight(newHeight);
			if($.isNumeric(height)) {
			    setHeight(height, heightField);
			}
		    }

		    function getGoUrl() {
			var newUrl = urlField.val();
			goUrl(newUrl);
		    }
		    
		    goBtn.click(function() {
			getGoUrl();
		    });

		    urlField.keypress(function(evt) {
			if(evt.which == 13) {
			    getGoUrl();
			}
		    });

		    saveBtn.click(function() {
			saveState();
		    });

		    heightField.keypress(function(evt) {
			if(evt.which == 13) {
			    getSetHeight();
			}
		    });

		    setBtn.click(function() {
			getSetHeight();
		    });
		}
		
		if(url !== "") {
		    urlField.val(url);
		    goUrl(url);
		}
		
		if(height !== "") {
		    height = Math.floor(height);
		    setHeight(height, heightField);
		}
	    }
	    
	    function init() {
		if(wave && wave.isInWaveContainer()) {
		    wave.setStateCallback(render);
		    wave.setParticipantCallback(render);
		}
	    }
	    gadgets.util.registerOnLoadHandler(init);
	}
    };
}();
