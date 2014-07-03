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

define(["backbone", "factory", "generator", "list", "slider_view"], function(Backbone) {
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
        change: function() {
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
        }
    });

    App.Views.CategoriesView.CategoriesTabsView = App.Views.SliderView.extend({
        name: 'categories',
        mod: 'tabs',
        initialize: function() {
            this.parent_categories = [];
            App.Views.SliderView.prototype.initialize.apply(this, arguments);

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
            }
        },
        create_slider: function() {
            this.$item = this.$('li');
            App.Views.SliderView.prototype.create_slider.apply(this, arguments);
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
            model.parent_name = model.name; // it is required die to we use `tab` template
            this.$el.html(this.template(model));
            this.afterRender.call(this, this.model.get('parent_sort'));
            return this;
        },
        events: {
            "change input": "change"
        },
        change: function() {
            var value = this.model.get('id');
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
            var view = App.Views.GeneratorView.create('Categories', {
                el: $('<li></li>'),
                mod: 'Sub',
                model: model,
                collection: this.collection,
                self: this
            }, model.parent_name + '_sub_' + model.cid);
            App.Views.SliderView.prototype.addItem.call(this, view, this.$('.tabs > ul'), model.escape('parent_sort'));
            this.subViews.push(view);
            this.listenTo(view, 'selected', function(opts) {
                this.trigger('selected', opts);
            }, this);
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
        }
    });

    App.Views.CategoriesView.CategoriesSubListView = App.Views.FactoryView.extend({
        name: 'categories',
        mod: 'sublist',
        initialize: function() {
            this.listenTo(this.collection, 'change:parent_selected', this.update, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.collection.parent_selected && this.update();
            return this;
        },
        update: function() {
            var cats = this.collection,
                subs = cats.where({active: true, parent_name: cats.parent_selected}),
                collect = new Backbone.Collection(subs),
                view;

            collect.receiving = $.Deferred();
            view = App.Views.GeneratorView.create('Categories', {
                mod: 'Subs',
                model: new Backbone.Model,
                collection: collect
            }, cats.parent_selected + '_sublist');

            this.subViews.removeFromDOMTree();
            this.$('.sublist').append(view.el);
            this.subViews.push(view);
            this.listenTo(view, 'selected', function(opts) {
                this.collection.selected = opts.selected;
                this.collection.trigger('change:selected', this.collection, opts.selected);
            }, this);
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
            this.$el.html(this.template(this.model.toJSON()));
            this.afterRender.call(this, this.model.get('sort'));
            this.add_table();
            this.listenTo(this.options.categories, 'change:selected', this.update_view);
            return this;
        },
        add_table: function() {
            var model = this.model,
                view = App.Views.GeneratorView.create('Product', {
                    mod: 'List',
                    collection: this.collection
                }, model.cid);
            this.$('.product_table').prepend(view.el);
            this.subViews.push(view);
        },
        update_view: function(model, value) {
            if (value === this.model.get('id')) {
                this.$el[0].scrollIntoView();
            }
        }
    });

    App.Views.CategoriesView.CategoriesProductsView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'products',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            var self = this,
                parent_name = this.collection.parent_selected,
                ids = this.collection.filter(function(model) {
                    return parent_name && model.get('parent_name') === parent_name;
                }).map(function(model) {
                    return model.get('id');
                });

            // Receives all products for current parent categories
            App.Collections.Products.get_slice_products(ids, this).then(function() {
                ids.forEach(function(id) {
                    self.addItem(App.Data.products[id], App.Data.categories.get(id));
                });
                self.trigger('loadCompleted');
            });
            setTimeout(this.trigger.bind(this, 'loadStarted'), 0);
        },
        addItem: function(products, category) {
            var view = App.Views.GeneratorView.create('Categories', {
                el: $('<li></li>'),
                mod: 'ProductsItem',
                collection: products,
                model: category,
                categories: this.collection
            }, category.cid);
            App.Views.ListView.prototype.addItem.call(this, view, this.$el, category.escape('sort'));
            this.subViews.push(view);
        }
    });

    App.Views.CategoriesView.CategoriesMainProductsView = App.Views.ListView.extend({
        name: 'categories',
        mod: 'main_products',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'change:parent_selected', this.update_table);
            this.$('.categories_products_wrapper').contentarrow();
            this.$('.products_spinner').css('position', 'absolute').spinner();
        },
        update_table: function(model, value) {
            this.subViews.removeFromDOMTree();
            var view = App.Views.GeneratorView.create('Categories', {
                el: $("<ul class='categories_table'></ul>"),
                mod: 'Products',
                collection: this.collection
            }, value);
            this.subViews.push(view);
            this.$('.categories_products_wrapper').append(view.el);
            this.$(".categories_products_wrapper").scrollTop(0);
            this.listenTo(view, 'loadStarted', this.showSpinner, this);
            this.listenTo(view, 'loadCompleted', this.hideSpinner, this);
        },
        showSpinner: function() {console.log('started');
            this.$('.products_spinner').addClass('ui-visible');
        },
        hideSpinner: function() {console.log('completed');
            var spinner = this.$('.products_spinner');
            setTimeout(spinner.removeClass.bind(spinner, 'ui-visible'), 500);
        },
        remove: function() {
            this.$('.categories_products_wrapper').contentarrow('destroy');
            App.Views.ListView.prototype.remove.apply(this, arguments);
        }
    });
});