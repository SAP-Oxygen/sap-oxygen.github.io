/**
 * button API: sap.sw.ui.button
 * Javascript API to create/enable/disable a button.
 * @author dbiollo
 *
 */
/*global jQuery */

if (!this.sap) {
    var sap = {};
}

sap.sw = sap.sw || {};
sap.sw.ui = sap.sw.ui || {};

(function ($) {
    "use strict";

    sap.sw.ui.button = {

        // Creates a "dual" button, which includes one half of the button that has a default click action
        // and another half that has a dropdown button with a different click action
        // Unlike the "create" button below, you will have to provide your own callback for the dropdown part of the button (for now).
        // Options:
        // label - the label to be used on the main "default" part of the button
        // cssClass - classes to be used on both peices of the button
        // disabled - if true, the button starts out disabled
        // button_callback - a callback to be used for when the main part of the button is pressed
        // arrow_callback - a callback to be used for when the arrow part of the button is pressed
        createComboButton: function(label, cssClass, disabled, button_callback, arrow_callback) {
            var button = $(sap.sw.ui.button.createHtml(label, cssClass + " combo-main", disabled));
            var combo = $(sap.sw.ui.button.createHtml("<span class='toolbar_arrow smalldownarrow'/>", cssClass + " combo-dropdown", disabled));
            var separator = $("<span class='combo-separator'/>");

            button.hover(function() {
                if(!$(this).hasClass("disabled")) { 
                    separator.addClass("combo-separator-hover");
                }
            }, function() {
                separator.removeClass("combo-separator-hover");
            });
            combo.hover(function() {
                if(!$(this).hasClass("disabled")) { 
                    separator.addClass("combo-separator-hover");
                }
            }, function() {
                separator.removeClass("combo-separator-hover");
            });

            button.click(button_callback);
            combo.click(arrow_callback);

            return $("<span class='combo_button'/>").append(button).append(combo).append(separator);
        },

        // Creates a button with the following options:
        //  label - the escaped string (or html) to display as the label/icon
        //  css - a CSS class to add to the button. Ex. "big" for the big-button
        //  disabled - if true, the button starts out disabled
        //  select - a function which will be called when the user clicks on the button
        //  menu - an array of menu actions to show when the button is clicked (mutually exclusive with "select")
        //
        create: function (options) {
            var button = $(sap.sw.ui.button.createHtml(options.label, options.css, options.disabled));
            if (options.select) {
                button.click(options.select);
            } else if (options.menu) {
                button.click(function () {
                    var popup = CSTAR.popup.singleton_popup();
                    popup.hide();
    
                    var offset = {
                        top: $(this).offset().top + $(this).outerHeight(),
                        left: $(this).offset().left
                    };
    
                    popup.show(offset, options.menu, this);
                });
            }
            return button;
        },

        /**
         * Creates the HTML to represent a button.
         *
         * @param label - string to display inside the button. May include sub-element for icon.
         * @param cssClass - (optional) more css classes to add to the button
         * @param disabled - (optional) button is created disabled if true. Defaults to false.
         */
        createHtml: function (label, cssClass, disabled, id) {
            if (disabled === undefined) {
                disabled = false;
            }
            if (id === undefined) {
                id = "";
            }else{
                id = " id=\"" + id + "\" "
            }
            // Dbiollo - had to change href="#" to the void javascript in order for iOS5 Safari to work correctly
            var css = "", href = disabled ? "" : "href='javascript:void(0)'", disabledOutput = disabled ? "disabled='true'" : "";
            if (cssClass) {
                css = cssClass;
                if (disabled) {
                    css += ' disabled';
                }
            }
            return "<a " + href + id + " class=\"btn " + css + "\" " + disabledOutput + " onclick=\"return false;\">" + label + "</a>";
        },

        /**
         * Creates the HTML string for a cancel button.
         *
         * @param label - string to display
         * @param cssClass - (optional) more css classes to add to the button
         */
        createCancelHtml: function (label, cssClass) {
            var css = "";
            if (cssClass) {
                css = cssClass;
            }
            return "<a href=\"javascript:void(0)\" class=\" btn with-space " + css + "\" onclick=\"return false;\">" + label + "</a>";
        },

        /**
         * Returns true if the the given selector or jQuery object is a disabled button.
         * @param selector - can be a selector (like ".mybutton") or a jQuery object).
         */
        isEnabled: function (selector) {
            return $(selector).attr("href") !== undefined;
        },

        /**
         * Given a jQuery element or selector, find the button and enable it
         */
        enable: function (selector) {
            $(selector).attr("href", "javascript:void(0)").removeAttr('disabled').removeClass('disabled');
        },

        /**
         * Given a jQuery element or selector, find the button and disable it
         */
        disable: function (selector) {
            $(selector).removeAttr("href").attr('disabled', 'disabled').addClass('disabled');
        }
    };
}(jQuery));