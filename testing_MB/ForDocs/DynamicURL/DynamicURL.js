var urlController = function() {
    return {
		init: function(gadget) {
		    var displayFrame = $("<iframe id='url-frame' class='url-gadget-display-frame' src=''></iframe>");
		    var display = $(gadget).find("#display");

			function callRemoteURL(url){
				console.log("navigating to: " + url);
				displayFrame.slideDown();
				displayFrame.attr("src", url);
			}

		    function init() {
		    	display.append(displayFrame);
				callRemoteURL("https://www.google.com");
			}

			init();
		}
    };
}();
