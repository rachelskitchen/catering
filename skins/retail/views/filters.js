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

define(['backbone'], function(Backbone) {
    'use strict';

    App.Views.FilterView = {};

    App.Views.FilterView.FilterSortView = App.Views.FactoryView.extend({
        name: 'filter',
        mod: 'sort',
        initialize: function() {
            this.listenTo(this.options.search, 'onSearchComplete', this.search, this);
            this.listenTo(this.options.categories, 'change:selected', this.onCategorySelected, this);
            this.listenTo(this.options.categories, 'onLoadStart', this.disable, this);
            this.listenTo(this.options.categories, 'onLoadComplete', this.category, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'change select': 'change'
        },
        disable: function() {
            this.$('.select_arrows').addClass('disabled');
            this.$('select').attr('disabled', 'disabled');
        },
        enable: function() {
            this.$('.select_arrows').removeClass('disabled');
            this.$('select').removeAttr('disabled');
        },
        search: function(result) {
            this.enable();
        },
        category: function() {
            this.enable()
        },
        onCategorySelected: function() {
            this.enable();
        },
        change: function(event) {
            var val = event.target.value.split('|'),
                attr = val[0],
                order = val[1];
            this.model.set({
                sort: attr,
                order: order
            });
        }
    });

    App.Views.FilterView.FilterAttributeView = App.Views.FilterView.FilterSortView.extend({
        name: 'filter',
        mod: 'attribute',
        initialize: function() {
            App.Views.FilterView.FilterSortView.prototype.initialize.apply(this, arguments);
            this.cache = {};
        },
        search: function(result) {
            this.model.set('attribute1', 1);
            var products = result.get('products');
            this.setAttributes(products, result.pattern);
        },
        category: function() {
            var category = this.options.categories.selected,
                products = this.options.products[category];
            this.setAttributes(products, category);
        },
        setAttributes: function(products, id) {
            if(!products || !products.length)
                return;

            var attrs = id in this.cache ? this.cache[id] : products.getAttributeValues(1),
                name = products.at(0).get('attribute_1_name');

            if(!(id in this.cache))
                this.cache[id] = attrs;

            this.$('option:not([value=1])').remove();

            // show attributes
            if(attrs.length == 0) {
                this.disable();
            } else {
                this.enable();
                attrs.forEach(this.addItem, this);
            }
        },
        addItem: function(value) {
            this.$('select').append('<option value="' + value + '">' + value + '</option>');
        },
        onCategorySelected: function() {
            var category = this.options.categories.selected;
            this.model.set('attribute1', 1);
            this.category();
            if(category in this.cache && this.cache[category].length)
                this.enable();
            else
                this.disable();
        },
        change: function(event) {
            this.model.set('attribute1', event.target.value);
        }
    });
});