var commentStreamController = function() {

  return {
    init: function() {
    	
    	/** 
    	 * Clears all of the participant's drafts.
		 * - wave.getPrivateState().submitDelta(map) updates the private state object (wave) with
		 *   a passed in map of key-values for the current user. This user-specific information is
		 *   private and can only be accessed by that user.
    	 */
    	function clearDrafts() {

    		// Initializes the map and saves it in the gadget's private state object
    		wave.getPrivateState().submitDelta({'drafts': []});
    		
    		$('#drafts').empty();
    	}
    	
    	/** 
    	 * Edits a drafted comment and remove it from the list of drafts.
    	 * - wave.getPrivateState().submitDelta(map) updates the private state object (wave) with
		 *   a passed in map of key-values for the current user. This user-specific information is
		 *   private and can only be accessed by that user.
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
	    	
	    	// Updates the map with 'updatedDrafts' for the current user in the private state object (wave)
    		wave.getPrivateState().submitDelta({'drafts': updatedDrafts});
    	}
    	
    	/** Returns the markup for a comment. */
    	function getCommentHtml(comment) {
    		return "<div>" + comment + "</div>";
    	}
    	
    	/** Returns the markup for a draft. */    	
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
		 * - gadgets.window.adjustHeight() resizes the height of the window to fit added/removed content
		 */    	
    	function renderComments(commentsToRender) {
    	  $('#output-box').empty();
    	  if (commentsToRender.length > 0) {
    	  	$.each(commentsToRender, function(i, val) {
    	  		var htmlString = getCommentHtml(val);
    	  		$('#output-box').append(htmlString);
    	  		
    	  		// Resizes gadget window height to fit content
    	  		gadgets.window.adjustHeight();
    	  	});
    	  }
    	}
    	
    	/**
		 * Renders drafts in the drafts box.
		 * - gadgets.window.adjustHeight() resizes the height of the gadget window to fit added/removed content
		 */ 
    	function renderDrafts(draftsToRender) {
		  $('#drafts').empty();
	      if (draftsToRender.length > 0) {
	  	    var id = 1;
		    $.each(draftsToRender, function(i, val) {
		      var htmlString = getDraftHtml(val, id);
              $('#drafts').append(htmlString);
              
              // Resizes gadget window height to fit content
              gadgets.window.adjustHeight();

              $('#' + id).click(function() {
			    editDraft(val);
		      });
		      id++;
		    });
	      }
    	}
    	
    	/**
		 * This user-specific information is private and can only be accessed by that user.
		 * - wave.getPrivateState().get(map) gets a map of key-values from the private state object (wave) for the current user. 
		 */ 
    	function getDrafts() {

    		// Gets all drafts for the current user from the private state object (wave)
    		var draftsToRender = wave.getPrivateState().get('drafts') === null ? [] : wave.getPrivateState().get('drafts');

    		return draftsToRender;
    	}
    	
    	/**
		 * Gets all comments in the public wave, which applies to all participants.
		 * - wave.getState().get(map) gets a map of key-values from the shared state object (wave). All
		 *   information is public and can be accessed by all users.
		 */
    	function getComments() {

    		// Gets all comments for all users from the public shared object (wave)
    		var commentsToRender = wave.getState().get('comments') === null ? [] : wave.getState().get('comments');

    		return commentsToRender;
    	}
    	
    	/**
		 * Publishes a comment to the public wave comment stream.
		 * Removes any draft that was published, as it is no longer a draft.
		 * Creates an activity stream item in the feed for the gadget.
		 *
		 * Publishes a comment to the public wave comment stream.
		 * - wave.getState().submitDelta(map) updates the shared state object (wave) with a
		 *   passed in map of key-values. All information is public and can be accessed by all users.
		 * Removes any draft that was published, as it is no longer a draft.
		 * - wave.getPrivateState().submitDelta(map) updates the private state object (wave) with
		 *   a passed in map of key-values for the current user. This user-specific information is
		 *   private and can only be accessed by that user.
		 * Creates a new comment in the feed of the gadget's Jam group.
		 * - osapi.activitystreams.create({activity: {title: "titleText",object: {displayName: "commentText"}}}).execute(callback) creates a new comment from a passed in object. This object must contain the 'activity' property and all comment information must be within this property.
		 *
		 * Creates an activity stream item in the feed for the gadget.
		 * - osapi.activitystreams.create(activity).execute(callback) uses a callback to create a new feed item from a passed in ActivityEntry object (activity). This creates a new comment in the gadget's Jam group.
		 * - osapi.activitystreams.create(activity).execute(callback) creates a new feed item from a passed in ActivityEntry object (activity).
		 *
		 * osapi.activitystreams.create(object)
		 * - Builds a request to create a new ActivityEntry using the Activity Streams service.
		 * - A osapi.Request to retrieve information from the Activity Streams service. Executing this request MUST attempt to create the specified ActivityEntry and return the newly-created ActivityEntry object if successful.
		 *
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
		    	
		    	// Updates the map with 'updatedDrafts' for the current user in the private state object (wave)
		    	wave.getPrivateState().submitDelta({'drafts': updatedDrafts});
		    	
		    	// Updates the map with 'currentComments' in the shared state object (wave)
		    	wave.getState().submitDelta({'comments': currentComments});

		    	// 
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
		 * - wave.getPrivateState().submitDelta(map) updates the private state object (wave) with
		 *   a passed in map of key-values for the current user. This user-specific information is
		 *   private and can only be accessed by that user.
		 */
	    function saveDraft() {
	    	var currentDrafts = getDrafts();
	    	currentDrafts.push($('#comment-text').val());
			
	    	// Updates the map with 'updatedDrafts' for the current user in the private state object (wave)
			wave.getPrivateState().submitDelta({'drafts': currentDrafts});
	    }
	    
    	/**
		 * Called whenever an update has been made to the public wave of comments to render the existing comments.
		 * - wave.getState() retrieves the public wave object.
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
		 * - wave.getPrivateState() retrieves the private wave object.
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
		 * - Sets up all listeners for click actions.
		 * - wave.setStateCallback(publicCallbackFunction) takes a function to setup the callback for the public wave.
		 * - wave.setPrivateStateCallback(privateCallbackFunction) takes a function to setup the callback for the private wave.
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