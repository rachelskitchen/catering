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

define(["backbone", 'factory', 'generator', 'list'], function(Backbone) {
    App.Views.CoreCategoriesView = {};

       App.Views.CoreCategoriesView.CoreCategoriesItemView = App.Views.ItemView.extend({
        name: 'categories',
        mod: 'item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:active', this.show_hide);
            this.show_hide();
        },
        render: function() {
            var self = this;
            var model = self.model.toJSON();
            model.hide_images = App.Data.settings.get('settings_system').hide_images;
            self.$el.html(self.template(model));
            self.afterRender.call(self, model.parent_sort + model.sort.toString());
            return this;
        },
        events: {
            "click": "showProducts"
        },
        showProducts: function(e) {
            e.preventDefault();
            var id = this.model.get('id');
            App.Data.router.navigate("products/" + id, true);
        },
        show_hide: function() {
            if (!this.model.get('active')) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
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

    App.Views.CategoriesView = {};

    App.Views.CategoriesView.CategoriesItemView = App.Views.CoreCategoriesView.CoreCategoriesItemView;

    App.Views.CategoriesView.CategoriesMainView = App.Views.CoreCategoriesView.CoreCategoriesMainView;
});
