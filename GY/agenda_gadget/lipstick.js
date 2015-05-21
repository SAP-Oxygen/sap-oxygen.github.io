/*global CSTAR, jQuery, window, document, clearTimeout, setTimeout, showWithIEHack, showDialog, _ */ 
/**
 * Fancy look and feel library.
 * 
 * Want to look better? Put on some lipstick. Comes in a variety of colours and flavours.
 * Now available in Pink.
 * 
 * Requires jQuery.color plugin
 * 
 * @author dbiollo
 */

var lipstick = {};

(function($){ // importing jQuery as $ ( - see last line)
    
    var datepicker;

    function showWithIEHack(dom){
        // In IE, the fade-in (animating filter) looks really bad. Read below for more:
        // http://channel9.msdn.com/forums/TechOff/257324-IE7-alpha-transparent-PNG--opacity/
        if (CSTAR.utils.ie8) {
            $(dom).css("display", "block");
        }
        else {
            $(dom).fadeIn();
        }
    }

    lipstick.fadeIn = showWithIEHack;
    
    /*
     * Refactored 2x2 and SWOT popups into lipstick
     */
    lipstick.makeItemTipPopup = function() {
        var _jpopup;
        var _timer = null;
        var _maxHeight;
        var NOTCH_OFFSET = 62;
        var CONTENT_WIDTH = 369;
        
        function _getPopupHtml() {
            var sb = [];
            sb.push('<div class="lipstick-tooltip">');
            sb.push('<div class="top-left"></div><div class="top"></div><div class="top-right"></div><div class="top-notch"></div>');
            sb.push('<div class="bottom-left"></div><div class="bottom"></div><div class="bottom-right"></div>');
            sb.push('<div class="mid-left"></div><div class="mid-right"></div><div class="mid"></div>');
            sb.push('</div>');
            return sb.join('');
        }
        
        function _stopTimer() {
            if (_timer !== null) {
                clearTimeout(_timer);
                _timer = null;
            }
        }
        
        function _fitHeight(h) {
            if (!_maxHeight) {
                _maxHeight = _jpopup.find('.mid').height();
            }
            if (h > _maxHeight) {
                h = _maxHeight;
            }
            _jpopup.children('.mid-left,.mid-right,.mid').css('height', h);
            _jpopup.children('.bottom-left,.bottom,.bottom-right').css('top', h + 13);
            _jpopup.height(h + 16);
        }
        
        function _hide() {
            _stopTimer();
            _jpopup.hide();
            var onHide = _jpopup.children('.mid').data("onHide");
            if(onHide) {
                onHide();
                _jpopup.children('.mid').data("onHide", null);
            }
            _jpopup.children('.mid').children().remove();
            if (_maxHeight) {
                _fitHeight(_maxHeight);
            }
        }
        
        function _bind() {
            _jpopup.hover(function() {
                _stopTimer();
            }, function() {
                _hide();
            });
            _jpopup.click(function(e) {
                if ($(e.target).is("a")) {
                    _hide();
                }
            });
        }
        
        function _adjustWidth(w) {
            _jpopup.children('.mid, .top, .bottom').css('width', w);
            _jpopup.children('.top-right, .bottom-right').css('left', w + 3);
            _jpopup.children('.mid-right').css('left', w + 4);
            _jpopup.width(w + 6);
        }
        
        var popup = {
            show: function(options) {
                this.hide();
                var left = null, top = null;
                var notchPos = NOTCH_OFFSET;
                var contentWidth = CONTENT_WIDTH;
                
                if (options) {
                    if (options.offset) {
                        left = options.offset.left;
                        top = options.offset.top;
                    }
                    if (options.jtarget) {
                        var relOff = options.jtarget.offset();
                        left += relOff.left;
                        top += relOff.top;
                    }
                    if (options.notchPos) {
                        notchPos = options.notchPos;
                    }
                    if (options.content) {
                        _jpopup.children('.mid').html(options.content);
                    }
                    if (options.contentWidth) {
                        contentWidth = options.contentWidth;
                    }
                    if ($.isFunction(options.onHide)) {
                         _jpopup.children('.mid').data('onHide', options.onHide);
                    }
                    else {
                        _jpopup.children('.mid').data('onHide', null);
                    }
                }
                
                if (left !== null && top !== null) {
                    _jpopup.css({
                        'left': left - notchPos,
                        'top': top
                    });
                    _jpopup.find('.top-notch').css('left', notchPos - 13);
                }
                _adjustWidth(contentWidth);
                _jpopup.show();
            },
            
            hide: function(timeout) {
                if (typeof timeout === 'number') {
                    _stopTimer();
                    _timer = setTimeout(_hide, timeout);
                }
                else {
                    _hide();
                }
            },
            
            fitHeight: function(h) {
                _fitHeight(h);
            }
        };
        _jpopup = $(_getPopupHtml());
        $('body').append(_jpopup);
        _bind();
        return popup;
    };
    
    /**
     * @param from - requires a UTC formatted string (javascript has toUTCString() method in Date() object)
     */
    lipstick.timeAgoInWords = function(from, no_about_text) {
        var to = new Date().getTime();
        if (to < from) {
            to = from;
        }
        var parsed = Date.parse(from);
        if (_.isNaN(parsed)) {
            return ""; // If here, a bad from date value was provided
        }
        return lipstick.distance_of_time_in_words(to, parsed, no_about_text);
    };

    /**
     * @params to and from - Date objects
     */
    lipstick.distance_of_time_in_words = function(to, from, no_about_text) {
        var about = true;
        if (no_about_text) {
            about = false;
        }
        var diff_in_seconds = (Math.abs(to - from)/1000);
        var diff_in_minutes = Math.floor(diff_in_seconds/60);
        if (diff_in_minutes === 0) {
            return "time.less_than_a_minute";
        } 
        if (diff_in_minutes === 1) {
            return "time.a_minute";
        } 
        if (diff_in_minutes < 45) {
            return CSTAR.t("time.x_minutes", {n: diff_in_minutes});
        } 
        if (diff_in_minutes < 90) {
            if (about) {
                return "time.about_1_hour";
            }
            return "time.1_hour";
        } 
        if (diff_in_minutes < 1440) {
            if (about) {
                return CSTAR.t("time.about_x_hours", {n: Math.round(diff_in_minutes/60)});
            } 
            return CSTAR.t("time.x_hours", {n: Math.round(diff_in_minutes/60)});
        } 
        if (diff_in_minutes < 2880) {
            return "time.1_day";
        } 
        if (diff_in_minutes < 43200) {
            return CSTAR.t("time.x_days", {n: Math.round(diff_in_minutes/1440)});
        } 
        if (diff_in_minutes < 86400) {
            if (about) {
                return "time.about_1_month";
            } 
            return "time.1_month";
        } 
        if (diff_in_minutes < 525960) {
            if (about) {                
                return CSTAR.t("time.about_x_months", {n: Math.round(diff_in_minutes/43200)});
            } 
            return CSTAR.t("time.x_months", {n: Math.round(diff_in_minutes/43200)});
        } 
        if (diff_in_minutes < 1051920) {
            if (about) {
                return "time.about_1_year";
            } 
            return "time.1_year";
        } 
        return CSTAR.t("time.over_x_years", {n: Math.round(diff_in_minutes/525960)});
    };
    
    function getColor(elem, attr){
        var color;
        
        do {
            if(elem.nodeType === 1) {
                color = jQuery.curCSS(elem, attr);
                // Keep going until we find an element that has color, or we hit the body
                if ((color !== '' && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') || jQuery.nodeName(elem, "body")) {
                    break;
                }
            }
            
            attr = "backgroundColor";
            elem = elem.parentNode;
        }
        while (elem);
        
        return color;
    }
    
    /**
     * Causes the current dom element to highlight.
     *
     * @param options[color]         the highlight color
     * @param options[duration]      the duration the highlight is held
     * @param options[ramp]          the speed highlight fades in
     * @param options[fade]          the speed highlight fades out
     */
    lipstick.flutter = function(dom, options){
        if ($(dom).data("fluttering") || CSTAR.utils.isDocumentHidden()) {
            return;
        }
        
        var defaults = {
            color: "#E0F4FE",
            duration: 1000,
            ramp: "fast",
            fade: "slow"
        };
        
        var settings = $.extend(defaults, options);

        $(dom).each(function(){
            if (this.nodeType === 1 && !$(this).is("script")) {
                $(this).data("fluttering", true);
                // Cache the original element inline style and store it in the object properties
                // This allows us to prevent duplicate animations from rapid editing            
                var originalStyle = this.original_style;
                if (originalStyle !== undefined) {
                    return;
                }

                this.original_style = $(this).attr("style") || "";

                // visible background color - inherited from the parent
                var vColor = getColor(this, "backgroundColor");

                if ($(this).is(":visible")) {
                    $(this)            // fade in the highlight color
                    .animate({
                        "backgroundColor": settings.color
                    }, {
                        duration: settings.ramp
                    })            // hold the highlight
                    .animate({
                        "backgroundColor": settings.color
                    }, {
                        duration: settings.duration
                    })            // fade out the highlight and restore the old background
                    .animate({
                        backgroundColor: vColor
                    }, {
                        duration: settings.fade,
                        complete: function(){
                            // Restore the original inline style
                            $(this).attr("style", this.original_style);
                            this.original_style = undefined;
                            $(this).data("fluttering", false);
                            if ($.isFunction(settings.callback)) {
                                settings.callback();
                            }
                        }
                    });
                }
            }
        });
    };
    
     /**
     * Causes the text in the current dom element to highlight.
     *
     * @param options[color]         the highlight color
     * @param options[duration]      the duration the highlight is held
     * @param options[ramp]          the speed highlight fades in
     * @param options[fade]          the speed highlight fades out
     */
    lipstick.flutterText = function(dom, options){
        var defaults = {
            color: "#ff1900",
            duration: 1000,
            ramp: "fast",
            fade: "slow"
        };
        
        var settings = $.extend(defaults, options);
        
        $(dom).each(function(){
            // Cache the original element background color and store it in the object properties
            // This allows us to prevent duplicate animations from rapid editing            
            var fontColor = this.original_color;
            if (fontColor) {
                return;
            }
            
            fontColor = $(this).css("color");
            this.original_color = fontColor;
            
            // visible color - inherited from the parent
            var vColor = getColor(this, "color");
            
            $(this)            // fade in the highlight color
            .animate({
                "color": settings.color
            }, {
                duration: settings.ramp
            })            // hold the highlight
            .animate({
                "color": settings.color
            }, {
                duration: settings.duration
            })            // fade out the highlight and restore the old background
            .animate({
                color: vColor
            }, {
                duration: settings.fade,
                complete: function(){
                    $(this).css({
                        color: fontColor
                    });
                    this.original_color = null;
                }
            });
        });
    };
    
    function showMessageDialog(message, options){
        var content = $("<div class='lipstick_message_dialog'></div>");
        
        // If the message contains carriage returns, split it into multiple lines
        // TODO: parse tabs?
        var lines = message.split("\n");
        var i;
        for (i = 0; i < lines.length; i++) {
            var msgLine = "<div class='lipstick_dialog_msg'>" + lines[i] + "</div>";
            content.append(msgLine);
        }

        if (CSTAR.utils.ie8) {
            // IE does not calculate the right width of lipstick_dialog_content 
            // even though lipstick_message_dialog has a max-width of 400.
            options.maxWidth = 400;
        }
        
        return showDialog(content, options);
    }
        
    // This function is now deprecated. Use sap.sw.ui.button.enable
    lipstick.enableOkButton = function(jbtn, enabled){
        if(enabled) {
            sap.sw.ui.button.enable(jbtn);
        } else {
            sap.sw.ui.button.disable(jbtn);
        }
    };
    
    // This function is now deprecated.  Reverse your logic and use sap.sw.ui.button.isEnabled(selector)
    lipstick.isButtonDisabled = function(jbtn){
        return $(jbtn).hasClass("disabled");
    };

    // This function is now deprecated. Use sap.sw.ui.button.createCancelHtml
    lipstick.makeCancelButton = function(label, cssClass){
        return sap.sw.ui.button.createCancelHtml(label);
    };

    // This method is now deprecated. Tell external developers to use sap.sw.ui.button
    lipstick.makeMethodButton = function(label, cssClass, image){
        var btnStr;
        var css = "";
        if (cssClass) {
            css += " " + cssClass;
        }
        btnStr = "<div class='methodBtn" + css + "'><div class='methodLeft'></div><div class='methodRight'></div>";
        btnStr += "<div class='methodMiddle'>";
        if (image) {
            btnStr += "<div class='" + image + "'></div>";
        }
        btnStr += label + "</div></div>";
        return btnStr;
    };
    
    lipstick.makeCheckbox = function(label) {
        var id = Math.floor(Math.random()*1000000);
        return '<div class="lipstickCheckbox"><input id="'+id+'" type="checkbox">'
            + '<label for="'+id+'">'+label+'</label></div>';
    };
    
    /**
     * Creates and displays an HTML dialog box, which contains the given DOM content.
     *
     * @param {Object} content a div containing the contents of the dialog box
     * @param {Object} options settings to control the display of the dialog:
     *      onOK : a Function handler to call when clicking OK. If the handler returns
     *        <code>false</code>, the dialog will not be closed.
     *      onCancel : a Function handler to call when clicking Cancel.
     *      title : a string to display as the title of the dialog
     *      showCancel : (default false) a boolean to indicate whether to include a Cancel button
     *      onOpen : a Function handler to call after the contents are appended to the modal dialog.
     *      onClose : a Function handler to call just before the dialog is closed.  Handy for cleanup tasks
     *        like appending dialog to the body, etc.
     *      width: parameter is now deprecated.  Use CSS to size and style your content.
     *
     * @return {Object} the jQuery SimpleModal object (the dialog container object
     *      is in the property <code>dialog.container</code>
     */
    function showDialog(content, dialog_options){
        var dialog_default_options = {
            okLabel: "infrastructure.ok",
            cancelLabel: "infrastructure.cancel",
            okDisabled: false,
            title: null,
            showOk: true,
            showCancel: true,
            modal_mode: true,
            modalScrollable: false,
            anchored: false,
            showCarrot: false,
            scrollable: false,
            containerCss: {},
            opacity: "60"
        };
                
        var dialog = null;
        
        var modalOptions = {};
        if (dialog_options.modalOptions) {
            modalOptions = dialog_options.modalOptions;
            delete dialog_options.modalOptions;
        }
        
        var options = $.extend({}, dialog_default_options, dialog_options);
        
        if (options.id) {
            dialog = $("<div class='dialog_container' id='" + options.id + "'></div>");
        }
        else {
            dialog = $("<div class='dialog_container'></div>");
        }
        if (dialog_options.dialogCss){
            dialog.css(dialog_options.dialogCss);
        }

        if (!options.modal_mode) {
            $(dialog).addClass("non_modal_mode");
            options.showOk = false;
            options.showCancel = false;
            options.title = null;
            dialog.append("<div class='dismiss-button' title='" + 'infrastructure.close' + "'></div>");
        }

        if (options.scrollable) {
            $(dialog).addClass("scrollable");
        }
        
        // Add the title bar
        if (options.title) {
            var header = "";
            if (options.extraHeaderContent) {
                header = $("<div class='dialog_header'><div class='dialog_header_content'><div class='dialog_header_content_extra'>" + options.extraHeaderContent + "</div>" + options.title.escapeHTML() + "</div></div>");
            } else {
                header = $("<div class='dialog_header'><div class='dialog_header_content'>" + options.title.escapeHTML() + "</div></div>");
            }
            dialog.append(header);
            header.hide();
        }

        if (options.showCloseButton) {
            closeButton = $("<div class='close-dialog sap-icon icon-sys-cancel-2'></div>");
            dialog.append(closeButton);
        }
        
        // Note: need to add the content div before calling show - otherwise it 
        // might get exception on Javascript
        var container = $("<div class='lipstick_dialog_content'/>");
        if (options.content_id) {
            container.attr("id", options.content_id);
        }

        if (options.showCarrot) {
            dialog.append('<div class="caret left"></div>');
        }

        // apply any customization CSS for the content container
        var contentPaddingAndBorder = 36; // 36 is the size of the default padding plus border 
        if (options.contentCss) {
            var definedContentPaddingAndBorder = options.contentCss.contentPaddingAndBorder;
            options.contentCss.contentPaddingAndBorder = null;
            if (undefined !== definedContentPaddingAndBorder) {
                contentPaddingAndBorder = definedContentPaddingAndBorder;
            }
            
            container.css(options.contentCss);
        }
        
        dialog.append(container);

        if (options.modal_mode && !options.hide_footer) {
          var footer = $("<div class='dialog_footer'></div>");
          var buttonBar = $("<div class='dialog_footer_content' />");
          footer.append(buttonBar);
          dialog.append(footer);
          footer.hide();
          
          var btnStr = "";
          if (options.buttonBarAddedDiv) {
            btnStr += options.buttonBarAddedDiv;
          }
          if (options.showOk !== false) {
            // Make button a primary button if there is cancel button
            var ok_css = options.showCancel === false ? "okBtn" : "okBtn btn-primary";
            btnStr += sap.sw.ui.button.createHtml(options.okLabel, ok_css, options.okDisabled);
          }
          if (options.showCancel !== false) {
            btnStr += sap.sw.ui.button.createCancelHtml(options.cancelLabel, "cancel-dialog-button");
          }
          
          buttonBar.append(btnStr);
        }
               
        var simpleModalDialog; // calculated when returning for access in the onOK/onCancel handlers 
        
        // Hook up the handlers
        dialog.find(".okBtn").bind('click.lipstickOK', function(e){
            if (!lipstick.isButtonDisabled(this)) {
                if(options.validate) {
                    if(options.validate.call(dialog) === false) {
                        e.stopImmediatePropagation();
                        return;      
                    }
                }
                if (options.onOK) {
                    if (options.onOK.call(dialog, simpleModalDialog) === false) {
                        e.stopImmediatePropagation();
                        return;
                    }
                }
                if (options.waitTimeOnOK) {
                    $(this).unbind('click.lipstickOK');
                    setTimeout(function(){
                        if ($(dialog).parent().length !== 0) {
                            $.modal.close();
                        }
                    }, options.waitTimeOnOK);
                }
                else if (options.keepOpenOnOk && !options.tryAgain) {
                    $(this).unbind('click.lipstickOK');
                    
                } else if (options.tryAgain){}
                else {
                    $.modal.close();
                }
            } else {
                e.stopImmediatePropagation();
            }
        });
        
        dialog.find(".cancel-dialog-button, .dismiss-button, .close-dialog").click(function(){
            if(options.keepOpenOnOk && $(this).hasClass("okBtn")) {
                return;
            }

            if (options.onCancel) {
                options.onCancel.call(dialog, simpleModalDialog);
            }
            
            $.modal.close();
        });
        
        // gather a list of the handlers we want to handle in the UI
        var handlers = [];
        if (options.showOk !== false && options.disableEnterKey !== true) {
            // handler for the ENTER key
            handlers.push(function(e){
                if (!e) {
                    e = window.event;
                }
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                if (e.keyCode === 13 && (!$(e.target).is("textarea"))) { //13 is the enter key
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    dialog.find(".okBtn").click();
                }
            });
        }
        
        if (options.disableEscapeKey !== true) {
            // handler for the ESCAPE key
            handlers.push(CSTAR.utils.escapeKeyHandler(function(){
                if (options.showCancel !== false) {
                    dialog.find(".btn.cancel-dialog-button").click();
                }
                else {
                    $.modal.close();
                }
            }));
        }
        
        var keyPressUnbindHandler = lipstick.modalKeyPressHandlers(handlers);
        
        // get the default modal options, but include our own handler for when it's opened
        modalOptions = lipstick.modalOptions($.extend({
            //width: parameter is now deprecated.  Use CSS to size and style your content.
            anchored: options.anchored,
            modal_mode: options.modal_mode,
            zIndex: options.zIndex || 1040,
            opacity: options.opacity,
            modalScrollable: options.modalScrollable,
            containerCss: options.containerCss,
            onOpen: function(){
                // Delay adding the main document content, otherwise the ready event will
                // bind too early, and be unable to find DOM elements
                
                $(".lipstick_dialog_content", this.dialog.container).append(content);
                
                // The rest is copied from simplemodal open() ...
                if (options.modal_mode) {
                    this.dialog.overlay.show();
                    $("body").addClass("jam-dialog-open"); // this is for the Kaltura IE, Kaltura video player does not respect z-index
                }
                this.dialog.container.show();
                this.dialog.data.show();
                
                // Calling before width is obtained. jQuery width measures what currently displays on the screen (for IE).
                // If the dialog is too large and part of it is displayed off the screen, then an incorrect
                // value will be obtained.
                
                // dbiollo - fix for Firefox 3
                if (!options.anchored) {
                    this.setPosition();
                }

                // ivgonzalez - fix for IE when a child container of the dialog has max-width
                if (options.minWidth && this.dialog.container.width() < options.minWidth) {
                    this.dialog.container.width(options.minWidth);
                }

                if (options.maxWidth && this.dialog.container.width() > options.maxWidth) {
                    this.dialog.container.width(options.maxWidth);
                }

                this.opts.resize();
               
                this.dialog.container.find(".dialog_header").show();
                this.dialog.container.find(".dialog_footer").show();
                
                // Actually calling this again since adding the footer and header afterwards 
                // causes the whole dialog to be offset down.
                // TODO:  Find a smarter way than calling this twice.  See ADAPT1338433
                if (options.anchored) {
                    this.dialog.container.css({left: options.anchorPosition.left, top: options.anchorPosition.top});
                } else {
                    this.setPosition(); 
                }

                if ($.isFunction(options.onOpen)) {
                    options.onOpen.call(this.dialog);
                }
            },
            onClose: function(){
                keyPressUnbindHandler();
                if (!jamApp.modal) {
                    $('html').removeClass('noScroll');
                    $("body").removeClass("jam-dialog-open"); // this is for the Kaltura IE, Kaltura video player does not respect z-index
                }
                if ($.isFunction(options.onClose)) {
                    options.onClose.call(this, dialog);
                }
                $.modal.close();
            },
            onShow: function(dialog){
                if (!jamApp.modal) {
                    $('html').addClass('noScroll');
                }
                if ($.isFunction(options.onShow)) {
                    options.onShow.call(this, dialog);
                }
            },
            resize: function(){}
        }, modalOptions));
        
        var result = $.modal(dialog, modalOptions);
        // $.modal will return false if there's another modal dialog open
        if (result) {
            result.dialog.openDrawer = function() {
                var container = this.container;
                var dialog_container = container.find(".dialog_container");
                var drawer = container.find(".lipstick_drawer");
                if (drawer.length === 0) {
                    drawer = $('<div class="lipstick_drawer"></div>');
                    this.container.prepend(drawer);
                }
                setTimeout(function() {
                    drawer.addClass("open");
                    dialog_container.addClass("open");
                }, 0);
                return drawer;
            };
            result.dialog.closeDrawer = function() {
                var container = this.container;
                var dialog_container = container.find(".dialog_container");
                container.find(".lipstick_drawer").removeClass("open");
                dialog_container.removeClass("open");
            };
        }

        return result;
    }
    
    /**
     * Generate a default set of options for the modal UI. The optional parameter includes a custom
     * set of options that the caller can include.
     */
    lipstick.modalOptions = function(customOptions){
        // first we define the default options for the modal display
        // dbiollo - note that we *must* pass a bkgnd color for IE to properly do an overlay
        var defaultOptions = {
            close: false,
            backgroundColor: '#000000'
        };
        
        // merge the keys from "customOptions" into "defaultOptions" 
        return $.extend(defaultOptions, customOptions);
    };
    
    /**
     * Binds key handlers to the modal UI.
     * Returns a function that will unbind the key handlers; the returned function should be called
     * in the onClose handler.
     */
    lipstick.modalKeyPressHandlers = function(handlers){
        if (!(handlers instanceof Array)) {
            handlers = [handlers];
        }
        
        function forEachHandler(targetFunction){
            var i;
            for (i = 0; i < handlers.length; i++) {
                targetFunction(handlers[i]);
            }
        }
        
        // bind the handlers, after a slight delay
        setTimeout(function(){
            forEachHandler(function(handler){
                CSTAR.utils.keyPress.bind(document, handler);
            });
        }, 10);
        
        // return a function that will unbind the handlers 
        return function(){
            forEachHandler(function(handler){
                CSTAR.utils.keyPress.unbind(document, handler);
            });
        };
    };
    
    /**
     * Creates and displays an HTML dialog box, as a replacement for the JS "alert" function.
     *
     * @param {String} message string message to display
     */
    lipstick.alert = function(message, options) {
        options = options || {};
        var callback = options.callback;
        var title = options.title || "common.error";
        var okLabel = options.okLabel;

        //Setting the id prevents identical dialogs being stacked on top of each other
        var id = "lipstick_alert_";
        if (lipstick.alert_ids.hasOwnProperty(message)) {
            if (window.console) {
                window.console.error("Prevented identical lipstick.alert dialog from being displayed: "+message);
            }
        }
        else {
            lipstick.alert_ids[message] = lipstick.alert_counter++;
        }
        id += lipstick.alert_ids[message];
        
        return showMessageDialog(message, {
            showCancel: false,
            onClose: function(dialog) {
                if ($.isFunction(callback)) {
                    callback.call(dialog);
                }
                delete lipstick.alert_ids[message];
            },
            title: title,
            id: id,
            okLabel: okLabel
        });
    };
    
    lipstick.alert_ids = {};
    lipstick.alert_counter = 1;
    
    /**
     * Creates and displays an HTML dialog box, as a replacement for the JS "confirm" function.
     *
     * @param {String} message string message to display
     * @param {Function} callback to be called when OK is pressed, before closing dialog
     * @param {Hash} options can include title, okLabel, onClose, scrollable
     */
    lipstick.confirm = function(message, callback, options){
        var defaultOptions = {
            onOK: callback,
            title: "infrastructure.please_confirm"
        };
            //third parameter is an options hash
        _.extend(defaultOptions, options);

        return showMessageDialog(message, defaultOptions);
    };

    /**
     * Creates and displays an HTML dialog box, which contains the given DOM content.
     *
     * @param {Object} content a div containing the contents of the dialog box
     * @param {Object} options settings to control the display of the dialog:
     *      onOK : a Function handler to call when clicking OK. If the handler returns
     *        <code>false</code>, the dialog will not be closed.
     *      onClose: a Function handler to call just before the dialog is closed.  Handy for cleanup tasks
     *        like appending dialog to the body, etc.
     *      onShow: a Function to call as the dialog is opened
     *      id: (optional) DOM id of the dialog container
     *      title : a string to display as the title of the dialog
     *      showCancel : (default true) a boolean to indicate whether to include a Cancel button
     *      okDisabled: set to true if you want the OK button initially disabled. You must enable 
     *                  the button from your own code.
     *      okLabel: a label for the OK button
     *      cancelLabel: a label for the Cancel button
     *      noClone:   a boolean.  If it is set (true), lipstick will not  create a clone of the object, 
     *                 which is needed if you have unique IDs which you need to manipulate
     *                 Not setting this with unique IDs will cause unwanted behaviour as your 
     *                 Javascript code will just act upon the first matching ID it finds.
     *
     * @return {Object} the jQuery SimpleModal object (the dialog container object
     *      is in the property <code>dialog.container</code>
     */
    lipstick.dialog = function(data, options){

        // Copied from jquery.simpledialog so we can wrap the content in a modal dialog
        if (typeof data === 'string' || typeof data === 'number') {
            // NOTE: dbiollo - there is a *huge* difference between calling html and just $
            // With HTML, the JS and ready function get called immediately, which is too soon.
            //data = $('<div/>').html(data);
            //data = $(data);
            data = $("<div>" + data + "</div>");
        }
        else if (typeof data === 'object') {
            data = data instanceof jQuery ? data : $(data);
            
            // dbiollo - NOTE - this condition seems to be *always true* in IE7 
            if ((data.parent().parent().size() > 0) && (!options.noClone)){
                data = data.clone(true);
            }
            data.css("display", "block");
        }
        
        return showDialog(data, options);
    };
    
    function _makeBaseForm(){
        return $('<div class="dialog_container"><div class="dialog_header"><div class="dialog_header_content" /></div><div class="dialog_body_content" /><div class="dialog_footer"><div class="dialog_footer_content" /></div></div>');
    }
    
    /**
     * Create a basic form with title and buttons.
     *
     * A basic form contains 3 areas (header, body, and footer). Title will
     * be added into header. Content is added to body. Buttons will be
     * created into footer.
     * The height of the dialog is not fixed.
     *
     * @param content   jQuery object or html string containing the form controls
     *                  to be displayed.
     * @param options   javascript object specifying the following properties:
     *      width (integer)         [required] content width (not dialog width).
     *      title (string)          [optional]form title.
     *      buttons (array)         [optional]a list of buttons to be added into
     *                              footer area. The order of the buttons is from
     *                              right to left.
     *                              button {
     *                                  css : (string) css class name,
     *                                  label :  (string) button label,
     *                                  disabled: (boolean, default=>false) button disabled state.
     *                              }
     *
     * @return jQuery object containing the form.
     */
    lipstick.basicForm = function(content, options){
        if (!options) {
            options = {};
        }
        
        var jform = _makeBaseForm();
        
        $('.dialog_header_content', jform).text(options.title);
        var jbody = $('.dialog_body_content', jform);
        if (options.bodyClass) {
            jbody.addClass(options.bodyClass);
        }
        jbody.html(content);
        
        jform.width(options.width + 14); // IE needs some width to do the floating properly
        if (options.buttons) {
            var jfooter = $('.dialog_footer_content', jform);
            
            $.each(options.buttons, function(){
                if (this.isCancel) {
                    jfooter.append(sap.sw.ui.button.createCancelHtml(this.label));
                }
                else {

                    jfooter.append(sap.sw.ui.button.createHtml(this.label, "okBtn " + this.css, this.disabled));
                }
            });
        }
        
        return jform;
    };
    
    /**
     * Creates the edit dialog box that's used by many methods with the specified
     * HTML content and options.  The height of the dialog is not fixed.
     *
     * @param content   jQuery object containing the DOM to be displayed in the body
     *                  of the dialog box
     * @param dialog_options   javascript object specifying the following properties:
     *      title (string)          title of the dialog box
     *      okLabel (string)        label to use for OK button
     *      cancelLabel (String)    label to user for Cancel button
     *      modifyLabel (String)    label to user for Modify button
     *      ok (function)           callback when user clicks OK (return false to prevent closing the dialog box)
     *      cancel (function)       callback when user clicks cancel (return false to prevent closing the dialog box)
     *      modify (function)       callback when user clicks modify (return false to prevent closing the dialog box)
     *      width (number/string)   value to use for the width of the dialog
     *      showOk (boolean)        if true, will add an "OK" button
     *      showCancel (boolean)    if true, will add a cancel button
     *      showModify (boolean)    if true, will add a Modify button
     *      validate (function)     callback when the form changes to verify whether the form can be
     *                              submitted (requires that "content" contains a form).  validation can be forced
     *                              by triggering the custom 'validate' event on the form or any child of the form
     *
     * @return jQuery object containing the dialog
     */
    lipstick.createMethodDialog = function(content, dialog_options){

        var dialog_default_options = {
            title: '',
            okLabel: "infrastructure.ok",
            cancelLabel: "infrastructure.cancel",
            modifyLabel: "lipstick.modify",
            ok: null,
            cancel: null,
            modify: null,
            showOk: true,
            showCancel: true,
            showModify: false,
            validate: null
            //width: parameter is now deprecated.  Use CSS to size and style your content.
        };
        
        var options = $.extend({}, dialog_default_options, dialog_options);
        
        if (!content || !(content instanceof $)) {
            content = $('<div/>').text(content);
        }
        content.show();
        
        // dialog HTML
        var dialog = _makeBaseForm();
        if (dialog_options.id) {
            dialog.attr("id", dialog_options.id);
        }
        
        if (dialog_options.padding) {
            $('.dialog_body_content', dialog).css('padding', dialog_options.padding);
        }
        
        // insert user specified content
        $('.dialog_header_content', dialog).text(options.title);
        $('.dialog_body_content', dialog).html(content);
        
        var buttons_holder = $('.dialog_footer_content', dialog);
        // add ok/cancel buttons and specify click handlers
        if (options.showCancel) {
            var cancelBtn = $(sap.sw.ui.button.createCancelHtml(options.cancelLabel));
            cancelBtn.appendTo(buttons_holder).click(function(evt){
                var prevent_close = false;
                if ($.isFunction(options.cancel)) {
                    prevent_close = options.cancel.apply(dialog, [evt]) === false;
                }
                
                if (!prevent_close) {
                    $.modal.close();
                }
            });
        }
        
        if (options.showModify) {
            var modifyBtn = $(sap.sw.ui.button.createHtml(options.modifyLabel, 'okBtn dialog_ok_btn'));
            modifyBtn.appendTo(buttons_holder).click(function(evt){
                var prevent_close = false, button = $(this);
                if (button.find('.disabled').length) {
                    // button is disabled -- do nothing
                    return false;
                }
                
                if ($.isFunction(options.validate && !options.validate.apply(content, []))) {
                    lipstick.enableOkButton(button, false);
                    return false;
                }
                
                if ($.isFunction(options.modify)) {
                    prevent_close = options.modify.apply(dialog, [evt]) === false;
                }
                
                if (!prevent_close) {
                    $.modal.close();
                }
            });
        }
        
        if (options.showOk) {
            var okBtn = $(sap.sw.ui.button.createHtml(options.okLabel, 'okBtn dialog_ok_btn'));
            okBtn.appendTo(buttons_holder).click(function(evt){
                var prevent_close = false, button = $(this);
                if (lipstick.isButtonDisabled(button)) {
                    // button is disabled -- do nothing
                    return false;
                }
                
                if ($.isFunction(options.validate && !options.validate.apply(content, []))) {
                    lipstick.enableOkButton(button, false);
                    return false;
                }
                
                if ($.isFunction(options.ok)) {
                    prevent_close = options.ok.apply(dialog, [evt]) === false;
                }
                
                if (!prevent_close) {
                    $.modal.close();
                }
            });
            
            // add validation hook
            if ($.isFunction(options.validate)) {
                $('form', content).bind('validate change.lipstick click.lipstick keyup.lipstick', function(evt){
                    var enable_ok = options.validate.apply(content, [evt]);
                    if (enable_ok === true || enable_ok === 1) {
                        sap.sw.ui.button.enable(okBtn);
                    }
                    else {
                        sap.sw.ui.button.disable(okBtn);
                    }
                }).trigger('validate'); // validate now
            }
        }
        
        return dialog;
    };
    
    /**
     * Creates and displays the edit dialog box that is used by many methods using
     * the specified HTML content and options.  The height of the dialog is not fixed.
     *
     * @param content   jQuery object containing the DOM to be displayed in the body
     *                  of the dialog box
     * @param dialog_options    see createMethodDialog function
     * @param modal_options     see jquery.simplemodal.js
     *
     * @return jQuery object containing the modal container
     */
    lipstick.showMethodDialog = function(content, dialog_options, modal_options){
        var modal_default_options = {
            modal_mode: true,
            close: false
        }, dialog = lipstick.createMethodDialog(content, dialog_options);
        
        // pop up modal dialog
        return dialog.modal($.extend({}, modal_default_options, modal_options));
    };
    
    /**
     * Adds an overlay with a wait cursor to the given dom element.
     * The overlay will fill the entire content and centers the wait cursor in the middle.
     * It is intended for use where you want to block the user from clicking on a element 
     * while some loading or waiting is being done.
     * 
     * Make sure that removeWaitOverlay is called to remove it.
     * 
     * @param {Object} target - a dom element
     */
    lipstick.addWaitOverlay = function (target, options) {
        // david.hkc: This code actually only works if target is position:relative.
        // Sometimes we don't want repeated elements to have position:relative, but it's ok for one of them to have it.
        // This should become the default in the future.
        if (options && options.positionFix) {
            $(target).addClass("has_wait_overlay");
        }
        var overlay = $(target).children(".lipstick_wait_overlay");
        if (overlay.length === 0) {
            overlay = $("<div class='lipstick_wait_overlay'><div class='lipstick_wait_bkgnd'></div><div class='lipstick_wait_progress'></div></div>");
            if (options && options.small_spinner) {
                overlay.find(".lipstick_wait_progress").addClass("small-spinner");
            }
            $(target).append(overlay);
        }
        return overlay;
    };
    
    lipstick.removeWaitOverlay = function (target) {
        $(target).find(".lipstick_wait_overlay").remove();
        $(target).removeClass("has_wait_overlay");
    };
    
    lipstick.make_delayed_overlay = function(target, delay) {
        delay = delay === 0 ? 0 : (delay || 1000); //0 is falsy
        var overlay = {
            timer: null,
            overlay: null,
            
            show_delayed: function() {
                var that = this;
                this.timer = setTimeout(function() {
                    that.overlay = lipstick.addWaitOverlay(target);
                }, delay);
            },
            
            remove: function() {
                clearTimeout(this.timer);
                if (this.overlay !== null) {
                    this.overlay.remove();
                }
            }
        };
        
        return overlay;
    };
    
    /**
     * Uses the WaitOverlay functions to show a wait cursor with an alert message and 
     * going back into edit mode, if the Progress control is not hidden in time.
     * 
     * Multiple progress cursors can operate at the same time but must be uniquer per
     * DOM element. (ie. you can edit 2 Text Items quickly and submit at the same time)
     */
    var textTimeouts = {};
    lipstick.showTextProgress = function (target, editCallback) {
        // These options could be exposed if need be
        var options = {
            errorMsg: "application.save_text_error1" + "\n" + "application.save_text_error2",
            delay: 5000 
        };
        var id = target.attr("id");
        var parent = target.parent();
        function textSubmitTimeout () {
            // Uh-oh, the request did not complete in time. Maybe Rails PBE is down, but comet is up?
            lipstick.alert(options.errorMsg,
                            function () {
                                lipstick.removeWaitOverlay(parent);
                                if (editCallback) {
                                    editCallback();
                                }
                                textTimeouts[id] = null;
                            });
        }
        
        // set a second timer. if PBE hasn't come back by then, assume it is down.
        if (!textTimeouts[id]) {
            textTimeouts[id] = setTimeout(textSubmitTimeout, options.delay);
            lipstick.addWaitOverlay(parent);
        }
    };
    
    /**
     * Call this when PBE returns successful in order to cancel the text wait cursor.
     * 
     * @param {Object} target jQuery element for the text (same parameter as in showTextProgress
     */
    lipstick.hideTextProgress = function (target) {
        var parent = target.parent();
        var id = target.attr("id");
        if (textTimeouts[id]) {
            lipstick.removeWaitOverlay(parent);
            clearTimeout(textTimeouts[id]);
            textTimeouts[id] = null;
        }
    };
    
    
    /**
     * One-time initialization of default Growl features.
     */
    var growlInit = false;
    function initGrowl () {
        if (!growlInit) {
            //override jGrowl default options
            $.jGrowl.defaults.position = "bottom-right";
            $.jGrowl.defaults.closer = false;
            $.jGrowl.defaults.life = 5000;
            $.jGrowl.defaults.corners = 0;
            growlInit = true;
        }
    }
    /**
     * Hook for the Growl notification feature. We are using a customized 3rd party library to display
     * the messages. This function provides a Constellation interface for displaying a growl.
     * 
     * REQUIRED: 
     * message      HTML string OR JSON array to display as the main message
                    If JSON, message should be in the format:
                    {"key":"namespace.key","values": {"p0": value, "p1": value} }
     *
     * OPTIONAL:
     * image_html   Displayed to the left of the message                    
                    Should be in the format: "<img src='/path/to/image.png' class='arbitrary_class' />"
                    Will use default image if not supplied
     * contents     HTML string to have hidden at first but visible by expanding the notification
     * id           string to set as the id attribute of the notification element
     * sticky       boolean to set persistence state (default: false)
                    also expands 'contents' by default if true
     */
    lipstick.growl = function (message, image_html, contents, id, sticky) {
        //only process notification if document is not hidden or sticky is true
        //this prevents unnecessary processing time for growls that will never be seen
        if (!CSTAR.utils.isDocumentHidden() || sticky) {
            try {
                //parse messages to localize keys
                message = JSON.parse(message); 
                message = CSTAR.t(message.key, message.values);
            } catch (err) {
                //error - don't show any notification
            }
            initGrowl();
            $.jGrowl(message, {image_html: image_html, contents: contents, id: id, sticky: sticky});
        }
    };
    
    lipstick.createDatePicker = function (elementID, calendarIcon, textInput) {
        if (!datepicker) {
            datepicker = new YAHOO.cubetree.widgets.CalendarControl(); //Datepicker
        }
        datepicker.init(elementID, calendarIcon, textInput);
        return datepicker;
    };

    function _dateFormatOptions (dateFormatSymbols) {
        if (dateFormatSymbols === undefined) {
            return undefined;
        }
        return {
            monthNames: dateFormatSymbols.long_months,
            monthNamesShort: dateFormatSymbols.short_months,
            dayNames: dateFormatSymbols.long_days,
            dayNamesShort: dateFormatSymbols.short_days
        };
    }
    
    lipstick.formatDate = function (dateFormat, date, dateFormatSymbols) {
        return $.datepicker.formatDate(
            dateFormat,  
            date,
            _dateFormatOptions(dateFormatSymbols)        
        );
    };

    lipstick.localizeDate = function(date, format) {
        var localize = _.memoize(function() {
            var monthsLong = [], monthsShort = [];
            _.times(13, function(n) {
              if(n > 0) {
                monthsLong.push(jamApp.t("date.month_names." + n));
                monthsShort.push(jamApp.t("date.abbr_month_names." + n));
              }
            });

            var daysLong = [], daysShort = [];
            _.times(7, function(n){
              daysLong.push(jamApp.t("date.day_names." + n));
              daysShort.push(jamApp.t("date.abbr_day_names." + n));
            });

            return {
                monthNames: monthsLong,
                monthNamesShort: monthsShort,
                dayNames: daysLong,
                dayNamesShort: daysShort
            };
        });
        return $.fullCalendar.formatDate(date, format, localize());

    };

    lipstick.localizedDateString = function(start, end, allDay) {
        var isMultiDate = function() {
            return start.getDate() !== end.getDate();
        };

        if(isMultiDate() && !allDay) {
            return jamApp.t("date.date_span_with_times", {
                startDate: jamApp.ui.localizeDate(start, "date.formats.abbreviated_with_day"),
                startTime: jamApp.ui.localizeDate(start, "time.formats.short_time_of_day"),
                endDate: jamApp.ui.localizeDate(end, "date.formats.abbreviated_with_day"),
                endTime: jamApp.ui.localizeDate(end, "time.formats.short_time_of_day")
            });
        } else if(isMultiDate()) {
            return jamApp.t("date.date_span", {
                startDate: jamApp.ui.localizeDate(start, "date.formats.abbreviated_with_day"),
                endDate: jamApp.ui.localizeDate(end, "date.formats.abbreviated_with_day")
            });
        } else if(allDay) {
            return jamApp.ui.localizeDate(start, "date.formats.abbreviated_with_day");
        } else {
            return jamApp.t("date.day_with_time_span", {
                date: jamApp.ui.localizeDate(start, "date.formats.abbreviated_with_day"),
                startTime: jamApp.ui.localizeDate(start, "time.formats.short_time_of_day"),
                endTime: jamApp.ui.localizeDate(end, "time.formats.short_time_of_day")
            });
        }
    }

    lipstick.parseDate = function (dateFormat, dateText, dateFormatSymbols) {
        return $.datepicker.parseDate(
            dateFormat,  
            dateText,
            _dateFormatOptions(dateFormatSymbols)       
        );
    };

    lipstick.apply_user_timezone_offset = function(dateObj, checkDST) {
        /* 
        date being a js Date object specifying a UTC time, 'converts' date to the current user's local time
        browsers automatically show dates in the browser's local time when creating a date object
        so in order to convert it to the proper local time as set by the user:
        1. getting date's timestamp
        2. adding the timestamp to the time zone offset (in minutes) from utc to the browser's 
            local time multiplied by 60000 to convert to milliseconds
        3. adding the current user's timezone offset (in seconds, so x1000 to convert to milliseconds)
            to the due_date in utc timestamp
        4. accounting for DST if needed
        5. creating a new date (again this will appear to be in the browser's local timezone, but with the proper
            offset so it appears correct for the user) with the above timestamp
        */
        var date_timestamp = dateObj.getTime();
        var date_utc = date_timestamp + dateObj.getTimezoneOffset() * 60000;
        var date_user_timestamp = date_utc + CSTAR.current_user.timezone_offset * 1000;
        var date_user = new Date(date_user_timestamp);
        //if this is left null, Daylight savings time will be taken into account
        if (typeof checkDST === 'undefined') {
            checkDST = true;
        }

        if (CSTAR.current_user.timezone_dst && checkDST){
            date_user.setHours(date_user.getHours() + 1);
        }

        return date_user;
    };        

    // returns true if it is able to request browser permissions, false otherwise
    lipstick.requestDesktopNotifPerm = function() {
        if (window.webkitNotifications) {
            if (window.webkitNotifications.checkPermission() === 2) {
                return false;
            }
            window.webkitNotifications.requestPermission();
            return true;
        }
    };

    lipstick.sendDesktopNotification = function(options) {
        if (window.webkitNotifications){
            if (window.webkitNotifications.checkPermission() === 0) {
                var icon = options.icon || '';
                var title = options.title, message = options.message;
                var d_notif = webkitNotifications.createNotification(icon, title, message);
                d_notif.show();
                // Close the notifications after 8 seconds
                setTimeout(function() {
                    d_notif.cancel();
                }, '8000');
            }
        }
    };
    
    lipstick.updateNavPanelBadge = function(id, count) {
      var badge_id = id + '_badge',
          $badge;    
      if (count > 0) {
        if ($('#' + badge_id).length > 0) {
          //update count if badge exists
          $('#' + badge_id).text(count);
        } else {
          //otherwise build and append badge
          $badge = $('<div id="' + badge_id + '" class="nav_panel_badge">' + count.toString().escapeHTML() + '</div>');
          $('#'+id).prepend($badge);             
        }
      }else{
          $('#' + badge_id).remove();
      }
    };

    // OK, so this is not really a crossfade b/c the fadeIn happens after the fadeOut finishes.
    lipstick.crossfade = function (target, newContent, duration) {
      $(target).fadeOut(duration, function(){
        newContent = $(newContent).hide();
        $(this).replaceWith(newContent);
        newContent.fadeIn(duration);
      });
    };

    // target - a text area that should grow vertically as it needs more space.
    lipstick.autoExpand = function (textarea) {
      $(textarea).bind("keyup", function() {
        var textarea = $(this);
        var now = textarea.prop("scrollHeight");
        var before = textarea.prop("clientHeight");
        if (now > before) {
          textarea.css("height", now);
        }
      });
      $(textarea).trigger("keyup");
    };

    lipstick.pageScroll = function (y, callback) {
      // Require both html & body for cross-browser compat. incl. quirks modes
      $("html, body").animate({ scrollTop: y }, "easeOutQuint");

      if (callback) {
        callback();
      }
    };

}(jQuery));
