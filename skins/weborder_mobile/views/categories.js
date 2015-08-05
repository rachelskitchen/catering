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

define(["categories_view"], function(categories_view) {

    // Represents a parent category. Model's attributes look like {name: <parent_name>, sort: <parent_sort>, subcategories: App.Collections.ParentCategories}
    var CategoryParentsItemView = App.Views.FactoryView.extend({
        name: 'parent-categories',
        mod: 'item',
        tagName: 'li',
        className: 'parent-category',
        bindings: {
            '.title': 'text: name'
        },
        events: {
            'click': 'onClick'
        },
        onClick: function() {
            var ids = this.model.get('ids');
            App.Data.router.navigate('products/' + ids, true);
        }
    });

    var CategoriesParentsView = App.Views.FactoryView.extend({
        name: 'parent-categories',
        mod: 'list',
        bindings: {
            '.categories': 'collection: $collection'
        },
        itemView: CategoryParentsItemView
    });

    var CategoriesItemView = App.Views.FactoryView.extend({
        name: 'categories',
        mod: 'item',
        tagName: 'li',
        initialize: function() {
            // need to add model.products to bindingSource to provide handlers for 'reset', 'add', 'remove' events.
            this.bindingSources = _.extend({}, this.bindingSources, {
                _products: this.model.get('products')
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.category': 'text: name',
            '.products': 'collection: $_products',
            '.timetables': 'text: timetables'
        },
        itemView: App.Views.ProductView.ProductListItemView
    });

    var CategoriesMainView = App.Views.FactoryView.extend({
        name: 'categories',
        mod: 'main',
        initialize: function() {
            // need to add model.subs to bindingSource to provide handlers for 'reset', 'add', 'remove' events.
            this.bindingSources = _.extend({}, this.bindingSources, {
                _subs: this.model.get('subs')
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.categories': 'collection: $_subs'
        },
        itemView: CategoriesItemView
    });

    return new (require('factory'))(categories_view.initViews.bind(categories_view), function() {
        App.Views.CategoriesView.CategoriesItemView = CategoriesItemView;
        App.Views.CategoriesView.CategoriesMainView = CategoriesMainView;
        App.Views.CategoriesView.CategoriesParentsView = CategoriesParentsView;
        App.Views.CategoriesView.CategoryParentsItemView = CategoryParentsItemView;
    });
});
