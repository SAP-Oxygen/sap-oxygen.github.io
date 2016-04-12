var commentStreamController = function() {

  return {
    init: function() {
    	
    	/**
		 * Clears all of the participant's drafts.
		 * wave.getPrivateState().submitDelta(map) updates the gadget's private state object (wave) with 
		 * the passed in map of key-values ({'drafts': []}).
		 */
    	function clearDrafts() {
    		wave.getPrivateState().submitDelta({'drafts': []});
    		$('#drafts').empty();
    	}
    	
    	/**
		 * Edits a drafted comment and remove it from the list of drafts.
		 * wave.getPrivateState().submitDelta(map) updates the gadget's private state object (wave) with 
		 * the passed in map of key-values ({'drafts': updatedDrafts}).
		 */
    	function editDraft(draft) {
    		$('#drafts').empty();
    		$('#comment-text').val(draft);
	    	var currentDrafts = getDrafts();
	    	var updatedDrafts = [];
	    	$.each(currentDrafts, function(i, val) {
	    		if (val !== draft) {
	    			updatedDrafts.push(val);
	    		}
	    	});
    		wave.getPrivateState().submitDelta({'drafts': updatedDrafts});
    	}
    	
    	/**
		 * Returns the markup for a comment.
		 */
    	function getCommentHtml(comment) {
    		return "<div>" + comment + "</div>";
    	}
    	
    	/**
		 * Returns the markup for a draft.
		 */    	
    	function getDraftHtml(draft, id) {
	    	return "<div class=\"input-group list-group-item\">" + 
		        	draft + 
		           "<span class=\"input-group-btn\"><button type=\"button\" id=\"" +
		        	id +
		           "\"" +
		           "class=\"btn btn-default complete-task\">Edit</button></span></div>";
    	}
    	
    	/**
		 * Renders comments in the comment stream output box.
		 * gadgets.window.adjustHeight() resizes the height of the window to fit added/removed content
		 */    	
    	function renderComments(commentsToRender) {
    	  $('#output-box').empty();
    	  if (commentsToRender.length > 0) {
    	  	$.each(commentsToRender, function(i, val) {
    	  		var htmlString = getCommentHtml(val);
    	  		$('#output-box').append(htmlString);
    	  		gadgets.window.adjustHeight();
    	  	});
    	  }
    	}
    	
    	/**
		 * Renders drafts in the drafts box.
		 * gadgets.window.adjustHeight() resizes the height of the window to fit added/removed content
		 */ 
    	function renderDrafts(draftsToRender) {
		  $('#drafts').empty();
	      if (draftsToRender.length > 0) {
	  	    var id = 1;
		    $.each(draftsToRender, function(i, val) {
		      var htmlString = getDraftHtml(val, id);
              $('#drafts').append(htmlString);
              gadgets.window.adjustHeight();
              $('#' + id).click(function() {
			    editDraft(val);
		      });
		      id++;
		    });
	      }
    	}
    	
    	/**
		 * Gets all drafts in the private wave (which belongs to the particular participant).
		 * wave.getPrivateState().submitDelta(map) takes a key-value map and updates the wave
		 *
		 * getState() 	Returns the gadget's shared state object, which conceptually is a key-value map. Once you have the state object, you can perform operations on it like querying for the value of particular keys. For example, wave.getState().get('count') returns the value for the count key. Note that both keys and values must be strings.
		 *
		 * getPrivateState() 	Returns the gadget's private state object, which is similar to the shared state object, but contains key-value pairs for the private gadget state.
		 *
		 * Gets all drafts in the private wave (which belongs to the particular participant).
		 */ 
    	function getDrafts() {
    		var draftsToRender = (wave.getPrivateState().get('drafts') === null) ? [] : wave.getPrivateState().get('drafts');

    		//var draftsToRender = !(wave.getPrivateState().get('drafts') === null) ? wave.getPrivateState().get('drafts') : [];
    		return draftsToRender;
    	}
    	
    	/**
		 * Gets all comments in the public wave, which applies to all participants.
		 * wave.getState() retrieves the public wave object.
		 */     	
    	function getComments() {
    		var commentsToRender = !(wave.getState().get('comments') === null) ? wave.getState().get('comments') : [];
    		return commentsToRender;
    	}
    	
    	/**
		 * Publishes a comment to the public wave comment stream.
		 * Removes any draft that was published, as it is no longer a draft.
		 * Creates an activity stream item in the feed for the gadget.
		 * wave.getState() retrieves the public wave object.
		 * wave.getPrivateState().submitDelta(map) takes a key-value map and updates the wave
		 * osapi.activitystreams.create(activity).execute(result) takes an activity and adds the activity as a feed item with a callback.
		 */     	
	    function publishComment() {
	    	var newComment = $('#comment-text').val();
	    	if (newComment !== "") {
		    	var currentComments = getComments();
		    	currentComments.push(newComment);
		    	var currentDrafts = getDrafts();
		    	var updatedDrafts = [];
		    	$.each(currentDrafts, function(i, val) {
		    		if (val !== newComment) {
		    			updatedDrafts.push(val);
		    		}
		    	});
		    	wave.getPrivateState().submitDelta({'drafts': updatedDrafts});
		    	wave.getState().submitDelta({'comments': currentComments});
		    	osapi.activitystreams.create({
	              activity: {
	                title: "#{feed_add}",
	                object: {
	                  displayName: newComment
	                }
	              }
	            }).execute(function(result) {});
	    	}
	    }
	    
    	/**
		 * Saves a draft for the participant.
		 * wave.getPrivateState().submitDelta(map) takes a key-value map and updates the wave 
		 */ 	    
	    function saveDraft() {
	    	var currentDrafts = getDrafts();
	    	currentDrafts.push($('#comment-text').val());
			wave.getPrivateState().submitDelta({'drafts': currentDrafts});
	    }
	    
    	/**
		 * Called whenever an update has been made to the public wave of comments to render the existing comments.
		 * wave.getState() retrieves the public wave object.
		 */ 
	    function publicStateUpdated() {
			if(wave.getState().get('comments')) {
				var comments = getComments();
				if (comments) {
    				renderComments(comments);
    			}
			}
	    }
	    
    	/**
		 * Called whenever an update has been made to the private wave of drafts to render the existing drafts (of the current user).
		 * wave.getPrivateState() retrieves the private wave object.
		 */ 	    
	    function privateStateUpdated() {
	    	if(wave.getPrivateState().get('drafts')) {
				var drafts = getDrafts();
				if (drafts) {
    				renderDrafts(drafts);
    			}
			}
	    }
	    
    	/**
		 * Initializes the gadget by set a callback function for both the public and private waves. The callbacks are run when their associated wave objects change.
		 * Sets up all listeners for click actions.
		 * wave.setStateCallback(publicCallbackFunction) takes a function to setup the callback for the public wave.
		 * wave.setPrivateStateCallback(privateCallbackFunction) takes a function to setup the callback for the private wave.
		 */     
    	function initGadget() {
	      if (wave && wave.isInWaveContainer()) {
	        wave.setStateCallback(publicStateUpdated);
	        wave.setPrivateStateCallback(privateStateUpdated);
	      }
		  $('#publish-comment').click(function() {
		  	publishComment();
		  	$('#comment-text').val("");
		  });
		  $('#cancel-comment').click(function() {
		  	$('#comment-text').val("");
		  });
		  $('#save-draft').click(function() {
		  	saveDraft();
		  	$('#comment-text').val("");
		  });
		  $('#clear-drafts').click(function() {
		  	clearDrafts();
		  });
    	}
    	
        /**
	     * Initializes the gadget after receiving a notification that the page is loaded and the DOM is ready.
	     */ 	
		gadgets.util.registerOnLoadHandler(initGadget);
    }
  };
}();