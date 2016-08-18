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
            var parent_id = this.model.get('id');
            App.Data.router.navigate('products/' + parent_id, true);
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
            ':el': 'toggle: length($_products)',
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
            this.last_index = 0;
            this.add_subs_products();
            //trace("products_bunch: NumOfProducts = ", this.options.products_bunch.get('num_of_products'), " cur_products = ", this.options.products_bunch.get('products').length);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.start();
        },
        bindings: {
            '.categories': 'collection: $_subs'
        },
        itemView: CategoriesItemView,
        start: function() {
            this.scrollHandler = this.onScroll.bind(this);
            $("#section").on('scroll', this.scrollHandler);
        },
        stop: function() {
            $("#section").off('scroll', this.scrollHandler);
        },
        onScroll: function(evt) {
            var el = evt.target, self = this,
                page_height = $(evt.target).height(),
                scrollHeight = evt.target.scrollHeight,
                scrollTop = evt.target.scrollTop,
                next_page_koeff = 2;

            if (this.timeout) {
                return;
            }
            this.timeout = setTimeout(function() {
                if (scrollTop >= scrollHeight - (next_page_koeff * page_height)) {
                    self.options.products_bunch.get_products({ start_index: self.last_index }).then(function() {
                        trace("bunch updated ", self.options.products_bunch.get('parent_id'), self.options.products_bunch.get('products').length);
                        trace("scroll params: ", scrollTop, scrollHeight, 1.5 * page_height);
                        if (scrollTop >= scrollHeight - (1.5 * page_height)) {
                            self.add_subs_products();
                        }
                    });
                }
                delete self.timeout;
            }, 100);
        },
        add_subs_products: function() {
            var self = this,
                page_size = App.SettingsDirectory.view_page_size;
            this.model.get('subs').each(function(category){
                var id = category.get('id');
                var products = self.options.products_bunch.get_subcategory_products(id, self.last_index, page_size);
                category.get('products').add(products);
                //trace("self.last_index = ", self.last_index, products.length);
                self.last_index += products.length;
            });
            trace("SUM last_index = ", this.last_index);
        }
    });

    return new (require('factory'))(categories_view.initViews.bind(categories_view), function() {
        App.Views.CategoriesView.CategoriesItemView = CategoriesItemView;
        App.Views.CategoriesView.CategoriesMainView = CategoriesMainView;
        App.Views.CategoriesView.CategoriesParentsView = CategoriesParentsView;
        App.Views.CategoriesView.CategoryParentsItemView = CategoryParentsItemView;
    });
});
