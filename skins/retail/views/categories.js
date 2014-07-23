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

define(["backbone", "factory", "generator", "list", "slider_view", "categories", "products"], function(Backbone) {
    'use strict';

    App.Views.CategoriesView = {};

    App.Views.CategoriesView.CategoriesTabView = App.Views.ItemView.extend({
        name: 'categories',
        mod: 'tab',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'change:active', this.show_hide);
            this.show_hide();
        },
        render: function() {
            var model = $.extend({list_name: 'categories'}, this.model.toJSON());
            this.$el.html(this.template(model));
            this.afterRender.call(this, this.model.get('parent_sort'));
            return this;
        },
        events: {
            "change input": "change"
        },
        change: function(e) {
            e.stopPropagation();
            var value = this.model.get('parent_name');
            this.collection.parent_selected = value;
            this.collection.selected = 0;
            this.collection.trigger('change:parent_selected', this.collection, value);
        },
        show_hide: function() {
            var value = this.model.get('parent_name');
            if (!this.collection.where({parent_name : value, active: true}).length) {
                this.$el.addClass('hide');
                this.options.self.update_slider_render();
            } else {
                this.$el.removeAttr('style');
                this.options.self.update_slider_render();
            }
        },
        formatText: function() {
            var span = this.$('span'),
                wLabel = this.$('label').width(),
                words;

            if(isOut())
                words = span.text().match(/([^\s]+)/g);

            Array.isArray(words) && words.some(function(word, index) {
                var prev = span.text(),
                    _isOut;

                if(index == 0)
                    span.text(word);
                else
                    span.text(prev + ' ' + word);

                _isOut = isOut();

                if(_isOut && index == 0)
                    return span.text(this.model.get('parent_name')).addClass('one-line');
                else if(_isOut)
                    return span.text(prev).addClass('first-line').after('<span class="second-line">' + this.model.get('parent_name').replace(prev, '') + '</span>');
            }, this);

            function isOut() {
                return span.outerWidth(true) >= wLabel;
            }
        }
    });

    App.Views.CategoriesView.CategoriesTabsView = App.Views.SliderView.extend({
        name: 'categories',
        mod: 'tabs',
        initialize: function() {
            this.parent_categories = [];
            App.Views.SliderView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.options.search, 'onSearchComplete', this.reset, this);
        },
        render: function() {
            App.Views.SliderView.prototype.render.apply(this, arguments);
            this.$wrapper = this.$('.tabs');
            this.$items = this.$('.tabs > ul');
            this.$toLeft = this.$('.arrow_left');
            this.$toRight = this.$('.arrow_right');
            return this;
        },
        events: {
            "click .arrow_left": 'slide_left',
            "click .arrow_right": 'slide_right'
        },
        addItem: function(model) {
            if (this.parent_categories.indexOf(model.get('parent_name')) === -1) {
                this.parent_categories.push(model.get('parent_name'));
                var view = App.Views.GeneratorView.create('Categories', {
                    el: $('<li></li>'),
                    mod: 'Tab',
                    model: model,
                    collection: this.collection,
                    self: this
                }, model.cid);
                App.Views.SliderView.prototype.addItem.call(this, view, this.$('.tabs > ul'), model.escape('parent_sort'));
                this.subViews.push(view);
                view.formatText();
            }
        },
        create_slider: function() {
            this.$item = this.$('li');
            App.Views.SliderView.prototype.create_slider.apply(this, arguments);
        },
        reset: function(result) {
            var products = result.get('products');
            if(products && products.length)
                this.$('.tabs').get(0).reset();
        }
    });

    App.Views.CategoriesView.CategoriesSubView = App.Views.ItemView.extend({
        name: 'categories',
        mod: 'tab',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'change:active', this.show_hide);
            this.show_hide();
        },
        render: function() {
            var model = $.extend({list_name: 'subcategories'}, this.model.toJSON());
            model.parent_name = model.name; // it is required due to we use `tab` template
            this.$el.html(this.template(model));
            this.afterRender.call(this, this.model.get('sort'));
            return this;
        },
        events: {
            "change input": "change"
        },
        change: function() {
            var model = this.model,
                value = model.get('ids') || [model.get('id')]; // only ViewAll has `ids`
            this.trigger('selected', {selected: value});
        },
        show_hide: function() {
            var value = this.model.get('parent_name');
            if (!this.collection.where({parent_name : value, active: true}).length) {
                this.$el.addClass('hide');
                this.options.self.update_slider_render();
            } else {
                this.$el.removeAttr('style');
                this.options.self.update_slider_render();
            }
        }
    });

    App.Views.CategoriesView.CategoriesSubsView = App.Views.SliderView.extend({
        name: 'categories',
        mod: 'tabs',
        initialize: function() {
            App.Views.SliderView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'loadCompleted', this.restore, this);
        },
        render: function() {
            App.Views.SliderView.prototype.render.apply(this, arguments);
            this.restore();
            this.$wrapper = this.$('.tabs');
            this.$items = this.$('.tabs > ul');
            this.$toLeft = this.$('.arrow_left');
            this.$toRight = this.$('.arrow_right');
            return this;
        },
        events: {
            "click .arrow_left": 'slide_left',
            "click .arrow_right": 'slide_right'
        },
        addItem: function(model) {
            var view = App.Views.GeneratorView.create('Categories', {
                el: $('<li></li>'),
                mod: 'Sub',
                model: model,
                collection: this.collection,
                self: this
            }, model.parent_name + '_sub_' + model.cid);
            App.Views.SliderView.prototype.addItem.call(this, view, this.$('.tabs > ul'), model.escape('sort'));
            this.subViews.push(view);
            this.stopListening(view);
            this.listenTo(view, 'selected', this.onSelected, this);
        },
        create_slider: function() {
            this.$item = this.$('li');
            App.Views.SliderView.prototype.create_slider.apply(this, arguments);
        },
        update_slider: function() {
            var lis = this.$item.not(':hidden');
            lis.removeClass('first').removeClass('last');
            $(lis.get(this.slider_index)).addClass('first');
            $(lis.get(Math.min(this.slider_index + this.slider_count, this.slider_elem_count) - 1)).addClass('last');
            return App.Views.SliderView.prototype.update_slider.apply(this, arguments);
        },
        restore: function() {
            this.onSelected({selected: this.selected});
        },
        onSelected: function(opts) {
            this.trigger('selected', opts);
            this.selected = opts.selected; // save selected value to restore selection in future
        }
    });

    App.Views.CategoriesView.CategoriesSubListView = App.Views.FactoryView.extend({
        name: 'categories',
        mod: 'sublist',
        initialize: function() {
            this.listenTo(this.collection, 'onSubs', this.update, this);
            this.listenTo(this.options.search, 'onSearchComplete', this.hide, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.collection.parent_selected && this.update();
            return this;
        },
        update: function(subs) {
            var cats = this.collection,
                collect = new Backbone.Collection(subs),
                sublist = this.$el,
                view;

            collect.receiving = $.Deferred();
            view = App.Views.GeneratorView.create('Categories', {
                mod: 'Subs',
                model: new Backbone.Model,
                collection: collect
            }, cats.parent_selected + '_sublist');

            this.subViews.removeFromDOMTree();
            sublist.append(view.el);
            this.subViews.push(view);
            this.stopListening(view);
            this.listenTo(view, 'selected', function(opts) {
                this.collection.selected = opts.selected;
                this.collection.trigger('change:selected', this.collection, opts.selected);
            }, this);
            collect.receiving.resolve();         // select first subcategory

            // show or hide subcategories
            if(collect.length == 1)
                sublist.addClass('hide');
            else
                sublist.removeClass('hide');

            // run view.slider_create() and view.restore() methods
            view.model.trigger('loadCompleted');
        },
        hide: function(result) {
            var products = result.get('products');
            products && products.length && this.$el.addClass('hide');
        }
    });

    App.Views.CategoriesView.CategoriesProductsItemView = App.Views.ItemView.extend({
        name: 'categories',
        mod: 'products_item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:active', this.show_hide);
            this.show_hide();
        },
        show_hide: function() {
            if (!this.model.get('active')) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
        },
        render: function() {
            var model = this.model;
            this.$el.html(this.template(model.toJSON()));
            this.afterRender.call(this, model.get('sort'));
            this.add_table();
            this.listenTo(this.options.categories, 'change:selected change:parent_selected', this.update_view);
            this.controlTitle();
            return this;
        },
        add_table: function() {
            var model = this.model,
                view = App.Views.GeneratorView.create('Product', {
                    mod: 'List',
                    collection: this.collection,
                    filter: this.options.filter
                }, model.cid);
            this.$('.product_table').prepend(view.el);
            this.subViews.push(view);
        },
        update_view: function(model, value) {
            if (value === this.options.selected) {
                this.$el.scrollTop(0);
            }
        },
        controlTitle: function() {
            var categories = this.options.categories,
                parentCategory = this.options.parentCategory;
            if(categories.where({parent_name: parentCategory}).length == 1)
                this.$('.category_description').hide();
        }
    });

    App.Views.CategoriesView.CategoriesProductsView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'products',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.initData();
        },
        addItem: function(products, category, parent, selected) {
            var view = App.Views.GeneratorView.create('Categories', {
                el: $('<li></li>'),
                mod: 'ProductsItem',
                collection: products,
                model: category,
                categories: this.collection,
                parentCategory: parent,
                filter: this.options.filter,
                selected: selected
            }, category.cid);
            App.Views.ListView.prototype.addItem.call(this, view, this.$el, category.escape('sort'));
            this.subViews.push(view);
        },
        initData: function() {
            var self = this,
                parent = this.collection.parent_selected,
                ids = this.collection.selected,
                loadDone;

            // Receives all products for current parent categories
            App.Collections.Products.get_slice_products(ids, this).then(function() {
                var products = [],
                    category;

                // if origin subcategory is selected need get category from App.Data.categories
                // if selected subcategory is 'AllViews' need create new App.Models.Category instance
                if(ids.length == 1)
                    category = self.collection.get(ids[0]);
                else
                    category = new App.Models.Category({name: 'All', parent_name: parent, sort: 1, description: ''});

                ids.forEach(function(id) {
                    // add products with new sort value
                    var items = App.Data.products[id],
                        last = Math.max.apply(Math, items.pluck('sort')),
                        floatNumber = Math.pow(10, String(last).length);
                    products.push.apply(products, items.toJSON().map(function(product){
                        product.sort = Number(self.collection.get(id).get('sort')) + product.sort / floatNumber;
                        return product;
                    }));
                });

                self.addItem(new App.Collections.Products(products), category, parent, ids);
                self.trigger('loadCompleted');
                loadDone = true;
            });
            !loadDone && setTimeout(this.trigger.bind(this, 'loadStarted'), 0);
        }
    });

    App.Views.CategoriesView.CategoriesSearchResultsView = App.Views.CategoriesView.CategoriesProductsView.extend({
        name: 'categories',
        mod: 'products',
        initData: function() {
            var self = this,
                id = App.Data.categories.selected;

            this.addItem(this.model.get('products'), new Backbone.Model({
                parent_name: 'Search',
                name: this.model.get('pattern'),
                description: '',
                active: true
            }));
        }
    });

    App.Views.CategoriesView.CategoriesMainProductsView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'main_products',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'change:selected', this.update_table);
            this.listenTo(this.options.search, 'onSearchComplete', this.update_table, this);
            this.$('.categories_products_wrapper').contentarrow();
            this.$('.products_spinner').css('position', 'absolute').spinner();
        },
        update_table: function(model, value) {
            var isCategories = typeof value != 'undefined',
                mod = isCategories ? 'Products' : 'SearchResults',
                data = isCategories ? undefined : model,
                wrapper = this.$('.categories_products_wrapper'),
                view;

            value = isCategories ? value : model.get('pattern');

            // if search result and result is empty
            if(data && (!data.get('products') || data.get('products').length == 0))
                return;

            this.subViews.removeFromDOMTree();
            view = App.Views.GeneratorView.create('Categories', {
                el: $("<ul class='categories_table'></ul>"),
                mod: mod,
                model: data,                // should be App.Models.Search or undefined
                collection: this.collection,
                filter: this.options.filter
            }, 'products_' + value);

            this.subViews.push(view);
            wrapper.append(view.el);
            wrapper.scrollTop(0);

            this.stopListening(view);
            this.listenTo(view, 'loadStarted', this.showSpinner, this);
            this.listenTo(view, 'loadCompleted', this.hideSpinner, this);
            var self = this;
        },
        showSpinner: function() {
            this.$('.products_spinner').addClass('ui-visible');
            this.collection.trigger('onLoadStart');
        },
        hideSpinner: function() {
            var spinner = this.$('.products_spinner');
            setTimeout(spinner.removeClass.bind(spinner, 'ui-visible'), 500);
            this.collection.trigger('onLoadComplete');
        },
        remove: function() {
            this.$('.categories_products_wrapper').contentarrow('destroy');
            App.Views.ListView.prototype.remove.apply(this, arguments);
        }
    });
});