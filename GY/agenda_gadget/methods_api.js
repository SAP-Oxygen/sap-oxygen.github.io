// Javascript functions available to method developers
// Note: all ids in this file refer to uuids
/*global CSTAR, lipstick, jQuery, window, document, XMLSerializer, escape, DOMParser, ActiveXObject, _, Backbone*/

// create a top-level namespace variable if it does not already exist
var streamwork = streamwork || {};

// for backwards compatibility
this.com = this.com || {};
this.com.streamwork = streamwork || {};

streamwork.views = streamwork.views || {};
streamwork.io = streamwork.io || {};

(function () {
    "use strict";

    // module namespace
    var ns = streamwork;
    // imports
    var $ = jQuery;
    
    var _groupId, _userData = null;
    
    ns.initialize = function(groupId) {
        _groupId = groupId;
    };
    
    // public interface
    
    // Constants for comparing with the currentView
    ns.views.ViewType = {
        EDIT : "edit",
        LIST : "list",
        CANVAS : "canvas"
    };
    
    // Returns a unique identifier that can be used in method data
    ns.generateUniqueId = function() {
        return CSTAR.utils.generateUniqueId();
    };
    
    // Returns the id of the current user
    ns.getViewerId = function() {
        return CSTAR.current_user.uuid;
    };
    
    // Returns the id of the current group
    ns.getGroupId = function() {
        return _groupId;
    };
  
    // Participant object
    ns.Participant = function(user) {
        this.id = user.uuid;
        this.displayName = user.name;
        this.thumbnailUrl = user.method_avatar_url;
        this.emailAddress = user.email_address;

        this.getId = function() {
            return this.id;
        };
        
        this.getDisplayName = function() {
            return this.displayName;
        };
        
        this.getThumbnailUrl = function() {
            return this.thumbnailUrl;
        };

        this.getEmailAddress = function() {
            return this.emailAddress;
        };
    };
    
    // Returns an array of all the participants invited and accepted in the 
    // activity as Participant objects
    ns.getParticipants = function() {
        var users = CSTAR.participants.users();
        var participants = [];
        $.each(users, function(uuid, user){
            // This code now works only for accepted participants, not pending participants, 
            // due to the method_avatar_url function.
            var p = new ns.Participant(user);
            participants.push(p);
        });
        return participants;
    };
    
    // Returns a participant as a Participant object given an id 
    ns.getUserInfoByIdAsync = function(id) {
        //return new ns.Participant({uuid: 1, name: "TODO", method_avatar_url: "", email_address: ""})
        if (_userData && _userData[id]) {
            return _userData[id];
        } else {
            var userInfo = ns.getUserInfoByIds([id]);
            _userData[id] = userInfo;
            return userInfo;
        }
    };

    ns.getUserInfoById = function(id) {
        if (!_userData || !_userData[id]) {
            $.ajax({url: "/profile/member_data", 
                    dataType: "json",
                    data: {ids:[id]},
                    async: false,
                    success: function(data) {
                        if (!_userData) {
                            _userData = {};
                        }
                        _userData[id] = data[id];
                    }});
        }
        return _userData[id];
    }
  
    // Returns user info as JSON given an array of ids
    // If the user can be found, user info JSON string will be passed to callback; 
    // if the user cannot be found for a specified no, no data will be returned;
    // returns null if no user ids provided;
    // if ajax returns server error, null value will be returned
    ns.getUserInfoByIds = function(ids, callback) {
        if (ids.length <= 0) {
            return null;
        }
        if (_userData) {
            if (callback) {
                callback(_userData);
            }
        } else {
            $.get("/profile/member_data", {'ids[]': ids}, function(data) {
                _userData = data;
                if (callback) {
                    callback(_userData);
                }
            }, "json");
        }
        return _userData;
    };
    
    // io functions
    
    ns.io.RequestParameters = {
        AUTHORIZATION : "authorization",
        USER : "user",
        PASSWORD : "password",
        CONTENT_TYPE : "content_type",
        METHOD : "method",
        POST_DATA : "post_data",
        HEADERS : "headers"
    };
    
    ns.io.ContentType = {
        JSON : "json",
        TEXT : "text", 
        DOM : "xml"
    };
    
    ns.io.MethodType = {
        GET : "GET",
        POST : "POST",
        PUT : "PUT",
        DELETE : "DELETE"
    };
    
    ns.io.AuthorizationType = {
        NONE : "none",
        BASIC : "basic"
    };
    
    ns.io.encodeValues = function(postData) {
        var str = "";
        var key;
        for(key in postData) {
            if (postData.hasOwnProperty(key)) {
                if (str !== "") {
                    str += "&";
                }
                str += escape(key) + "=" + escape(postData[key]);
            }
        } 
        return str;
    };
    
    ns.io.makeRequest = function(url, callback, opt_params) {
        var params = opt_params || {};
        
        if(!url) {
            callback({errors: ["The URL is required."]});
            return;
        }
        
        if(url.length > 4000) {
            callback({errors: ["The URL is too long."]});
            return;
        }
        
        params.url = url;
        
        if(params[ns.io.RequestParameters.POST_DATA]) {
            if(params[ns.io.RequestParameters.POST_DATA].length > 200000) {
                callback({errors: ["The POST data is too long."]});
                return;
            }
        }
        
        if(params[ns.io.RequestParameters.HEADERS]) {
            var headers = ns.io.encodeValues(params[ns.io.RequestParameters.HEADERS]);
            if(headers.length > 65000) {
                callback({errors: ["The headers are too long."]});
                return;
            }
            params[ns.io.RequestParameters.HEADERS] = headers;
        }
        
        $.ajax({
          url: "/methods_api/send_request",
          cache: false,
          dataType: "json",
          type: "POST",
          data: params,
          success: function(response){
              var data = response.data;
              if(!response.error && response.params && response.params.content_type === ns.io.ContentType.DOM) {
                if(window.DOMParser) {
                  var parser = new DOMParser();
                  data = parser.parseFromString(response.text, "text/xml");
                }
                else {
                  var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                  xmlDoc.async = "false";
                  xmlDoc.loadXML(response.text);
                  data = xmlDoc;
                } 
              }
              
              var errors = null;
              if (response.error) {
                  errors = [response.error];
              }
              
              var result = {data: data, errors: errors, text: response.text};
              callback(result);
          },
          error: function(XMLHttpRequest, textStatus, errorThrown){
              var result = {errors: [XMLHttpRequest.statusText]};
              callback(result);
          }
        });
    };

    ns.defaultSelectionManagerImpl = function () {
        var impl = {
            supportsSelection: function () {
                return true;
            },

            selectedPoints: function () {
                return null;
            },

            selectPoint: function () {
                throw new Error("Not implemented");
            },

            deselectPoint: function () {
                throw new Error("Not implemented");
            },

            deselectAllPoints: function () {
                throw new Error("Not implemented");
            },

            labelForPoint: function () {
                throw new Error("Not implemented");
            },

            pointTooltipOrigin: function () {
                throw new Error("Not implemented");
            },
            
            annotationTooltipOrigin: function () {
                throw new Error("Not implemented");
            },
            
            drawAnnotationIconForValue: function () {
                throw new Error("Not implemented");
            },
            
            removeAnnotationIconForValue: function () {
                throw new Error("Not implemented");
            },
            
            handleTooltipForAnnotation: function () {
                throw new Error("Not implemented");
            }
        };
        _.extend(impl, Backbone.Events);

        return impl;
    };
}());
