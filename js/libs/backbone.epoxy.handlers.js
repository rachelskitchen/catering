/*
 * Revel Systems Online Ordering Application
 *
 *  Copyright (C) 2014 by Revel Systems
 *
 * This file is part of Revel Systems Online Ordering open source application.
 *
 * Revel Systems Online Ordering open source application is free software: you
 * can redistribute it and/or modify it under the terms of the GNU General
 * Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * Revel Systems Online Ordering open source application is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Revel Systems Online Ordering Application.
 * If not, see <http://www.gnu.org/licenses/>.
 */

define(['backbone', 'backbone_epoxy'], function(Backbone) {
    'use strict';

    Backbone.Epoxy.binding.addHandler('loadSpinner', function($el, value) {
        if(value) {
            $el.off();
            $el.attr('src', value);
            return loadSpinner($el);
        } else {
            return $el;
        }
    });

    Backbone.Epoxy.binding.addHandler('updateCaptcha', function($el, value) {
        var view = this.view;
        value && $el.on('load', removeSpinner).error(removeSpinner);
        $el.attr('src', value);
        function removeSpinner() {
            $el.off('load error');
            // need to remove spinner only when current element's `src` attribute corresponds `value`
            if($el.attr('src') === value) {
                view.removeCaptchaSpinner();
            }
        }
    });

    Backbone.Epoxy.binding.addHandler("valueTimeout", {
        // it's custom binding to get the value for <input> element by 'blur','change' events AND by 'input' (key press) event by the timout specified.
        // timeout param is used for 'input' events only.
        // Usage example:  "#search-input": "valueTimeout:searchString,params:{timeout:1500},events:['input','blur','change']"
        init: function( $element, value, bindings, context ) {
            // Initialize the binding handler...
            this.timeout = context.params.timeout;
            if (!this.timeout) {
                console.error("timeout param is not specified for valueTimeout binding");
            }
        },
        set: function( $element, value) {
            $element.val(value);
        },
        get: function( $element, value, event ) {
            if (event.type == 'blur' || event.type == 'change') {
                return $element.val().trim();
            }
            if (this.inputTimeout) {
                clearTimeout(this.inputTimeout);
            }
            this.inputTimeout = setTimeout((function(){
                this.$el.trigger("change");
                this.inputTimeout = null;
            }).bind(this), this.timeout);
            return value;
        }
    });

    Backbone.Epoxy.binding.addHandler('replaceToTemplate', {
        init: function($el, value, bindings, context) {
            this.oldHTML = $el.html();
            this.replaceRegExp = typeof context.replaceRegExp == 'string' ? context.replaceRegExp : '';
        },
        set: function($el, value) {
            var template = this.view.$(value);
            if(template.length && this.replaceRegExp.length) {
                $el.html($el.html().replace(new RegExp(this.replaceRegExp, 'g'), template.html()));
            }
        },
        clean: function() {
            delete this.oldHTML;
            delete this.replaceRegExp;
        }
    });

    Backbone.Epoxy.binding.addHandler('replaceRegExp');

    // handler to reset value
    Backbone.Epoxy.binding.addHandler('reset', {
        get: function($el, value, event) {
            return '';
        }
    });

    Backbone.Epoxy.binding.addHandler("valueTrim", {
        //
        // it's custom binding to get the value.trim() for <input> element by 'blur','change' events.
        // timeout param is used for 'input' events only.
        // Usage example:  "#my_input": "valueTrim:value,events:['blur','change']"
        //
        set: function( $element, value) {
            $element.val(value.trim());
        },
        get: function( $element, value, event ) {
            return $element.val().trim();
        }
    });

    Backbone.Epoxy.binding.addHandler("toggleInline", {
        set: function( $element, value) {
            $element.css("display", value == true ? "block-inline" : "none");
        }
    });

    // 'outsideTouch' handler: changes on false value bound when user clicks outside of current element.
    // 'onOutsideTouch' event should be passed in 'events' handler.
    Backbone.Epoxy.binding.addHandler('outsideTouch', {
        init: function($el, value, bindings) {
            var touchEvent = 'ontouchstart' in document.documentElement ? 'touchstart' : 'mousedown';

            // listen to click on any UI element outside $el
            var documentListener = function(event) {
                if(event.target !== $el.get(0) && !$el.find(event.target).length) {
                    $el.trigger('onOutsideTouch');
                }
            };

            // bind listeners
            this.listenToClick = function() {
                Backbone.$(document).on(touchEvent, documentListener);
            }

            // unbind listeners
            this.stopListeningToClick = function() {
                Backbone.$(document).off(touchEvent, documentListener);
            }
        },
        set: function($el, value) {
            value && this.listenToClick();
        },
        get: function($el, value, event) {
            if(event.type == 'onOutsideTouch') {
                this.stopListeningToClick();
                return false;
            } else {
                return value;
            }
        },
        clean: function() {
            this.stopListeningToClick();
        }
    });

    Backbone.Epoxy.binding.addHandler("acceptDigits", {
        // Usage example:  "#my_input": "acceptDigits:cardNumber"
        init: function($el, value, bindings, context) {
            $el.keypress(function(event) {
                return isDigitOrControlKey(event.which);
            });
        }
    });

    Backbone.Epoxy.binding.addHandler('pattern', {
        // Usage example:  "#my_input": "pattern: /^\\d{0,19}$/'"
        init: function($el, value, bindings, context) {
            var regex = context.pattern;
            if (regex instanceof RegExp) {
                var prev = ''; //initial && initial.toString() || '';
                $el.on('input', function(a) {
                    if (!regex.test(a.target.value) || !a.target.value && !this.validity.valid) {
                        a.target.value = prev;
                        $el.off('blur', change); // `change` event is not emitted after this case
                        $el.one('blur', change); // need reproduce it
                    } else {
                        prev = a.target.value;
                    }
                });

                $el.on('change', function(a) {
                    prev = a.target.value;
                });

                function change() {
                    $el.trigger('change');
                }
            }

        }
    });

});
