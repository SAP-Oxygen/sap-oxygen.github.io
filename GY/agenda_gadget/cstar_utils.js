/*global CSTAR, $, jQuery, document, window, navigator, clearTimeout, setTimeout, lipstick, _ */
// Functions from prototype.js which we are still using
(function() {
    Object.extend = function(destination, source) {
        var property;
        for (property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    };

    var escapeCSS = function() {
        return $.map(this.split(''), function(c){
            if(c.match(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~]/)) {
                return '\\' + c;
            }
            return c;
        }).join('');
    };

    Object.extend(String.prototype, {
        blank: function() {
            return (/^\s*$/).test(this);
        },

        escapeHTML : function() {
            return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,
                '&gt;').replace(/"/g, '&quot;');
        },

        unescapeHTML : function() {
            return this.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
        },

        escapeUnicode: function () {
            var asciiCeiling = parseInt("0x7F");
            var encoded = "";
            _.times(this.length, function(i) {
                var c = this.charAt(i);
                if(c.charCodeAt() > asciiCeiling) {
                    encoded += '\\u' + ('0000' + c.charCodeAt().toString(16)).slice(-4);
                } else {
                    encoded += c;
                }
            }, this);
            return encoded;
        },

        escapeCSS : escapeCSS,

        escapeSelector : escapeCSS
    });

    //Douglas Crockford's Object.create function
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }


    // dbiollo - this is a fix for load_worklist() in cstar_activity_list.js
    // We should investigate using the jQuery1.4 way of handling objects 
    // September 6th, 2012 - jwakefield: this commented out because it is interfereing with some Jam processing
    // if needed, we'll have to find a way to do this in a jQuery1.4 way as mentioned above.
    // $.ajaxSettings.traditional = true;
    
    var rperiod = /\./g, 
        rspace = / /g;
    // TODO: these live types are mapped
    var liveMap = {
        focus: "focusin",
        blur: "focusout",
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    };
    // This function is updated for jQuery 1.4.X
    function liveConvert(type, selector) {
        return (type && type !== "*" ? type + "." : "") + selector.replace(rperiod, "`").replace(rspace, "&");
    }
    
    // Enhance jQuery live function to be scoped under $.live, allowing you to pass in the selector.
    // This will perform much better than the default way which forces you to find the objects first
    // (and then never use them).
    // NOTE: chaining will not be allowed for simplicity
    $.extend({
        
        live: function(selector, type, fn) {
            if (liveMap[type]) {
                // jQuery 1.4 adds support for all types of events to be live.
                // We'd have to copy more of their code which has to do with type remapping.
                // laziness makes me avoid that work. Perhaps it's better to use the new $.fn.delegate,
                // although that code seems to just call $.fn.live. But at least you can use context
                // selectors, which may remove the need to have the pointless $(selector) call in normal $.fn.live.
                throw "$.live does not support this type: " + type;
            }
            
            $.event.add( document, "live." + liveConvert( type, selector ),
                        { data: undefined, selector: selector, handler: fn, origType: type, origHandler: fn, preType: type } );
            
            return null;
        },
        
        die: function(selector, type, fn) {
            $(document).unbind( "live." + liveConvert( type, selector ), fn );
            return null;
        }
    });


    // create a namespace
    if (!this.CSTAR) {
        this.CSTAR = {};
    }

}());

