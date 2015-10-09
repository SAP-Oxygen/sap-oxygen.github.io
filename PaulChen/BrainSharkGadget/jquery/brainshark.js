var gadgetController = function() {
    return {
	init: function(gadget) {
	    var BRAINSHARK_URL_REGEX = "(https)?(http)?\:?(\/\/)?(www)?\.?brainshark.com\/(.*)";
	    var BRAINSHARK_URL_PREFIX = "https://www.brainshark.com/";
	    var RESEARCH_URL_REGEX = "(https)?(http)?\:?(\/\/)?(www)?\.?research.net\/(.*)";
	    var RESEARCH_URL_PREFIX = "https://www.surveymonkey.com/";
	    var HEIGHT_REGEX = "([0-9]+)(px)?";
	    var POPOVER_TIME_MS = 4000;

	    var _inited = false;

	    var _inputGroup = $(gadget).find("#input-group");
	    var _settingsPane = $(gadget).find("#settings-pane");
	    var _content = $(gadget).find("#content");
	    var _displayFrame = $(gadget).find("#url-frame");
	    var _urlField = _settingsPane.find("#url-field");
	    var _heightField = _settingsPane.find("#height-field");
	    
	    var _invalidUrl = {
		content: "Invalid SurveyMonkey URL"
	    };

	    var _invalidHeight = {
		content: "Invalid Height"
	    };
	    
	    var _popoverOptionsArray = [_invalidUrl, _invalidHeight];
	    var _storedSettings = {};
	    
	    function saveState(newUrl, newHeight) {
		var state = wave.getState();
		var viewerId = wave.getViewer().getId();
		var url = newUrl;
		var height = newHeight;
		state.submitDelta({"url": url, "height": height, "owner": viewerId});
	    }

	    function toJSON(obj) {
		return gadgets.json.stringify(obj);
	    }

	    function toObject(str) {
		return gadgets.json.parse(str);
	    }

	    /*
	     * @returns the first dataObj with matching @param name from @param objArr
	     */
	    function getDataObjFromName(objArr, name) {
		for(var i = 0; i < objArr.length; i++) {
		    if(objArr[i].name === name) {
			return objArr[i];
		    }
		}
		return null;
	    }

	    /*
	     * check to make sure url has surveymonkey.com domain
	     * @return null if no match found, otherwise returns the unique survey url
	     */
	    function checkUrl(url) {
		var m = url.match(BRAINSHARK_URL_REGEX);
		if(m) {
		    return m[m.length-1];
		}
		return null;
	    }
	    
	    function sanitizeHeight(height) {
		var m = height.match(HEIGHT_REGEX);
		if(m) {
		    return m[1];
		}
		return null;
	    }

	    /*
	     * @param domObj the dom object to resize
	     * @param newHeight integer new height in pixels
	     * @param heightField the heightField dom object to add "px" to the string
	     */
	    function setHeight(domObj, newHeight, heightField) {
		heightField.val(newHeight+"px");
		domObj.animate({
		    height: newHeight
		}, 1000, function() {
		    gadgets.window.adjustHeight();
		});
	    }
	    
	    function goUrl(url) {
		var fullUrl = BRAINSHARK_URL_PREFIX+url;
		_urlField.val(fullUrl);
		window.console.log("navigating to: "+fullUrl);
		_displayFrame.slideDown();
		_displayFrame.attr("src", fullUrl);
	    }

	    /*
	     * flash the popover for @param domInput
	     */
	    function invalidInput(domInput) {
		domInput.parent().parent().addClass("has-error");
		domInput.parent().parent().find("label").popover("show");
		setTimeout(
		    function() {
			domInput.parent().parent().removeClass("has-error");
			domInput.parent().parent().find("label").popover("hide");
		    },
		    POPOVER_TIME_MS
		);
	    }
	    
	    function storeSettings() {
		_storedSettings = {"url": _urlField.val(), "height": _heightField.val()};
	    }
	    
	    function restoreSettings() {
		_urlField.val(_storedSettings["url"]);
		_heightField.val(_storedSettings["height"]);
		console.log(_storedSettings);
	    }
	    
	    function render() {
		
		if(!wave.getState()) {
		    return;
		}

		var state = wave.getState();

		var url = state.get("url", "");
		var height = state.get("height", "");
		var owner = state.get("owner", "");
		
		if(!_inited) {
		    _settingsPane.find("#settings-form").find("label").each(function(idx) {
			$(this).popover(_popoverOptionsArray[idx]);
		    });
		    
		    _settingsPane.on("hidden.bs.collapse", function() {
			$("#input-group-actions").show();
			$("#settings-btn").show();
			gadgets.window.adjustHeight();
		    });
		    
		    _settingsPane.on("shown.bs.collapse", function() {
			$("#input-group-actions").hide();
			$("#settings-btn").hide();
			//TODO: change this timeout to a callback
			setTimeout(function() {
			    gadgets.window.adjustHeight();
			}, 1000);
			
			storeSettings();
		    });
		    
		    $("#settings-save").click(function(evt) {
			evt.preventDefault();
			var settingsArray = _settingsPane.find("#settings-form").serializeArray();
			var url = checkUrl(getDataObjFromName(settingsArray, "settings-url").value);
			var height = sanitizeHeight(getDataObjFromName(settingsArray, "settings-height").value);
			
			if(!url) {
			    invalidInput(_urlField);
			} else {
			    if(!height) {
				invalidInput(_heightField);
			    } else {
				goUrl(url);
				setHeight(_displayFrame, height, _heightField);
				_settingsPane.collapse("hide");
				//TODO: settings saved alert
				saveState(url, height);
			    }
			}
		    });
		    
		    $("#settings-cancel").click(function(evt) {
			evt.preventDefault();
			restoreSettings();
			_settingsPane.collapse("hide");
		    });
		    
		    if(!url) {
			_settingsPane.collapse("show");
		    }
		    
		    _inited = true;
		}
		if(wave.getViewer() != null) {
		    var viewerId = wave.getViewer().getId();
		    if(owner == "" || viewerId == owner) {
			_inputGroup.slideDown();
		    } else {
			if(_inputGroup.is(":visible")) {
			    _inputGroup.slideUp();
			}
		    }
		}
		
		if(url && height) {
		    goUrl(url);
		    setHeight(_displayFrame, height, _heightField);
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
