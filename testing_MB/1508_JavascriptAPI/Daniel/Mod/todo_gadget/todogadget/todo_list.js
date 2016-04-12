var todoController = function() {

  return {
    init: function() {
    	
    	/**Keep track of all the existing todo items that have not been removed*/
    	var existingTodos = [];

		/**
		 * Retrieve todo items, which belong to the owner of the gadget, and then display those items.
		 * osapi.people.getOwner retrieves the owner of the gadget.
		 * osapi.appdata.get retrieves the todo items of the gadget (for the owner), by specifically calling for keys: ['todos'].
		 */
	    function getExistingTodos() {
	    	osapi.people.getOwner().execute(function(ownerData) {
              var ownerId = ownerData.id;
	    	  osapi.appdata.get({
	    	  	userId: ownerId,
				keys: ['todos']
			    }).execute(function(todos) {
			      existingTodos = (todos[ownerId] !== undefined && todos[ownerId].todos !== undefined) ? todos[ownerId].todos : [];
			      displayTodos();
			    });
	    	});
	    }
	    
	    /**
	     * Display each todo item, whether complete/uncomplete, and create a clickable event for mark the item as completed.
	     */
	    function displayTodos() {
	      clearTodos();
		  if (existingTodos.length > 0) {
		  	var id = 1;
			$.each(existingTodos, function(i, val) {
			  var htmlString = null;
			  if (val.completed) {
			  	  htmlString = getCompletedItem(val.name, id);
			  } else {
		          htmlString = getUncompletedItem(val.name, id);		  	
			  }
	          $('#todos').append(htmlString);			  
			  $('#' + id).click(function() {
				markTodoAsCompleted(val);
			  });
			  id++;
			});
		  }
	      // adjust the height of the gadget for added or removed todo items.
		  gadgets.window.adjustHeight();
	    }
	    
	    /**
	     * Return HTML for a completed todo item
	     */
	    function getCompletedItem(name, id) {
	    	return "<div class=\"input-group list-group-item\">" + 
		        	name + 
		           "<span class=\"input-group-btn\"><button type=\"button\" id=\"" +
		        	id +
		           "\"" +
		           "class=\"btn btn-success complete-task\">" +
		           gadgetPrefs.getMsg("completed_item") +
		           "</button></span></div>";
	    }
	    
	    /**
	     * Return HTML for an uncompleted todo item
	     */
	    function getUncompletedItem(name, id) {
	    	return "<div class=\"input-group list-group-item\">" + 
		        	name + 
		           "<span class=\"input-group-btn\"><button type=\"button\" id=\"" +
		        	id +
		           "\"" +
		           "class=\"btn btn-default complete-task\">" +
		           gadgetPrefs.getMsg("uncompleted_item") +
		           "</button></span></div>";	
	    }
	    
	    /**
	     * Remove all items from the todo list
	     */
	    function clearTodos() {
	    	$('#todos').empty();
	    }
	    
	    /**
	     * Open a modal dialog with the HTML rendered for the 'popup-view' open-view.
	     * gadgets.views.openGadget allows for different content from the gadget defintion to be rendered.
	     * refer to <Content type="html" view="popup-view"> in the spec.xml file.
	     */
	    function openView() {
			gadgets.views.openGadget(function(result) {
			  return result ? createTodo(result) : null; 
			}, function(site) {
			  return null;
			}, {
				view: 'popup-view',
				viewTarget: 'MODALDIALOG'
			});
	    }
	    
	    /**
	     * Creates a todo item by updating the existingTodos.
	     * osapi.appdata.update updates the 'todos' key for the gadget with the new todo added.
	     * Gets the existing todo items after the update.
	     */
	    function createTodo(todo) {
	    	existingTodos.push(todo);
	        osapi.appdata.update({
	          data: {
	            todos: existingTodos
	          }
	        }).execute(function(updateData) {
	          if (updateData.error) {
	            window.console && console.log(updateData.error.message);
	          }
	        });
			getExistingTodos();
    	}
    	
    	/**
	     * Removes todo items by updating the existingTodos.
	     * osapi.appdata.update updates the 'todos' key for the gadget with the remaining gadgets after the removal of completed todos.
	     * Gets the existing todo items after the update.
	     */
    	function removeCompletedTodos() {
    		var newTodos = [];
			$.each(existingTodos, function(i, val) {
				if (!(val.completed)) {
					newTodos.push(val);
				}
			});
			osapi.appdata.update({
	          data: {
	            todos: newTodos
	          }
	        }).execute(function(updateData) {
	          if (updateData.error) {
	            window.console && console.log(updateData.error.message);
	          }
			  getExistingTodos();
	        });
    	}
    	
    	
    	/**
	     * Marks a todo item as completed. This marks all tasks with the same description as completed, so duplicates will be marked as complete.
	     * osapi.appdata.update updates the 'todos' key for the gadget with the updated todo items.
	     * Gets the existing todo items after the update.
	     */
    	function markTodoAsCompleted(todo) {
    		// get the context of the gadget to determine whether the current user has the appropriate permissions to complete a task.
    		gadgets.sapjam.context.get(function(context) {
    			if (!context.readOnly) {
		    		$.each(existingTodos, function(i, val) {
						if (val.name === todo.name) {
							existingTodos[i].completed = true;	
						}
					});
		    		osapi.appdata.update({
			          data: {
			            todos: existingTodos
			          }
			        }).execute(function(updateData) {
			          if (updateData.error) {
			            window.console && console.log(updateData.error.message);
			          }
					  getExistingTodos();
			        });    				
    			}	
    		});
    	}
    	
    	/**
	     * Gets all existing todo items and then sets click listeners for the different buttons.
	     */
    	function initGadget() {
			getExistingTodos();
			$('#new-todo').click(function() {
				openView();
			});
			$('#remove-completed-todos').click(function() {
				removeCompletedTodos();
			});
    	}
      
        /**
    	 * Establishes the gadget preferences feature
    	 */
    	var gadgetPrefs = new gadgets.Prefs();
        /**
	     * Initializes the gadget after receiving a notification that the page is loaded and the DOM is ready.
	     */
		gadgets.util.registerOnLoadHandler(initGadget);
    }
  };
}();