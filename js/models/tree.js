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

/**
 * Contains {@link App.Models.TreeItem}, {@link App.Collections.Tree} constructors.
 * @module tree
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents tree item.
     * @alias App.Models.TreeItem
     * @augments Backbone.Model
     * @example
     * // create a tree item
     * require(['tree'], function() {
     *     var treeItem = new App.Models.TreeItem();
     * });
     */
    App.Models.TreeItem = Backbone.Model.extend(
    /**
     * @lends Backbone.Model.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Item name.
             * @type {string}
             * @default ''
             */
            name: '',
            /**
             * Sorting number.
             * @type {number}
             * @default 0
             */
            sort: 0,
            /**
             * Indicates whether items are collapsed.
             * @type {boolean}
             * @default true
             */
            collapsed: true,
            /**
             * Indicates whether the item is selected.
             * @type {boolean}
             * @default false
             */
            selected: false,
            /**
             * Subtree collection.
             * @type {?App.Collections.Tree}
             * @default null
             */
            items: null
        },
        /**
         * Provides 'onItemSelected' event propagation up to tree.
         * This event may be invoked by 'change:selected' at itself
         * or may be propagated from item in subtree.
         */
        initialize: function() {
            var items = this.get('items');
            if (items instanceof App.Collections.Tree) {
                this.enableChangeSelectedBubbling(items);
            } else {
                this.setItems(items);
            }
            this.listenTo(this, 'change:selected', this.trigger.bind(this, 'onItemSelected'));
            this.listenTo(this, 'change:items', function(model, value) {
                model.disableChangeSelectedBubbling(model.previous('items'));
                model.setItems(value);
            });
            Backbone.Model.prototype.initialize.apply(this, arguments);
        },
        /**
         * Converts `value` array to instance of {@link App.Collections.Tree} collection.
         *
         * @param {Array} value - array with items
         */
        setItems: function(value) {
            var items = new App.Collections.Tree();
            Array.isArray(value) && items.reset(value);
            this.set('items', items);
            this.enableChangeSelectedBubbling(items);
        },
        /**
         * Enables 'onItemSelected' event bubbling from `items` collection.
         * The model triggers 'onItemSelected' event passing arguments of bubbling event.
         */
        enableChangeSelectedBubbling: function(items) {
            this.listenTo(items, 'onItemSelected', function(model, value) {
                var params = _.toArray(arguments);
                params.unshift('onItemSelected');
                this.trigger.apply(this, params);
            });
        },
        /**
         * Disables 'onItemSelected' event bubbling from `items` collection.
         */
        disableChangeSelectedBubbling: function(items) {
            this.stopListening(items);
        }
    });

    /**
     * @class
     * @classdesc Represents tree collection.
     * @alias App.Collections.Tree
     * @augments Backbone.Collection
     * @example
     * // create a tree
     * require(['tree'], function() {
     *     var tree = new App.Collections.Tree([{name: 'Fruits', sort: 2}, {name: 'Vegetables', sort: 1}]);
     * });
     */
    App.Collections.Tree = Backbone.Collection.extend(
    /**
     * @lends Backbone.Model.prototype
     */
    {
        /**
         * Defines item attribute that is used in sorting.
         * @type {string}
         * @default 'sort'
         */
        comparator: 'sort',
        /**
         * Defines item constructor.
         * @type {Backbone.Model}
         * @default App.Models.TreeItem
         */
        model: App.Models.TreeItem,
        /**
         * Recursively searches a model which matches `attr`, `value` parameters.
         * @param {string} attr - attribute name.
         * @param {string} value - attribute's value.
         * @param {boolean} isEqual - if it's true then target item is searched via _.isEqual() function.
         *
         * @returns {App.Models.TreeItem|undefined} Found model.
         */
        getItem: function(attr, value, isEqual) {
            var model;

            this.some(function(item) {
                var items = item.get('items');
                if (isEqual ? _.isEqual(item.get(attr), value) : item.get(attr) === value) {
                    model = item;
                } else if (items.length) {
                    model = items.getItem(attr, value, isEqual);
                }
                return model;
            });

            return model;
        }
    });
});