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

    Backbone.Epoxy.binding.allowedParams.params = true; //allows to write in a custom binding additional params like "valueTimeout:valName,params:{timeout:1000}, ..."

    // add filters
    Backbone.Epoxy.binding.addFilter('currencyFormat', function(value) {
        return App.Settings.currency_symbol + round_monetary_currency(value);
    });

    Backbone.Epoxy.binding.addFilter('equal', function(pattern, value) {
        return pattern == value;
    });

    Backbone.Epoxy.binding.addFilter('strictEqual', function() {
        return pattern === value;
    });

    Backbone.Epoxy.binding.addFilter('weightPriceFormat', function(weight, price) {
        var currency_symbol = App.Settings.currency_symbol,
            scales = App.Settings.scales,
            uom = _.isObject(scales) ? scales.default_weighing_unit : '',
            line = weight +' @ ' + currency_symbol + round_monetary_currency(price);
        if(uom) {
            line += '/' + uom;
        }
        return line;
    });

    // add handlers
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

    App.Views.FactoryView = Backbone.Epoxy.View.extend({
        constructor: function(options) {
            this.options = _.extend({}, options);
            this.appData = App.Data;

            // Extend Backbone.Epoxy.View.prototype.bindingSources to implement the ability to pass `bindingSources` via Backbone.View options.
            // All Backbone.Model's, Backbone.Collection's instances existing in options will be added to `bindingSources` (overrides existing pairs in this.prototype.bindingSources).
            // If `bindingSources` object exists in options it overrides all existing pairs in this.bindingSources.
            if(_.isObject(options)) {
                // parse all models and collections from options except `model` and `collection`
                var bindingSources = _.pick(options, Object.keys(options).filter(function(key) {
                    var value = options[key];
                    return key != 'model' && key != 'collection' && (value instanceof Backbone.Model || value instanceof Backbone.Collection);
                }));
                _.extend(bindingSources, _.isObject(options.bindingSources) ? options.bindingSources : undefined);
            }

            this.bindingSources || (this.bindingSources = {});
            _.extend(this.bindingSources, {
                _settings: App.Data.settings,
                _system_settings: new Backbone.Model(App.Settings),
                _lp: new Backbone.Model(_loc)
            }, bindingSources);

            // init array of sub views
            this.subViews = [];

            // remove() method removes all subviews
            this.subViews.remove = function() {
                while(this.length > 0) {
                    var view = this.shift();
                    view instanceof Backbone.View && view.remove();
                };
            };

            // removeFromDOMTree(): removes node elements of subviews from DOM tree
            this.subViews.removeFromDOMTree = function() {
                while(this.length > 0) {
                    var view = this.shift();
                    view instanceof Backbone.View && view.removeFromDOMTree();
                };
            };

            return Backbone.View.prototype.constructor.apply(this, arguments);
        },
        initialize: function() {
            this.template = function(params) {
                var template = template_helper(this.name, this.mod),
                    baseParams = {
                        _settings: App.Settings,
                        _lp: _loc
                    };
                params = params instanceof Object ? _.extend(baseParams, params) : baseParams;
                return template(params);
            };
            this.render();
            this.applyBindings();
            App.Data.devMode && this.$el.attr("data-tmpl", this.name + "_" + this.mod + "-template");
            App.Data.devMode && this.$el.attr("data-view", this.options.dbgClassName);
        },
        render: function() {
            this.$el.html(this.template(this.model ? (this.model.toJSON ? this.model.toJSON() : this.model) : undefined));
            return this;
        },
        /**
         * Remove the view.
         *
         * @return {object} Deleted view.
         */
        remove: function() {
            this.subViews.remove();
            return Backbone.View.prototype.remove.apply(this, arguments);
        },
        /**
         * Remove the view from the DOM tree.
         */
        removeFromDOMTree: function() {
            this.$el.detach();
        },
        /*
         * fix for Bug 12265
         * caret is visible over all layouts on the page in ios safari
         */
        iOSSafariCaretFix: function() {
            if(!(cssua.ua.ios && cssua.ua.webkit))
                return;

            var data = this.$('.ios-safari-caret-fix');

            // show input if user clicks on another input
            data.on('blur', '.ios-safari-caret:hidden', function() {
                $(this).show();
            });

            data.on('scroll', function() {
                var dataTop = data.offset().top,
                    dataHeight = data.height();

                // show hidden inputs if they are inside of visible area
                $('.ios-safari-caret:hidden', data).each(function() {
                    var field = $(this),
                        fieldTop = field.parent().offset().top,
                        fieldHeight = field.height(),
                        fieldTagName = field.prop('tagName');

                    switch (fieldTagName) {
                        case 'INPUT':
                            var fieldLineHeight = parseFloat(field.css('line-height')),
                                fieldFontSize = parseFloat(field.css('font-size')),
                                fieldFontSize = (!isNaN(fieldLineHeight) && fieldLineHeight > fieldFontSize) ? fieldLineHeight : fieldFontSize,
                                fieldTopIndent = parseFloat(field.css('margin-top')) + parseFloat(field.css('border-top-width')) + parseFloat(field.css('padding-top')),
                                fieldCaretPaddingTop = (fieldHeight - fieldFontSize) / 2,
                                fieldCaretTop = fieldTop + fieldTopIndent + fieldCaretPaddingTop,
                                fieldCaretBottom = fieldTop + fieldTopIndent + (fieldHeight - fieldCaretPaddingTop);

                            if (dataTop < fieldTop + (fieldCaretBottom - fieldTop) && dataTop + dataHeight > fieldCaretTop)
                                field.show();
                            break;
                        case 'TEXTAREA':
                            if (dataTop < fieldTop + fieldHeight && dataTop + dataHeight > fieldTop)
                                field.show();
                            break;
                    }
                });

                // if input is in focus and outside of visible area it should be hidden
                $('.ios-safari-caret:focus:visible', data).each(function() {
                    var field = $(this),
                        fieldTop = field.parent().offset().top,
                        fieldHeight = field.height(),
                        fieldTagName = field.prop('tagName');

                    switch (fieldTagName) {
                        case 'INPUT':
                            var fieldLineHeight = parseFloat(field.css('line-height')),
                                fieldFontSize = parseFloat(field.css('font-size')),
                                fieldFontSize = (!isNaN(fieldLineHeight) && fieldLineHeight > fieldFontSize) ? fieldLineHeight : fieldFontSize,
                                fieldTopIndent = parseFloat(field.css('margin-top')) + parseFloat(field.css('border-top-width')) + parseFloat(field.css('padding-top')),
                                fieldCaretPaddingTop = (fieldHeight - fieldFontSize) / 2,
                                fieldCaretTop = fieldTop + fieldTopIndent + fieldCaretPaddingTop,
                                fieldCaretBottom = fieldTop + fieldTopIndent + (fieldHeight - fieldCaretPaddingTop);

                            if (dataTop >= fieldTop + (fieldCaretBottom - fieldTop) || dataTop + dataHeight <= fieldCaretTop)
                                field.hide();
                            break;
                        case 'TEXTAREA':
                            if (dataTop > fieldTop + fieldHeight / 2 || dataTop + dataHeight < fieldTop)
                                field.hide();
                            break;
                    }
                });
            });
        },
        /*
         * Fix for Bug 20541
         * Issue discussion http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
         */
        iPad7Feature: function() {
            if(this.iPad7Feature.initialized)
                return;

            if (/iPad;.*CPU.*OS 7_\d/i.test(window.navigator.userAgent))
                this.$el.on('orientationchange', listen);
            else
                return;

            this.iPad7Feature.initialized = true;
            listen();

            function listen() {
                if (matchMedia('(orientation:landscape)').matches && window.innerHeight != window.outerHeight) {
                    $('html').addClass('ipad');
                    $(window).scrollTop(0, 0);
                } else {
                    $('html').removeClass('ipad');
                }
            }
        }
    });

    /**
     * ViewModule class
     * Provides global views initialization
     */
    function ViewModule() {
        this.args = arguments;
        this.initViews();
    }

    ViewModule.prototype.initViews = function() {
        Array.prototype.forEach.call(this.args, function(cb) {
            typeof cb == 'function' && cb();
        });
    };

    return ViewModule;
});

/*
* the function detects swiping in either of the 4 directions (left, right, up, or down) for mobile devices
*/
function swipe_detect(el, callback){  
    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 100, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 500, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}
  
    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        //e.preventDefault()
    }, false)
  
    touchsurface.addEventListener('touchmove', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
            }
        }
        handleswipe(swipedir)
        //e.preventDefault()
    }, false)
}
