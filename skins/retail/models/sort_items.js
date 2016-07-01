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

define(['backbone_extensions'], function() {
    'use strict';

    /**
     * @class
     * @classdesc Represents sort method.
     * @alias App.Models.SortItem
     * @augments Backbone.Model
     * @example
     * // create a sort method model
     * require(['models/sort_items'], function() {
     *     var sortItem = new App.Models.SortItem({id: '1', name: 'Default'});
     * });
     */
    App.Models.SortItem = Backbone.Model.extend(
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
             * Sort item's id.
             * @type {number}
             * @default 1
             */
            id: 1,
            /**
             * Sort strategy.
             * @type {string}
             * @default 'sortNumbers'
             */
            sortStrategy: 'sortNumbers',
            /**
             * Attribute which value is used as a sort comparator.
             * @type {string}
             * @default 'sort'
             */
            sortKey: 'sort',
            /**
             * Sort order ('asc', 'desc').
             * @type {string}
             * @default 'asc'
             */
            sortOrder: 'asc', //or 'desc',
            /**
             * Item's name.
             * @type {string}
             * @default ''
             */
            name: '',
            /**
             * Indicates whether sort item is selected.
             * @type {boolean}
             * @default false
             */
            selected: false
        },
        /**
         * Sorts a collection passed as parameter.
         *
         * @param {App.Collections.CollectionSort} collection - collection need to sort
         */
        sortCollection: function(collection) {
            if (collection instanceof App.Collections.CollectionSort) {
                collection.sortStrategy = this.get('sortStrategy');
                collection.sortOrder = this.get('sortOrder');
                collection.sortKey = this.get('sortKey');
                collection.sort();
            }
        }
    });

    /**
     * @class
     * @classdesc Represents collection of sort methods.
     * @alias App.Collections.SortItems
     * @augments Backbone.RadioCollection
     * @example
     * // create a collection of sort methods
     * require(['models/sort_items'], function() {
     *     var sortItems = new App.Collections.SortItems([
     *         {id: '1', name: 'Default'},
     *         {id: '2', name: 'Price: low to high', sortKey: 'price', sortOrder: 'asc'}
     *     ]);
     * });
     */
    App.Collections.SortItems = Backbone.RadioCollection.extend(
    /**
     * @lends Backbone.RadioCollection.prototype
     */
    {
        /**
         * Item's constructor.
         * @type {Function}
         * @default App.Models.SortItem
         */
        model: App.Models.SortItem,
        /**
         * comparator attribute.
         * @type {string}
         * @default 'id'
         */
        comparator: 'id',
        /**
         * Applies currently selected sort method and listens to its further changes
         *
         * @param {App.Collections.CollectionSort} collection - collection need to sort
         */
        sortCollection: function(collection) {
            if (collection instanceof App.Collections.CollectionSort) {
                this.getCheckedItem().sortCollection(collection);
                collection.listenTo(this, 'change:selected', function(model, value) {
                    value && model.sortCollection(collection);
                });
            }
        }
    });
});