(function (ns, $) {
    var _scrollbar_width = 0;
    
    // TODO: stubbed out CSTAR.t
    ns.t = function(key) {
        return key;
    };

    ns.utils = {
        CONNECT_ERR_MSG: CSTAR.t("application.something_went_wrong") + " " + CSTAR.t("application.change_not_saved") + " " + CSTAR.t("application.connection_lost"),

        /**
         * This function shows message bar
         *
         * @param messageBar jQuery element, usually jQuery("#messageBar")
         *
         * @param message text to appear on message bar
         *
         * @param options optional parameter, may contain none or more of following options <br>
         * <ul>
         * <li> style - optional. hash, where each key/value is treated as css style attribute and is
         * applied to message bar. By default message bar has css class .cstar_message_bar, this parameter can override
         * style attributes
         * <code>options = {style:{color:'red'}}</code></li>
         * <li> close - hash, with following keys:
         * <ul>
         * <li>text - Mandatory. Value is a string, text on a close link, i.e. "Close". </li>
         * <li>func - Optional. Function that will be called after close link was clicked and message bar was closed.</li>
         * <li>style - Optional. Hash, same as above, but applied to close link, which is HTML link.</li>
         * </ul>
         * i.e. <code>options = {close:{text:"Close Message",func:onClose,style:{color:'green'}}}</code>
         * </ul>
         *
         * It removes style attribute from specified element before (optionally) applying style supplied in
         * options. it's ok for messageBar defined in cstar_application now, because it does not have style attribute.
         * just be careful if you use this method with other elements
         *
         * If options is not passed, css class .cstar_message_bar is used
         *
         * See cstar_warnings.js and search for showMessageBar there to see how options parameters is being used
         */
        showMessageBar: function(messageBar, message, options) {
            var opts = options ||  {};
            var offset = messageBar.outerHeight();
            var headers = this.fixedPositionElements();
            var nav_panel = $("#view_management_nav_panel");
            
            messageBar.text(message);
            var close = opts.close;
            if (typeof(close) !== "undefined") {
                var closeLink = document.createElement("a");
                closeLink.href = "#";
                closeLink.onclick = function() {
                    CSTAR.utils.hideMessageBar(messageBar, 0);
                    if (close.func) {
                        close.func();
                    }
                    return false;
                };
                messageBar.prepend(closeLink); // append makes floated element go the next line in IE
                var cl = $(closeLink);
                cl.text(close.text);
                if (close.style) {
                    cl.css(close.style);
                }
                cl.css({"float":"right","padding-right":"23px"});
            }
            
            messageBar.removeClass("cstar_hide_object");
            messageBar.removeAttr('style'); // make sure there are no style attributes retained from previous invocation
            if (opts.style) {
                messageBar.css(opts.style);
            }
            
            $("#wrap").css("padding-top", offset + "px").addClass("orange_bar");
            $("#swTopHeader").css("top", offset + "px");
            
            // reset top so we don't set it twice
            headers.css('top', '');
            nav_panel.css('top', '');
            
            headers.each(function() {
                var top = parseInt($(this).css('top'), 10) + offset + 'px';
                $(this).css('top', top);
            });
            nav_panel.css('top', parseInt(nav_panel.css('top'), 10) + offset + 'px');
        },
        
        //This function hides message bar
        hideMessageBar: function (messageBar, interval){
            setTimeout(function(){
                 messageBar.addClass("cstar_hide_object");
                 $("#wrap").css("padding-top", "").removeClass("orange_bar");
                 $("#swTopHeader").css("top", "");
                 var headers = CSTAR.utils.fixedPositionElements();
                 headers.css("top", "");
                 $("#view_management_nav_panel").css("top", "");
            }, interval);
        },
        
        fixedPositionElements: function() {
            return $("#activityViewHeader, #updateHeading, #contactListingHeader, #inboxHeading, #notificationsContainer, #activityListingHeader");
        },

        //abbreviate title string
        abbreviateTitleString: function(titleDom,originalTitle,maxLength,ellipsis) {
            if (originalTitle.length > maxLength) {
                originalTitle = originalTitle.substr(0, maxLength - ellipsis.length) + ellipsis;
                titleDom.addClass("abbreviated");
            } else {
                titleDom.removeClass("abbreviated");
            }
            return originalTitle;
        },
        
        //abbreviate string
        abbreviateString: function(originalString,maxLength,ellipsis) {
            if (originalString === null) {
                originalString = '';
            }else if (originalString.length > maxLength) {
                originalString = originalString.substr(0, maxLength - ellipsis.length) + ellipsis;
            }
            return originalString;
        },

        keyPress: {
            bind: function(element, handler) {
                $(element).bind(($.browser.opera ? "keypress" : "keydown"), handler);
            },
        
            unbind: function(element, handler) {
                $(element).unbind(($.browser.opera ? "keypress" : "keydown"), handler);
            }
        },
        
        escapeKeyHandler: function(handler) {
            return function(e) {
                if (!e) {e = window.event;}
                if (e.keyCode === 27) { //27 is the escape key
                    CSTAR.utils.preventEventBubbling(e);
                    if (e.preventDefault) {e.preventDefault();}
                    handler();
                }
            };
        },
        
        preventEventBubbling: function(event) {
            if (event.stopPropagation) {event.stopPropagation();}
            if (typeof(event.cancelBubble) !== 'unknown') {
              event.cancelBubble = true;  // special for IE
            }
        },
        
        /**
         * Generalizes the coalescence of multiple consecutive events on an element
         * into a single event that occurs after some time of inactivity (timeout).
         * 
         * Parameters:
         * - jQueryElement [jQuery object]: the element to which the handler is bound
         * - events [string]: the events on which the handler is fired
         * - options [hash]:
         *   - getValue [function()]: should return the value that's passed into handler
         *   - handler [function(string)]: called when the event is fired
         *   - timeout [integer]: the milliseconds to wait before firing the handler
         */
        coalesceKeyEvents: function(jQueryElement, events, givenOptions) {
            // confirms that all required parameters are defined
            if (!givenOptions.getValue) {
                throw new Error("Undefined function in options: getValue");
            }
            if (!givenOptions.handler) {
                throw new Error("Undefined function in options: handler");
            }
            
            // assign some default options, in addition to the required ones
            var defaultOptions = { timeout: 400 };
            var options = $.extend({}, defaultOptions, givenOptions);
            
            var timerId;
            var cachedVal = null;
            
            function coalesceHandler() {
                var input = options.getValue();
                if (input === cachedVal || "undefined" === typeof input || !jQueryElement.is(":visible")) {
                    return;
                }
                
                cachedVal = input;
                options.handler(input);
            }
            
            jQueryElement.bind(events, function() {
                clearTimeout(timerId);   // reset the timeout to prevent execution on every keystroke
                timerId = setTimeout(coalesceHandler, options.timeout);
            });
            
            if (events.indexOf('change') !== -1) {
                jQueryElement.fixChangeEventOnIE();
            }
        },

        uncoalesceKeyEvents: function(jQueryElement, events) {
            jQueryElement.unbind(events);
        },
        
        scrollbarWidth : function () {
            if (_scrollbar_width === 0) {
                var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
                $('body').append(div);
                var child = $('div', div);
                var w1 = div[0].offsetWidth;
                div.css('overflow-y', 'scroll');
                child.css('width', '100%');
                var w2 = child[0].offsetWidth;
                div.remove();
                
                _scrollbar_width = (w1 - w2);
            }
            
            return _scrollbar_width;
        },
        
        // utility for sleeping - intended for debugging purposes
        // follows the java interface - delay - is in millisecs
        // note that calling this function will synchronously block your browser
        sleep: function (delay) {
            var start = new Date();
            var end;
            do {
                end = new Date();
            } while ((end - start) < delay);
        },

        // This is an override of getScript, which avoids a bug in jQuery.getScript
        // by aways adding the script to head. It's based on the "remote" script
        // downloading behaviour.
        getScript: function (url, callback) {
            /*function now(){
                return +new Date();
            }*/
            var head = document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            
            script.src = url;
            
            // Handle Script loading
            var done = false;
            
            // Attach handlers for all browsers
            script.onload = script.onreadystatechange = function(){
                if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                    done = true;
                    if (callback) {
                        callback();
                    }
                    
                    // Handle memory leak in IE 
                    script.onload = script.onreadystatechange = null; 
                }
            };

            script.onerror = function() {
                if (!done) {
                    done = true;
                    if (callback) {
                        callback();
                    }
                }
            };
            
            head.appendChild(script); 
        },

        // # of Permutations = 64^len
        randomString: function(len) {
            var i, value = [], CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.~";
            for(i = 0; i < len; i++) {
                value.push(CHARS.charAt(Math.floor(Math.random() * 64)));
            }
            return value.join("");
        },
        
        // Size of hash
        hashSize: function(hash) {
            var count = 0;
            var i;
            for (i in hash) {
                if (hash.hasOwnProperty(i)) {
                    count++;
                }
            }
            return count;
        },
        
        // Set all checkboxes inside parent to val:boolean
        bulkSetCheckboxes: function(parent, val, event) {
            $(parent).find('input:checkbox').each(function(){
                $(this).attr('checked', val);
                if (event) {
                    $(this).trigger(event);
                }
            });
        },
            
        Observable: function() {
            this.listeners = [];
            
            this.add_listener = function(listener) {
                this.listeners.push(listener);
            };
            
            this.remove_listener = function(listener) {
                var i;
                for (i = 0; i < this.listeners.length; i++) {
                    if (this.listeners[i] === listener) {
                        this.listeners.splice(i, 1);
                        return;
                    }
                }
            };
            
            this.notify_listeners = function(type, data) {
                //Since the listener may call remove_listener, we iterate over
                //a copy of the array.
                var listeners = this.listeners.slice(0); //slice(0) makes a copy of the array
                var i;
                for (i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    if ($.isFunction(listener[type])) {
                        listener[type](data);
                    }
                }
            };
        },

        // Converts <div img="<img src=''>"> to img tag. Call this when the containing
        // div is revealed. we use this tag to stop browser from loading the image event
        // when it is hidden
        showDelayedImage: function(container) {
            $(container).find("div[img^='<img']").each(function(){
                var $div = $(this);
                var imgTag = $div.attr('img');
                if(imgTag) {
                    $div.html(imgTag);
                }
            });
        },
        
        validation: {
            // returns true if the address is a valid email address; false otherwise
            emailIsValid: function(address) {
                var VALID_EMAIL_ADDRESS_REGEX = /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i;
                return (VALID_EMAIL_ADDRESS_REGEX.exec(address) !== null) && (address.length < 255);
            }
        },
        
        ajax_with_overlay: function(details) {
            var target = details.overlay_target || "body";
            var overlay = lipstick.make_delayed_overlay(target, details.overlay_delay);
            var original_complete = details.complete;
            details.complete = function() {
                overlay.remove();
                if (original_complete) {
                    original_complete.apply(this, arguments);
                }
            };
            overlay.show_delayed();
            return $.ajax(details);
        },
        
        is_ajax_return_error: function(data) {
            if (data.error === undefined || data.error === null || data.error === ""){
                return false;
            }
            return true;
        },
        
        send_ajax_request: function(url, values, error_message, callbackfunction){
            $(".notice").show();
            $.ajax({
                type: "POST",
                url: url,
                data: values,
                dataType: "json",
                success: function (data, textStatus) {
                    if (!CSTAR.utils.is_ajax_return_error(data)) {
                        $(".notice").text(data.message);
                        if (callbackfunction !== null){
                            callbackfunction();
                        }
                        $(".notice").hide();
                    } else {
                        $(".notice").hide();
                        lipstick.alert(data.error);
                    }
                },
                error: function() {
                    $(".notice").hide();
                    lipstick.alert(error_message);
                }
            });
        },
        
        make_url: function(base, params) {
            if (params.length !== 0) {
              if (base.indexOf("?") !== -1) {
                return base + "&" + $.param(params);
              }
              return base + "?" + $.param(params);
            }
            return base;
        },
        
        //reproduces the functionality of the ConvertUrlsToLinks ruby module for client-side conversion of strings
        //this implementation uses manual string splitting rather than the .split() method due to the cross-browser inconsistencies in regex-delimited split calls: http://blog.stevenlevithan.com/archives/cross-browser-split
        convert_urls_to_links: function(message) {

          //regex pattern from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
          var url_pattern = new RegExp(/\b((?:https?|ftp:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?\u00AB\u00BB\u201C\u201D\u2018\u2019]))/i),
              message_array = [],
              index, endIndex;

          //converts matched URLs to <a> links, escaping quotes and setting href protocol
          function convert_link(substring) {
            //assume "http://" if no supported protocol (http, https, ftp) is found in the URL (outputs link for URLs in the form www.google.com, bit.ly/foo, etc.)
            var link, protocol_pattern = new RegExp(/^(https?|ftp):\/\//i);
            //replace single quotes to avoid XSS
            if (substring.match(protocol_pattern)) {
              link = "<a href='" + substring.replace(/'/g, "%27") + "' target='_blank'>" + substring.escapeHTML() + "</a>";
            } else {
              link = "<a href='http://" + substring.replace(/'/g, "%27") + "' target='_blank'>" + substring.escapeHTML() + "</a>";
            }
            return link;
          }

          //find matches and populate message_array
          if (url_pattern.test(message)) {
            while (message.length > 0) {
              //test for URL
              index = message.search(url_pattern);
              if (index !== -1) {
                //set endIndex based on start index of match and match length
                endIndex = index + message.match(url_pattern)[0].length;
                //add content before match
                message_array.push(message.substring(0,index).escapeHTML());
                //add match
                message_array.push(convert_link(message.substring(index, endIndex)));
                //remove processed content from message 
                message = message.substring(endIndex, message.length);
              } else {
                //add content after last match
                message_array.push(message.escapeHTML());
                break;
              }
            }
          } else {
            //otherwise push entire message into array (doesn't contain links)
            message_array.push(message.escapeHTML());
          }
          
          return message_array.join("");
        },

        // true for IE version 10 or lower
        ie10: $.browser.msie && (document.documentMode === undefined || document.documentMode <= 10),

        ie9: $.browser.msie && (document.documentMode === undefined || document.documentMode <= 9),
        
        ie8: $.browser.msie && (document.documentMode === undefined || document.documentMode <= 8),

        ie7: $.browser.msie && (document.documentMode === undefined || document.documentMode <= 7),
        
        mobile: navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry)/),

        iPad: navigator.userAgent.match(/iPad/i),

        // true for iOS4 or lower
        ios4: function(){
            var is_ios4 = false;
            if(/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
                if (/OS [1-4]_\d like Mac OS X/i.test(navigator.userAgent)) {
                    is_ios4 = true;
                }
            }
            return is_ios4;
        },

        //Browsers that implement requestAnimationFrame may queue animations in background tabs.
        //This can lead to multiple animations all firing at once when users return to StreamWork.
        //If the tab is hidden, it doesn't make sense to show certain notifications, like flutter.
        isDocumentHidden: function() {
            if (undefined !== document.hidden) {
                return document.hidden;
            }
            if (undefined !== document.webkitHidden) {
                return document.webkitHidden;
            }
            return undefined;
        },

        respond_to_device_width: function() {
            var screen_size_classes = "view_wide view_tiny view_mini",
                width = $(window).width();

            if (width > 422) {
                $('body').removeClass(screen_size_classes).addClass('view_wide');
            } else if (352 < width && width <= 422) { 
                $('body').removeClass(screen_size_classes).addClass('view_tiny');
            } else {
                $('body').removeClass(screen_size_classes).addClass('view_mini');
            }
         },
        /**
         * @name CSTAR.utils.wrap
         * @description Provides a wrapper function which allows execution of a injected function
         * before calling the original object with specified property.
         * @param o - original object
         * @param property - property name
         * @param fn - function to be injected
         * @example
         * CSTAR.utils.injectFn(CSTAR.activity.factory, "notify_new_item", function(data) {
         *  BI.data.add_new_item(data);
         *  BI.status_notification.hide_message(data.clientCounter);
         * }),
         */
        wrap : function(o, property, fn) {
            if (!$.isPlainObject(o) || $.isEmptyObject(o)
                || typeof(property)!=='string' || !$.isFunction(fn)){
                throw new Error("Invalid argument");
            }
            var origFn = o[property];
            o[property] = function() {
                fn.apply(this, arguments);
                origFn.apply(this, arguments);
            };
        },
        
        basic_tinymce_config : function() {
            //This is basic initial configurations for all TinyMCE editors
            // Do't extend this one,instead make a copy of this options, and extend the copy.
            var settings = {
                content_css: "/stylesheets/constellation/tinymce_content.css",
                theme: "advanced",
                plugins: "paste",
                paste_auto_cleanup_on_paste: true,
                relative_urls : false,
                encoding: "xml",
                extended_valid_elements: "li[value|style]",
                theme_advanced_toolbar_location: "top",
                theme_advanced_toolbar_align: "left",
                theme_advanced_buttons1: "bold,italic,strikethrough,fontsizeselect,bullist,numlist,outdent,indent,link,unlink,forecolor",
                theme_advanced_buttons2: "",
                theme_advanced_buttons3: "",
                gecko_spellcheck: true,
                theme_advanced_resize_horizontal : 0, //jack - old value: 1
                theme_advanced_resizing_use_cookie : 0, //jack - old value: 1, there are some iframe height issues if we manually resize and click save/cancel
                theme_advanced_statusbar_location : "bottom",
                theme_advanced_resizing : true,
                theme_advanced_fonts : YAHOO.cubetree.util.tinymce_fonts()
            };
            var locale = "en";
            if ((CSTAR.current_user) &&  (CSTAR.current_user.locale) && (CSTAR.current_user.locale !== "dev")) {
                locale = CSTAR.current_user.locale;
            }
            return $.extend(settings, {"language" : locale});
        },

        //Optimized version of getting the browser height and width
        //this is almost 20 times faster than the JQuery $(window) variate
        //5 times faster on IE
        getBrowserHeight : function () {
            if(CSTAR.utils.ie8){
                return document.documentElement.offsetHeight;
            }
            return window.innerHeight;
        },

        getBrowserWidth : function () {
            if (CSTAR.utils.ie8){
                return document.documentElement.offsetWidth;
            }
            return window.innerWidth;
        },

        generateUniqueId : function() {
            return YAHOO.cubetree.util.generateId();
        },

        truncate : function(str, length) {
            if (str.length > length) {
                return str.substring(0, length) + "...";
            }
            return str;
        },

        lighten : function(color) {
          var r = parseInt(color.substring(1,3),16),
              g = parseInt(color.substring(3,5),16),
              b = parseInt(color.substring(5,7),16);
          return "rgba(" + r + "," + g + "," + b + ", 0.5)";
        }

    };

    //Does this browser support the HTML5 placeholder attribute?
    var supportsPlaceholder = function () {
        var i = document.createElement('input');
        return typeof i.placeholder !== 'undefined';
    };
    supportsPlaceholder = _.once(supportsPlaceholder);

    // Helper you need to call on a form that has IE-fake placeholders to make sure that
    // submitting will clear.
    $.fn.formHasPlaceholders = function () {
        if (supportsPlaceholder()) {   // Ignore this in HTML5 browsers
            return;
        }
        if (!this.is('form')) {
            throw "Must call formHasPlaceholders on a <form> element."
        }
        this.submit(function () {
            $(this).removePlaceholderValue();
        });
    };

    $.fn.removePlaceholderValue = function () {
        $(this).find(".swInputPlaceholder").each(function () {
            $(this).val("");
        });
    };

    // NOTE: you should additionally call $.formHasPlaceholders so that form submission works correctly
    $.fn.setPlaceholder = function(text) {
        // Set the placeholder text on each element
        this.each(function () {
            if ($(this).is('input, textarea')) {
                var ph = text;                
                if (supportsPlaceholder()) {                    
                    if (!$(this).attr("placeholder") || $(this).attr("placeholder") !== ph) {
                        $(this).attr("placeholder", ph);
                    }
                } else {                    
                    if (!ph) {
                        ph = $(this).attr("placeholder");
                    }  

                    if ($(this).attr("type") === "password") {   // For login screens need to use a secondary control
                        var html = $(this)[0].outerHTML;
                        html = html.replace("type=password", "type=text");  // IE doesn't let you change input type dynamically
                        var fakePwd = $(html).attr("id", null).attr("name", null).val(ph).insertBefore($(this));
                        var realPwd = $(this);

                        realPwd.hide();

                        fakePwd.focus(function () {
                            fakePwd.hide();
                            realPwd.show().focus();
                        });
                        realPwd.blur(function () {
                            if (realPwd.val() === "") {
                                realPwd.hide();
                                fakePwd.show();
                            }
                        });
                    }
                    else {
                        if (!$(this).val()) {
                            $(this).addClass("swInputPlaceholder");
                            $(this).val(ph);
                        }
                        
                        /*  the same input element can decide to use different placeholder text based on the context
                            unbind any previously defined focus,blur events in this namespace
                            this solves the closure problem where the ph variable could be
                            bound to an old value 
                        */
                        $(this).off("focus.placeholder").off("blur.placeholder");

                        $(this).on("focus.placeholder", function () {
                            if ($(this).hasClass("swInputPlaceholder")) {
                                $(this).removeClass("swInputPlaceholder");
                                $(this).val("");                            
                            }
                        });

                        $(this).on("blur.placeholder", function () {
                            if (!$(this).val ()) {
                                $(this).addClass("swInputPlaceholder");
                                $(this).val(ph);
                            }
                        });
                    }
                }
            }
        });

        return this;
    };

    //Original setPlaceholder function need to make a value check in order to make sure placehoder text is not submitted to server.
    //Enhancement is made for original serPlaceHolder function to create a placeholder div on the fly to prevent the placeholder text being submitted to server
    $.fn.setPlaceholderArea = function(text) {
        if (supportsPlaceholder()) {
            if (!this.attr("placeholder")) {
                this.attr("placeholder", text);
            }
        } else {
            if (!text) {
                text = this.attr("placeholder");
            }            
            var inputBody = this; 
            $(inputBody).clone().insertBefore($(inputBody));
            var hintArea = $(inputBody).prev();
            $(inputBody).hide();
            hintArea.val(text).attr('readonly', 'readonly').attr("id", "").attr("name", "").addClass("textarea_placeholder");
        
            if ($(inputBody).is('input, textarea')) {
                if (!$(hintArea).val()) {
                    $(hintArea).val(text);
                }
            
                $(hintArea).focus(function () {
                    $(inputBody).focus();
                });
                
                $(inputBody).focus(function () {
                    $(hintArea).hide();
                    $(this).show();
                });
            
                $(inputBody).blur(function() {
                    if (!$(this).val()) {
                        $(this).hide();
                        $(hintArea).show();
                    }
                });
            }
        }
        
        return this;
    };

    $.fn.showingPlaceholder = function() {
        if (supportsPlaceholder()) {
            //our old custom placeholder was only visible when the element didn't have focus
            return $(this).val() === '' && document.activeElement !== this.get(0);
        }
        return $(this).hasClass("swInputPlaceholder");
    };

    // Limit textarea to x characters
    $.fn.limitTextareaLength = function (size, callback) {
        var value_was = '';
        size = size || 500;
        this.bind('keyup resize', _.debounce(function(){
            var textLength = this.value.length;
            if (textLength > size) {
                this.value = value_was;
                return;
            }
            value_was = this.value;
            if ($.isFunction(callback)) {
                callback(this, textLength);
            }
        }, 300));
    };

    $.fn.fixChangeEventOnIE = function() {
        //IE doesn't fire the change event until the input element loses focus.
        if (CSTAR.utils.ie8) {
            this.filter("input:radio, input:checkbox, label").unbind('click.fixChangeEventOnIE').bind('click.fixChangeEventOnIE', function() {
                this.blur();
                if ($(this).attr("disabled") !== true) {
                    this.focus();
                }
            });
        }
        if (CSTAR.utils.ie10) {
            this.filter("input:text").unbind('keypress.fixChangeEventOnIE').bind('keypress.fixChangeEventOnIE', function (e) {
                if (e.keyCode === 13) { // Trigger the change event for IE if the user presses Enter
                    this.blur();
                    if ($(this).attr("disabled") !== true) {
                        this.focus();
                    }
                }
            });
        }
        return this;
    };

    $.fn.fixChangeEventForRadioButtonsOnIE = $.fn.fixChangeEventOnIE;

    $.fn.fixChangeEventForRadioButtonsOnWebkit = function() {
        //Webkit doesn't fire the change event at all if you select a radio button with the keyboard.
        if ($.browser.webkit) {
            this.filter("input:radio").each(function() {
                $(this).data("was_checked", $(this).is(":checked"));
            }).unbind(".fixChangeEventForRadioButtonsOnWebkit").bind("focus.fixChangeEventForRadioButtonsOnWebkit", function() {
                if ($(this).is(":checked") && !$(this).data("was_checked")) {
                    $(this).change();
                }
            }).bind("change.fixChangeEventForRadioButtonsOnWebkit", function() {
                $("input[name='"+$(this).attr("name")+"']").each(function() {
                    $(this).data("was_checked", $(this).is(":checked"));
                });
            });
        }
        return this;
    };

}(CSTAR, jQuery));