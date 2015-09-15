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

define(["backbone", "factory", "generator"], function() {
    'use strict';

    var SpinnerMainView = App.Views.FactoryView.extend({
        name: 'spinner',
        mod: 'main',
        template:  _.template('<i class="fa fa-spinner fa-pulse fa-fw"></i>'),
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            var opt = this.options;
            if (opt.model) {
                opt.model.listenTo(opt.model, opt.show_event, this.show_spinner.bind(this), this);
                opt.model.listenTo(opt.model, opt.hide_event, this.hide_spinner.bind(this), this);
                this.hide_spinner();
            }            
        },       
        show_spinner: function() {
            this.$el.show();
        },
        hide_spinner: function() {
            this.$el.hide();
        }
    });

    // generator for SpinnerMainView
    $.fn.view_spinner = function(options) {
        return this.each(function(index){
            var cache_id, 
                defaults = {
                className: "view_spinner",
                show_event: "startLoading",
                hide_event: "completeLoading"
            }; 
            var settings = $.extend( {}, defaults, options );
            if (options) {
                cache_id = options.cache_id ? (options.cache_id + index.toString()) : undefined;
            }
            var view = App.Views.GeneratorView.create('Spinner', _.extend({
                el: $(this),
                mod: "Main"
            }, settings), cache_id);
       });
    };

    return new (require('factory'))(function() {
        App.Views.SpinnerView = {};
        App.Views.SpinnerView.SpinnerMainView = SpinnerMainView;
    });
});