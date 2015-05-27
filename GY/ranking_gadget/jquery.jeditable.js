/*
 * Jeditable - jQuery in place edit plugin
 *
 * Copyright (c) 2006-2008 Mika Tuupola, Dylan Verheul
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/jeditable
 *
 * Based on editable by Dylan Verheul <dylan_at_dyve.net>:
 *    http://www.dyve.net/jquery/?editable
 *
 * Revision: $Id: jquery.jeditable.js 410 2008-09-03 16:29:10Z tuupola $
 *
 */

/**
  * Version 1.6.1
  *
  * ** means there is basic unit tests for this parameter. 
  *
  * @name  Jeditable
  * @type  jQuery
  * @param String  target             (POST) URL or function to send edited content to **
  * @param Hash    options            additional options 
  * @param String  options[method]    method to use to send edited content (POST or PUT) **
  * @param Function options[callback] Function to run after submitting edited content **
  * @param String  options[name]      POST parameter name of edited content
  * @param String  options[id]        POST parameter name of edited div id
  * @param Hash    options[submitdata] Extra parameters to send when submitting edited content.
  * @param String  options[type]      text, textarea or select (or any 3rd party input type) **
  * @param Integer options[rows]      number of rows if using textarea ** 
  * @param Integer options[cols]      number of columns if using textarea **
  * @param Mixed   options[height]    'auto', 'none' or height in pixels **
  * @param Mixed   options[width]     'auto', 'none' or width in pixels **
  * @param String  options[loadurl]   URL to fetch input content before editing **
  * @param String  options[loadtype]  Request type for load url. Should be GET or POST.
  * @param String  options[loadtext]  Text to display while loading external content.
  * @param Hash    options[loaddata]  Extra parameters to pass when fetching content before editing.
  * @param String  options[data]      Or content given as paramameter. **
  * @param String  options[indicator] indicator html to show when saving
  * @param String  options[tooltip]   optional tooltip text via title attribute **
  * @param String  options[event]     jQuery event such as 'click' of 'dblclick' **
  * @param String  options[onblur]    'cancel', 'submit', 'ignore' or function ??
  * @param String  options[submit]    submit button value, empty means no button **
  * @param String  options[cancel]    cancel button value, empty means no button **
  * @param String  options[checkbox]  checkbox value, empty means no checkbox **
  * @param String  options[cssclass]  CSS class to apply to input form. 'inherit' to copy from parent. **
  * @param String  options[style]     Style to apply to input form 'inherit' to copy from parent. **
  * @param String  options[select]    true or false, when true text is highlighted ??
  * @param String  options[placeholder] Placeholder text or html to insert when element is empty. **
  * @param String options[placeholderclass] class to apply while the placeholder text is visible
  * @param String  options[simpleokcancelbtn] If we want to show ok and button only without text **
  * @param Function options[onbeforeedit] Function that runs before editing begins. Return false to cancel editing **
  * @param Function  options[onreadytoedit] Function to run after showing the edit elements
  * @param Function  options[onfinishededit] Function to run after hiding the edit elements and showing the text
  * @param Function  options[onsuccess] Function to run after update text succeddfully
  * @param Function  options[onerror] Function to run after failed to update text
  * @param Function options[mceuploadurl] Get mce upload url and pass it to TinyMCE init
  * @param Boolean options[password]  If true, input field will be have type="password"
  * @param Boolean options[textitem]  If true, the edting field is text item of CSTAR
  * @param Integer options[maxlength] max number of characters if using input (not textarea)
  * @param jQuery options[appendbtnto] jQuery object to append buttons to instead of appending to <form>
  * @param String options[blurOnEnter] For textarea types, function that return boolean or boolean that determines if should blur when enter is pressed.
  */

