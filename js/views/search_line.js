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

define(["search_line_view"], function(products_view) {
    'use strict';

    var SearchLineMainView = App.Views.FactoryView.extend({
        name: 'search_line',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.options.mainModel, 'loadCompleted', this.page_changed, this);
        },
        page_changed: function() {
            if (this.model.get("searchString") == '' || !cssua.userAgent.mobile) {
                setTimeout( (function(){ 
                    this.$("#search-input")[0].focus(); 
                }).bind(this), 0);
            }
        },
        render: function() {
            this.$el.html(this.template());
            this.applyBindings();
        },
        bindings: {
            "#search-input": "valueTimeout:searchString,params:{timeout:1500},events:['input','blur','change']",
        },
        events: {
            "click #delete-btn": "onDelete",
            "input #search-input": "onInput"
        },
        onInput: function() {
            if (this.$("#search-input").val().length > 0)
                this.$("#delete-btn").show();
            else
                this.$("#delete-btn").hide();
        },
        onDelete: function() {
            this.model.set("searchString", "");
            this.onInput();
        }
    });

    return new (require('factory'))(function() {
        App.Views.SearchLineView = {};
        App.Views.SearchLineView.SearchLineMainView = SearchLineMainView;
    });
});