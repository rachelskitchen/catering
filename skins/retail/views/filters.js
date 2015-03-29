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

define(["factory"], function() {
    'use strict';

    App.Views.FilterView = {};

    var FilterSortView = App.Views.FactoryView.extend({
        name: 'filter',
        mod: 'sort',
        initialize: function() {
            this.listenTo(this.options.categories, 'onSearchComplete', this.search, this);
            this.listenTo(this.options.categories, 'change:selected', this.onCategorySelected, this);
            this.listenTo(this.options.categories, 'onLoadProductsStarted', this.disable, this);
            this.listenTo(this.options.categories, 'onLoadProductsComplete', this.onProductsLoaded, this);
            this.listenTo(this.model, this.options.updateEvent || 'change:sort change:order', this.update, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'change select': 'change'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.update();
        },
        disable: function() {
            this.$('select').attr('disabled', 'disabled');
            this.$el.addClass('disabled');
        },
        enable: function() {
            this.$('select').removeAttr('disabled');
            this.$el.removeClass('disabled');
        },
        search: function(result) {
            this.enable();
        },
        onProductsLoaded: function() {
            this.enable();
        },
        onCategorySelected: function() {
            this.enable();
        },
        change: function(event) {
            var val = event.target.value.split('|'),
                attr = val[0],
                order = val[1] || this.model.defaults.order;
            this.sort(attr, order);
        },
        sort: function(sort, order) {
            if(typeof sort == 'undefined')
                sort = 'sort'; // default sort parameter
            this.model.set({
                sort: sort,
                order: order
            });
        },
        update: function() {
            var sort = this.model.get('sort'),
                order = parseInt(this.model.get('order'), 10),
                value = '';
            if(sort) {
                value += sort;
            }
            if(order == 1) {
                value += '|1';
            }
            if(value) {
                this.$('select').prop('value', value);
            }
        }
    });

    var FilterAttributeView = FilterSortView.extend({
        name: 'filter',
        mod: 'attribute',
        initialize: function() {
            this.cache = {};
            this.options.updateEvent = 'change:attribute1';
            App.Views.FilterView.FilterSortView.prototype.initialize.apply(this, arguments);
        },
        search: function(result) {
            this.reset();

            var products = result.get('products'),
                pattern = result.get('pattern'),
                count;

            this.$('option:not([value=1])').remove();
            count = this.setAttributes(products, pattern);
            this.control(count);

            // update selected option (required for restoring after reload page)
            this.update();
        },
        onProductsLoaded: function() {
            var count = 0;

            // add attributes to select element
            if(Array.isArray(this.options.categories.selected)) {
                this.$('option:not([value=1])').remove();
                this.options.categories.selected.forEach(function(category) {
                    var cachedCategory = category in this.cache ? this.cache[category] : [],
                        products;
                    // If category was early handled need just add attributes to DOM from cache.
                    // Otherwise need get available attributes for each product and add them to DOM.
                    if(cachedCategory.length) {
                        cachedCategory.forEach(this.addItem, this);
                        count += cachedCategory.length;
                    } else {
                        products = this.options.products[category];
                        count += this.setAttributes(products, category);
                    }
                }, this);
                this.control(count);
            }

            // update selected option (required for restoring after reload page)
            this.update();
        },
        setAttributes: function(products, id) {
            if(!products || !products.length)
                return;

            var attrs = id in this.cache ? this.cache[id] : products.getAttributeValues(1),
                name = products.at(0).get('attribute_1_name');

            if(!(id in this.cache))
                this.cache[id] = attrs;

            if(attrs.length > 0)
                attrs.forEach(this.addItem, this);

            return attrs.length;
        },
        addItem: function(value) {
            this.$('select').append('<option value="' + value + '">' + value + '</option>');
        },
        onCategorySelected: function(categories, selected) {
            this.reset();
        },
        /**
         * Reset filter of previous subcategory. `Attribute1` should be set with options replaceState to avoid creation a new entry in browser history.
         * If it is called within restoring of a filter then an execution should be aborted.
         */
        reset: function() {
            if(!this.model.isRestoring) {
                this.model.set('attribute1', 1, {replaceState: true});
            } else {
                console.log('filter is being restored')
            }
        },
        change: function(event) {
            this.model.set('attribute1', event.target.value);
        },
        control: function(count) {
            if(count == 0)
                this.disable();
            else
                this.enable();
        },
        update: function() {
            this.$('option[value="' + this.model.get('attribute1') + '"]').prop('selected', true);
        }
    });

    return new (require('factory'))(function() {
        App.Views.FilterView = {};
        App.Views.FilterView.FilterSortView = FilterSortView;
        App.Views.FilterView.FilterAttributeView = FilterAttributeView;
    });
});