(function($) {
    if (!this.CSTAR) {
        this.CSTAR = {};
    }
    CSTAR.t = YAHOO.cubetree.util.t;

    $.fn.editable = function(target, options) {
    
        var settings = {
            target     : target,
            name       : 'value',
            id         : 'id',
            type       : 'text',
            width      : 'auto',
            height     : 'auto',
            event      : 'click',
            //onblur     : 'cancel', // dbiollo - commented out
            loadtype   : 'GET',
            loadtext   : CSTAR.t("group.loading"),
            placeholder: CSTAR.t("common.click_to_edit"),
            placeholderclass : '',
            loaddata   : {},
            submitdata : {},
            
            // dbiollo - Nov 27 - added for Constellation 
            indicator : CSTAR.t("infrastructure.saving"),
            tooltip   : CSTAR.t("common.click_to_edit"),
            onblur : 'ignore',
            submit : '<span class="buttonInplaceEditSubmit"></span>',
            cancel : '<span class="buttonInplaceEditCancel"></span>',
            onfinishededit : function(){ $(this).removeClass('cstar_editable'); },
            // pkane - Nov 28
            unescapehtml : true,
      
            //george - Dec 2 - added tooltip for save and cancel icon
            savetooltip: CSTAR.t("infrastructure.save"),
            canceltooltip: CSTAR.t("infrastructure.cancel"),
            buttonfloatright: "false",
            
            //george - Mar. 4 - pass it to TinyMCE init
            mceuploadurl: ' ',
            mceevent: null,
            mcechange: null,
      
            //gsun - April 3  
            simpleokcancelbtn: "true",

            //gsun - June 23
            textitem: false,
      
            //CSTAR - This option is added to fix the problem where <br> is used as line break in HTML
            //but when edit the content, we have to change it back to "\n", otherwise, line break will not be showed in input box
            convertlinebreak: false,
            
            //CSTAR - Callback passed to CSTAR.references.show_dialog
            addreference: null
            
        };
        
        if(options) {
            $.extend(settings, options);
        }
    
        /* setup some functions */
        var plugin   = $.editable.types[settings.type].plugin || function() { };
        var submit   = $.editable.types[settings.type].submit || function() { };
        var buttons  = $.editable.types[settings.type].buttons 
                    || $.editable.types['defaults'].buttons;
        var content  = $.editable.types[settings.type].content 
                    || $.editable.types['defaults'].content;
        var element  = $.editable.types[settings.type].element 
                    || $.editable.types['defaults'].element;
        var reset    = $.editable.types[settings.type].reset 
                    || $.editable.types['defaults'].reset;
        var callback = settings.callback || function() { };
        var onreadytoedit = settings.onreadytoedit || function() { };
        var onfinishededit = settings.onfinishededit || function() { };
        var onbeforeedit = settings.onbeforeedit || function() { };
        var onerror = settings.onerror || function() { };
        var onsuccess = settings.onsuccess || function() { };
        /* add custom event if it does not exist */
        if  (!$.isFunction($(this)[settings.event])) {
            $.fn[settings.event] = function(fn){
                return fn ? this.bind(settings.event, fn) : this.trigger(settings.event);
            }
        }
        
        // add a cancel method to allow cancellation programmatically
        // cwilson - july 09
        if ('cancel' === target) {
            return this.each(function() {
                var form = $('form', this);
                if (form.length) {
                    reset.apply(form, [settings, this]);
                }
            });
        }
          
        /* TODO: remove this when form is displayed */
        $(this).attr('title', settings.tooltip);
        
        settings.autowidth  = 'auto' == settings.width;
        settings.autoheight = 'auto' == settings.height;

        return this.each(function() {

            /* save this to self because this changes when scope changes */
            var self = this;  
                   
            /* inlined block elements lose their width and height after first edit */
            /* save them for later use as workaround */
            /* defer getting their values until the first click event */
            var savedwidth;
            var savedheight;
            
            /* if element is empty add something clickable (if requested) */
            if (!$.trim($(this).html())) {
                $(this).html(settings.placeholder);
                if (settings.placeholderclass !== '') {
                    $(this).addClass(settings.placeholderclass);
                }
            }
            
            $(this)[settings.event](function(e) {

                /* prevent throwing an exeption if edit field is clicked again */
                if (self.editing) {
                    return;
                }
        
                /*CSTAR. disable editing if user click text body whose content is not empty */
                if(!$(this).hasClass("textItemEdit")&& !$(this).hasClass("emptyTextItem")&& settings.textitem){                       
                    return ;
                } 
                
                var beforeedit = onbeforeedit.apply(self);
                if (false === beforeedit) {
                    return;
                }
        
                /* save height and width into variables declared above */
                if (savedwidth === undefined) {
                    savedwidth = $(self).width();
                    savedheight = $(self).height();
                }

                /* figure out how wide and tall we are, saved width and height */
                /* are workaround for http://dev.jquery.com/ticket/2190 */
                if (0 == $(self).width()) {
                    //$(self).css('visibility', 'hidden');
                    settings.width  = savedwidth;
                    settings.height = savedheight;
                } else {
                    if (settings.width != 'none') {
                        settings.width = 
                            settings.autowidth ? $(self).outerWidth()  : settings.width;
                    }
                    if (settings.height != 'none') {
                        settings.height = 
                            settings.autoheight ? $(self).height() : settings.height;
                    }
                }
                //$(this).css('visibility', '');
                
                /* remove placeholder text, replace is here because of IE */
                if ($(this).html().toLowerCase().replace(/;/, '') == 
                    settings.placeholder.toLowerCase().replace(/;/, '')) {
                        $(this).html('');
                    if (settings.placeholderclass !== '') {
                        $(this).removeClass(settings.placeholderclass);
                    }
                }
                                
                self.editing    = true;
                self.revert     = $(self).html();
                //Get unescaped input content
                var unescapedInputContent = self.revert.unescapeHTML();
                if (settings.convertlinebreak) {
                    unescapedInputContent = unescapedInputContent.replace(/<[BR|br][\s\S]*?>/g, "\n");          
                }
        
                $(self).html('');

                /* create the form object */
                var form = $('<form/>');
                
                /* apply css or style or both */
                if (settings.cssclass) {
                    if ('inherit' == settings.cssclass) {
                        form.attr('class', $(self).attr('class'));
                    } else {
                        form.attr('class', settings.cssclass);
                    }
                }

                if (settings.style) {
                    if ('inherit' == settings.style) {
                        form.attr('style', $(self).attr('style'));
                        /* IE needs the second line or display wont be inherited */
                        form.css('display', $(self).css('display'));                
                    } else {
                        form.attr('style', settings.style);
                    }
                }

                /* add main input element to form and store it in input */
                var input = element.apply(form, [settings, self]);

                /* set input content via POST, GET, given data or existing value */
                var input_content;
                
                if (settings.loadurl) {
                    var t = setTimeout(function() {
                        input.disabled = true;
                        content.apply(form, [settings.loadtext, settings, self]);
                    }, 100);

                    var loaddata = {};
                    loaddata[settings.id] = self.id;
                    if ($.isFunction(settings.loaddata)) {
                        $.extend(loaddata, settings.loaddata.apply(self, [self.revert, settings]));
                    } else {
                        $.extend(loaddata, settings.loaddata);
                    }
                    $.ajax({
                       type : settings.loadtype,
                       url  : settings.loadurl,
                       data : loaddata,
                       async : false,
                       success: function(result) {
                          window.clearTimeout(t);
                          input_content = result;
                          input.disabled = false;
                       }
                    });
                } else if (settings.data) {
                    input_content = settings.data;
                    if ($.isFunction(settings.data)) {
                        input_content = settings.data.apply(self, [self.revert, settings]);
                    }
                } else {                    
                    if (settings.unescapehtml)
                        //We don't want users to see escaped HTML when they're editing
                        input_content = unescapedInputContent;
                    else 
                        input_content = self.revert;
                }
                content.apply(form, [input_content, settings, self]);

                input.attr('name', settings.name);
        
                /* add buttons to the form */
                buttons.apply(form, [settings, self]);
         
                /* add created form to self */
                $(self).append(form);
         
                /* attach 3rd party plugin if requested */
                plugin.apply(form, [settings, self]);

                /* focus to first visible form element */
                $(':input:visible:enabled:first', form).focus();

                /* highlight input contents when requested */
                if (settings.select) {
                    input.select();
                }
        
                /* discard changes if pressing esc */
                input.keydown(function(e) {
                    if (e.keyCode == 27) {
                        e.preventDefault();
                        //self.reset();
                        reset.apply(form, [settings, self]);
                    }
                    if (options.stopEnterPropagation && e.keyCode == 13) {
                        e.stopImmediatePropagation();
                    }
                });

                /* discard, submit or nothing with changes when clicking outside */
                /* do nothing is usable when navigating with tab */
                var t;
                if ('cancel' == settings.onblur) {
                    input.blur(function(e) {
                        //t = setTimeout(self.reset, 500);
                        t = setTimeout(function() {
                            reset.apply(form, [settings, self]);
                        }, 500);
                    });
                } else if ('submit' == settings.onblur) {
                    input.blur(function(e) {
                        form.submit();
                    });
                } else if ($.isFunction(settings.onblur)) {
                    input.blur(function(e) {
                        settings.onblur.apply(self, [input.val(), settings]);
                    });
                } else {
                    input.blur(function(e) {
                      /* TODO: maybe something here */
                    });
                }

                form.submit(function(e) {

                    if (t) { 
                        clearTimeout(t);
                    }

                    /* do no submit */
                    e.preventDefault();

                    /* call before submit hook. if it returns false abort submitting */         
                    if (false !== submit.apply(form, [settings, self])) {
                        var newInputboxValue = null;
                        
                        if (settings.checkbox) {
                            settings.checkbox_checked = $(self).find('.lipstickCheckbox input').attr('checked');
                            settings.checkbox_disabled = $(self).find('.lipstickCheckbox input').attr('disabled');
                        }
                        
                         /*CSTAR. 
                          * See input value to self in order to get new input box value which will compare with original value to handle no op change
                          * If we want the input value to be unescaped (i.e. item title, acitvitiy title), we should set input.val() to text,
                          * otherwise set it to html
                         */
                        if (settings.unescapehtml) {
                            $(self).text(input.val());              
                        } else {
                            $(self).html(input.val());                            
                        }
                        
                        newInputboxValue = $(self).html();          
                        if ($.trim(newInputboxValue) !== $.trim(self.revert)) {                          
                        /* check if given target is function */
                            if ($.isFunction(settings.target)) {
                                var newInputHTMLValue = input.val();
                                // If the input value is from rich text editor, just pass unescaped HTML to server.
                                if (!settings.unescapehtml){                                  
                                    $(self).html($(self).text());
                                    newInputHTMLValue = $(self).html();                                   
                                }
                                var str = settings.target.apply(self, [newInputHTMLValue, settings]);
                                // if (settings.unescapehtml || jQuery.trim(str) === '') {
                                //     $(self).html(str);
                                // }
                                self.editing = false;
                                callback.apply(self, [self.innerHTML, settings]);
                                /* TODO: this is not dry */
                                if (!$.trim($(self).html())) {
                                    $(self).html(settings.placeholder);
                                    if (settings.placeholderclass !== '') {
                                        $(self).addClass(settings.placeholderclass);
                                    }
                                }
                                onfinishededit.apply(self);
                            } else {
                                /* add edited content and id of edited element to POST */
                                var submitdata = {};
                                submitdata[settings.name] = input.val();
                                submitdata[settings.id] = self.id;
                                /* add extra data to be POST:ed */
                                if ($.isFunction(settings.submitdata)) {
                                    $.extend(submitdata, settings.submitdata.apply(self, [self.revert, settings]));
                                } else {
                                    $.extend(submitdata, settings.submitdata);
                                }
    
                                /* quick and dirty PUT support */
                                if ('PUT' == settings.method) {
                                   submitdata['_method'] = 'put';
                                }
    
                                /* show the saving indicator */
                                $(self).html(settings.indicator);
                                jQuery.ajax({
                                    type: 'POST',
                                    url: settings.target,
                                    data: submitdata,
                                    success: function(result){                    
                                        setInputbox(self, result, settings);
                                    },
                                    error: function(){
                                        onerror.apply(self);
                                    }
                                });
                           }
                        }
                        else {
                            setInputbox(self, self.revert, settings);               
                        }                      
                    }                     
                    return false;
                });
                onreadytoedit.apply(self);
        
                /*Set inputbox after user submit data successfully 
                 * or user submit same data as original inputbox data
                */
                function setInputbox(self, inputboxValue, settings){
                    $(self).html(inputboxValue);
                    self.editing = false;
                    callback.apply(self, [self.innerHTML, settings]);
                    /* TODO: this is not dry */
                    if (!$.trim($(self).html())) {
                        $(self).html(settings.placeholder);
                        if (settings.placeholderclass !== '') {
                            $(self).addClass(settings.placeholderclass);
                        }
                    }
                    onfinishededit.apply(self);
                    onsuccess.apply(self);
                }
            });
            
            /* privileged methods */
            this.reset = function() {
                $(self).html(self.revert);
                self.editing   = false;
                if (!$.trim($(self).html())) {
                    $(self).html(settings.placeholder);
                    if (settings.placeholderclass !== '') {
                        $(self).addClass(settings.placeholderclass);
                    }
                }

                /* CSTAR remove jeditable buttons outside of form */                
                if (settings.appendbtnto) {
                    settings.appendbtnto.children(".jeditable_btn").remove();
                }
                
                onfinishededit.apply(self);
            }            
        });

    };


    $.editable = {
        types: {
            defaults: {
                element : function(settings, original) {
                    var input = $('<input type="hidden"/>');
                    $(this).append(input);
                    return(input);
                },
                content : function(string, settings, original) {
                    $(':input:first', this).val(string);
                },
                reset : function(settings, original) {
                  original.reset();
                },
                buttons : function(settings, original) {
                    var form = this;
          
                    /*Create button div to contain advanced save and cancel buttons with bitmap and text*/   
                    var btnDiv = $("<div class = 'mceBtnDiv' width='"+settings.width+"px'>");         
                    var appendedObj = null;
          
                    /* CSTAR append buttons to custom location */
                    if (settings.appendbtnto) {
                        appendObj = settings.appendbtnto;
                    } else {
                        appendObj = form;
                    }
                    
                    if (settings.simpleokcancelbtn === "false") {
                        appendObj.append(btnDiv);
                        appendObj = btnDiv;
                    }
                    
                    /*If we want the submit/cancel button to "float:right", then 
                    * we want to set cancel button first
                    */
                   if (settings.buttonfloatright=="true"){
                       appendObj.append(settingCancelButton(form, settings, original));           
                       appendObj.append(settingSubmitButton(form, settings, original));
                       if (settings.addreference) {
                           appendObj.append(createAddReferenceLink(settings.addreference));
                       }
                    }
                    else{
                       if (settings.addreference) {
                           appendObj.append(createAddReferenceLink(settings.addreference));
                       }
                       appendObj.append(settingSubmitButton(form, settings, original));  
                       appendObj.append(settingCancelButton(form, settings, original));                                             
                    }
                    
                    if (settings.checkbox) {
                        appendObj.append($(settings.checkbox));
                    }
                }
            },
            text: {
                element : function(settings, original) {
                    var input;
                    if (settings.password) {
                        input = $('<input type="password"/>');
                    }
                    else {
                        input = $('<input/>');
                    }
                    if (settings.width  != 'none') { input.width(settings.width);  }
                    if (settings.height != 'none') { input.height(settings.height); }
                    if (settings.maxlength !== undefined) { input.attr("maxlength", settings.maxlength); }
                    /* https://bugzilla.mozilla.org/show_bug.cgi?id=236791 */
                    //input[0].setAttribute('autocomplete','off');
                    input.attr('autocomplete','off');
                    $(this).append(input);
                    return(input);
                }
            },
            textarea: {
                element : function(settings, original) {
                    var textarea = $('<textarea>');
                    if (settings.rows) {
                        textarea.attr('rows', settings.rows);
                    } else {
                        textarea.height(settings.height);
                    }
                    if (settings.cols) {
                        textarea.attr('cols', settings.cols);
                    } else {
                        textarea.width(settings.width);
                    }
                    if (settings.maxlength !== undefined) { textarea.attr("maxlength", settings.maxlength); }
                    if(settings.blurOnEnter) {
                        textarea.bind("keydown", function(e) {
                          if(e.keyCode == 13 && !e.shiftKey) {
                            var blur = $.isFunction(settings.blurOnEnter) ? settings.blurOnEnter.apply(self) : settings.blurOnEnter;
                            if(blur) {
                              e.stopImmediatePropagation();
                              textarea.blur();
                            }
                          }
                        });
                    }
                    $(this).append(textarea);
                    return(textarea);
                }
            },
            select: {
               element : function(settings, original) {
                    var select = $('<select>');
                    $(this).append(select);
                    return(select);
                },
                content : function(string, settings, original) {
                    if (String == string.constructor) {    
                        eval ('var json = ' + string);
                        for (var key in json) {
                            if (!json.hasOwnProperty(key)) {
                                continue;
                            }
                            if ('selected' == key) {
                                continue;
                            } 
                            var option = $('<option>').val(key).append(json[key]);
                            $('select', this).append(option);    
                        }
                    }
                    /* Loop option again to set selected. IE needed this... */ 
                    $('select', this).children().each(function() {
                        if ($(this).val() == json['selected'] || 
                            $(this).text() == original.revert) {
                                $(this).attr('selected', 'selected');
                        };
                    });
                }
            }
        },

        /* Add new input type */
        addInputType: function(name, input) {
            $.editable.types[name] = input;
        }
    };
    
    /*set submit button*/
    function settingSubmitButton(form,settings,original){
        if (settings.submit){
            /* if given html string use that */
            if (settings.submit.match(/>$/)) {
                var submit = $(settings.submit).click(function() {
                    if ($(form).attr('data-disabled') !== 'true') {
                        var input_html = $('iframe', form).contents().find('#tinymce').html();
                        if (CSTAR.jeditable_type === 'textarea') {
                            input_html = $('textarea', form).val();
                        }
                        
                        if (input_html !== null && input_html !== undefined) {
                            var no_whitespace_html_tag_input_html = input_html.replace(/(&nbsp;|\s|\u00a0)/g, "").replace(/<\/?[^>]+>/gi, "");                 
                            var empty_comment = false;                 
                            if (no_whitespace_html_tag_input_html.length < 1 && input_html.search(/<\s*img/i) === -1){
                                empty_comment = true;
                            }                
                             
                            if (empty_comment && ($(this).parents().hasClass('commentInput') || $(this).parents().hasClass('talk_block_comment_input'))) {
                                lipstick.alert(CSTAR.t("feed.enter_comment"));
                                return;
                            }    
                        }
                        
                        if (settings.appendbtnto) {
                            settings.appendbtnto.children(".jeditable_btn").remove();
                        }
                        
                        form.submit();
                        return false;
                    }
                });
            /* otherwise use button with given string as text */
            } else {
                var submit = $('<button type="submit">');
                submit.html(settings.submit);                            
            }
            /* george - Dec 2 - Modified for Constellation*/
            submit.attr("title",settings.savetooltip);
            
            submit.addClass("jeditable_btn");
                        
      return submit;                         
        }
    }
  
    /* set cancel button*/
    function settingCancelButton(form,settings, original){
        if (settings.cancel) {
            /* if given html string use that */
            if (settings.cancel.match(/>$/)) {
                var cancel = $(settings.cancel);
                /* otherwise use button with given string as text */
            } else {
                var cancel = $('<button type="cancel">');
                cancel.html(settings.cancel);
            }
            /* george - Dec 2 - Modified for Constellation*/
            cancel.attr("title",settings.canceltooltip);
              

            $(cancel).click(function(event) {
                //original.reset();
                if ($(cancel).parents(".item_class").hasClass("cancelReload")) {
                    location.reload();
                } else {
                    if ($.isFunction($.editable.types[settings.type].reset)) {
                        var reset = $.editable.types[settings.type].reset;
                    } else {
                        var reset = $.editable.types['defaults'].reset;
                    }
                    reset.apply(form, [settings, original]);
                }
                return false;
            });
            
            cancel.addClass("jeditable_btn");
            
            return cancel;  
        }
    }
  
  /* Set input box after user click submit data successfully
   * or submit same data as original
   */
  function setInputBox (self, inputboxValue, settings){
    $(self).html(inputboxValue);
        self.editing = false;
        callback.apply(self, [self.innerHTML, settings]);
        /* TODO: this is not dry */
        if (!$.trim($(self).html())) {
            $(self).html(settings.placeholder);
            if (settings.placeholderclass !== '') {
                $(self).addClass(settings.placeholderclass);
            }
        }
        onfinishededit.apply(self);
        onsuccess.apply(self);       
  }
    
    function createAddReferenceLink(addreference) {
        var link = $("<div class='add_reference_link'><a href='#'>" + CSTAR.t("items.add_reference") + "</a></div>");
        var counter = addreference.container.data("counter");
        var key = addreference.key;
        if (addreference.comment_reference) {
            if (counter === undefined) {
                counter = 0;
            } else {
                counter = counter + 1;
            }
            addreference.container.data("counter", counter);
            key = addreference.key + "_" + counter.toString();
        }   
        link.children("a").click(function() {
            CSTAR.references.show_dialog(function(submitter, name, id) {
                var refIndex = CSTAR.references.storeReference(key, submitter);
                var deleteCallback = function() {
                    CSTAR.references.removeSingleStoredReference(key, refIndex);
                };
                CSTAR.references.createTemporaryInlineReference(addreference.container, name, id, deleteCallback);
            }, {}, function() {
                var target_ids = CSTAR.references.target_ids_from_inline_container(addreference.container);
                if (addreference.source_id) {
                    target_ids.push(addreference.source_id.toString());
                }
                CSTAR.references.disable_checkboxes_for_targets(target_ids);
            });
            return false;
        });
        return link;
    }

})(jQuery);
