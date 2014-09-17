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
            this.listenTo(this.options.categories, 'onSearchComplete', this.search, this);
            this.listenTo(this.options.categories, 'change:selected', this.onCategorySelected, this);
            this.listenTo(this.options.categories, 'onLoadProductsStarted', this.disable, this);
            this.listenTo(this.options.categories, 'onLoadProductsComplete', this.onProductsLoaded, this);
            this.listenTo(this.options.categories, 'onRestoreState', this.restoreState, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'change select': 'change'
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
            this.state instanceof Object && this.sort(this.state.sort, this.state.order);
        },
        onCategorySelected: function() {
            this.enable();
        },
        change: function(event) {
            var val = event.target.value.split('|'),
                attr = val[0],
                order = val[1];
            this.sort(attr, order);
        },
        restoreState: function(state) {
            var sort = state.sort,
                order = state.order,
                option;
            if(sort) {
                option = typeof order != 'undefined' ? sort + '|' + order : sort;
                this.$('option[value="' + option + '"]').prop('selected', true);
            }
            this.state = state;
        },
        sort: function(sort, order) {
            if(typeof sort == 'undefined')
                sort = 'sort'; // default sort parameter
            this.model.set({
                sort: sort,
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
            this.stateProps = ['attribute1', 'selected', 'pattern'];
        },
        search: function(result) {
            // set attribute1 to 1 if there is not restoring state
            if(!this.isSearchRestore())
                this.model.set('attribute1', 1);

            var products = result.get('products'),
                pattern = result.get('pattern'),
                count;
            this.$('option:not([value=1])').remove();
            count = this.setAttributes(products, pattern);
            this.control(count);

            // restore filter and clear restoring state
            if(this.isSearchRestore()) {
                this.restoreData();
                this.clearRestoreState();
            }
        },
        onProductsLoaded: function() {
            var count = 0;

            // set attribute1 to 1 if there is not restoring state
            if(!this.isCategoriesRestore())
                this.model.set('attribute1', 1);

            // add attributes to select element
            if(Array.isArray(this.options.categories.selected)) {
                this.$('option:not([value=1])').remove();
                this.options.categories.selected.forEach(function(category) {
                    var products = this.options.products[category];
                    count += this.setAttributes(products, category);
                }, this);
                this.control(count);
            }

            // restore filter and clear restoring state
            if(this.isCategoriesRestore()) {
                this.restoreData();
                this.clearRestoreState();
            }
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
            // if restoring state includes `pattern` and `attribute1`
            // need reset restoring state due to user has selected any category
            if(this.isSearchRestore())
                return this.clearRestoreState();

            // if restoring state includes `selected` and `attribute1`
            // need reset restoring state if user has selected another category
            if(this.isCategoriesRestore() && categories.selected.toString() != this.selected.toString())
                return this.clearRestoreState();

            // ignore any change:selected when filter is not restored
            if(this.isCategoriesRestore())
                return;

            var count = 0;

            // clear all attributes from select element
            this.$('option:not([value=1])').remove();

            // add available attributes to select element
            this.options.categories.selected.forEach(function(category) {
                if(category in this.cache && this.cache[category].length) {
                    this.cache[category].forEach(this.addItem, this);
                    count++;
                }
            }, this);

            // reset filter of previous subcategory
            this.model.set('attribute1', 1)

            this.control(count);
        },
        change: function(event) {
            this.model.set('attribute1', event.target.value);
            this.clearRestoreState();
        },
        control: function(count) {
            if(count == 0)
                this.disable();
            else
                this.enable();
        },
        restoreState: function(state) {
            var props = state instanceof Object ? Object.keys(state) : [];

            // add pairs of properties
            // attribute1, selected and attribute1, pattern
            props.forEach(function(prop) {
                if(this.stateProps.indexOf(prop) == -1)
                    return;
                this[prop] = state[prop];
            }, this);
        },
        restoreData: function() {
            var attr = this.attribute1;
            this.$('option[value="' + attr + '"]').prop('selected', true);
            this.model.set('attribute1', undefined, {silent: true});
            this.model.set('attribute1', attr);
        },
        isCategoriesRestore: function() {
            return typeof this.attribute1 != 'undefined' && typeof this.selected != 'undefined';
        },
        isSearchRestore: function() {
            return typeof this.attribute1 != 'undefined' && typeof this.pattern != 'undefined';
        },
        clearRestoreState: function() {
            this.stateProps.forEach(function(key) {
                delete this[key];
            }, this);
        }
    });
});