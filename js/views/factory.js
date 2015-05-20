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

    // add filters
    Backbone.Epoxy.binding.addFilter('currencyFormat', function(value) {
        return App.Settings.currency_symbol + round_monetary_currency(value);
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

    App.Views.FactoryView = Backbone.Epoxy.View.extend({
        constructor: function(options) {
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
                        fieldHeight = field.height();

                    if(dataTop < fieldTop + fieldHeight && dataTop + dataHeight > fieldTop)
                        field.show();
                });

                // if input is in focus and outside of visible area it should be hidden
                $('.ios-safari-caret:focus:visible', data).each(function() {
                    var field = $(this),
                        fieldTop = field.parent().offset().top,
                        fieldHeight = field.height();

                    if(dataTop > fieldTop + fieldHeight / 2 || dataTop + dataHeight < fieldTop)
                        field.hide();
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