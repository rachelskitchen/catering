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

define(["list", "generator"], function(list_view) {
    'use strict';

    App.Views.CoreCategoriesView = {};

    App.Views.CoreCategoriesView.CoreCategoriesItemView = App.Views.ItemView.extend({
        name: 'categories',
        mod: 'item',
        bindings: {
            ':el': 'toggle: active'
        },
        render: function() {
            var model = this.model.toJSON();
            App.Views.ItemView.prototype.render.apply(this, arguments);
            this.afterRender(model.parent_sort + model.sort.toString());
            return this;
        },
        events: {
            "click": "showProducts"
        },
        showProducts: function(e) {
            e.preventDefault();
            var id = this.model.get('id');
            App.Data.router.navigate("products/" + id, true);
        }
    });

    App.Views.CoreCategoriesView.CoreCategoriesMainView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'main',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'add', this.addItem, this);
        },
        render: function() {
            App.Views.ListView.prototype.render.apply(this, arguments);
            this.collection.each(this.addItem.bind(this));
            return this;
        },
        addItem: function(model) {
            var view = App.Views.GeneratorView.create('Categories', {
                el: $('<li></li>'),
                mod: 'Item',
                model: model
            });
            App.Views.ListView.prototype.addItem.call(this, view, this.$('.categories'), model.escape('parent_sort') + model.escape('sort').toString());
            this.subViews.push(view);
        }
    });

    App.Views.CorePagesView = {};
    App.Views.CorePagesView.CorePagesMainView = App.Views.FactoryView.extend({
        name: 'pages',
        mod: 'main',
        bindings: {
            ":el": "classes:{hide: equal(page_count,1)}",
            ".cur_page": "text: cur_page",
            ".last_page": "text: page_count",
            ".arrow-left": "enabled: controls_enable",
            ".arrow-right": "enabled: controls_enable"
        },
        events: {
            "click .arrow-left": 'page_left',
            "click .arrow-right": 'page_right'
        },
        page_left: function() {
            var cur_page = this.model.get("cur_page");
            if (cur_page > 1) {
                cur_page--;
            } else {
                return;
            }
            this.model.set("cur_page", cur_page);
        },
        page_right: function() {
            var cur_page = this.model.get("cur_page"),
                page_count = this.model.get("page_count");
            if (cur_page < page_count) {
                cur_page++;
            } else {
                return;
            }
            this.model.set("cur_page", cur_page);
        }
    });

    return new (require('factory'))(function() {
        App.Views.CategoriesView = {};
        App.Views.CategoriesView.CategoriesItemView = App.Views.CoreCategoriesView.CoreCategoriesItemView;
        App.Views.CategoriesView.CategoriesMainView = App.Views.CoreCategoriesView.CoreCategoriesMainView;
        App.Views.PagesView = {}
        App.Views.PagesView.PagesMainView = App.Views.CorePagesView.CorePagesMainView;
    });
});
