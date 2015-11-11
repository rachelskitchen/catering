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
        /**
         * Enable/disable the drop-down list.
         *
         * @param {numeric} count The quantity of products.
         */
        control: function(count) {
            if (count <= 1)
                this.disable(); // disable the drop-down list
            else
                this.enable(); // enable the drop-down list
        },
        /**
         * Disable the drop-down list.
         */
        disable: function() {
            this.$('select').attr('disabled', 'disabled');
            this.$el.addClass('disabled');
        },
        /**
         * Enable the drop-down list.
         */
        enable: function() {
            this.$('select').removeAttr('disabled');
            this.$el.removeClass('disabled');
        },
        search: function(result) {
            this.enable();
        },
        onProductsLoaded: function() {
            var count = 0,
                selectedCategories = this.options.categories.selected;

            if (Array.isArray(selectedCategories)) {
                selectedCategories.forEach(function(category) {
                    count += this.options.products[category].length;
                }, this);
            }

            this.control(count); // enable/disable the drop-down list
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
            this.attributeName = 'attribute' + this.options.attr;
            this.options.updateEvent = 'change:' + this.attributeName;
            App.Views.FilterView.FilterSortView.prototype.initialize.apply(this, arguments);
        },
        search: function(result) {
            this.reset();

            var products = result.get('products'),
                pattern = result.get('pattern'),
                count;

            this.$('optgroup').remove();
            count = this.setAttributes(products, pattern);
            this.control(count);

            // update selected option (required for restoring after reload page)
            this.update();
        },
        onProductsLoaded: function() {
            var count = 0;

            // add attributes to select element
            if(Array.isArray(this.options.categories.selected)) {
                this.$('optgroup').remove();
                this.options.categories.selected.forEach(function(category) {
                    var cachedCategory = category in this.cache ? this.cache[category] : {},
                        cachedKeysLength, products;
                    // If category was early handled need to just add attributes to DOM from cache.
                    // Otherwise need to get available attributes for each product and add them to DOM.
                    if (cachedKeysLength = Object.keys(cachedCategory).length) {
                        this.addItems(cachedCategory);
                        count += cachedKeysLength;
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

            var attrs = id in this.cache ? this.cache[id] : products.getAttributeValues(this.options.attr),
                name = products.at(0).get('attribute_' + this.options.attr + '_name'),
                attrsKeysLength;

            if(!(id in this.cache))
                this.cache[id] = attrs;

            if((attrsKeysLength = Object.keys(attrs).length) > 0)
                this.addItems(attrs);

            return attrsKeysLength;
        },
        addItems: function(value) {
            var html = '',
                name;

            for (name in value) {
                html += '<optgroup label ="' + _.escape(name) + '">';
                Array.isArray(value[name]) && value[name].forEach(function(option) {
                    option = _.escape(option);
                    html += '<option value="' + option + '">' + option + '</option>';
                });
                html += '</optgroup>';
            }

            this.$('select').append(html);
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
                this.model.set(this.attributeName, 1, {replaceState: true});
            }
        },
        change: function(event) {
            this.model.set(this.attributeName, event.target.value);
        },
        control: function(count) {
            if(count == 0)
                this.disable();
            else
                this.enable();
        },
        update: function() {
            this.$('option[value="' + this.model.get(this.attributeName) + '"]').prop('selected', true);
        }
    });

    return new (require('factory'))(function() {
        App.Views.FilterView = {};
        App.Views.FilterView.FilterSortView = FilterSortView;
        App.Views.FilterView.FilterAttributeView = FilterAttributeView;
    });
});