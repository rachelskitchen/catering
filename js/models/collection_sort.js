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
 * Contains {@link App.Collections.CollectionSort} constructors.
 * @module collection_sort
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents API for custom sorting.
     * @alias App.Collections.CollectionSort
     * @example
     * require(['collection_sort'], function() {
     *     var sortCollection = new App.Collections.CollectionSort();
     * });
     */
    App.Collections.CollectionSort = Backbone.Collection.extend(
    /**
     * @lends App.Collections.CollectionSort.prototype
     */
    {
        /**
         * Specifies a key that is used as data source for sorting.
         * @type {string}
         * @defaut "models"
         */
        sortedModelsKey: "models",
        /**
         * A sort strategy. It should be any key from App.Collections.CollectionSort#strategies
         * @type {string}
         * @defaut "sortStrings"
         */
        sortStrategy: "sortStrings",
        /**
         * A key that is used for comparing items during sorting.
         * @type {string}
         * @defaut "name"
         */
        sortKey: "name",
        /**
         * Sorting order. Can be 'asc' or 'desc'.
         * @type {string}
         * @defaut "asc"
         */
        sortOrder: "asc", //or "desc"
        /**
         * Sorting strategies. Contains functions comparing items.
         * "sortStrings", "sortNumbers", "sort" strategies are available by default.
         * @type {Object}
         */
        strategies: {
            sortStrings: function (a, b) {
                a = a.get(this.sortKey);
                b = b.get(this.sortKey);
                a = a.toLowerCase && a.toLowerCase() || null; // if isn't string, that can not compare
                b = b.toLowerCase && b.toLowerCase() || null;

                return this.strategies.sort.call(this,a,b);
            },
            sortNumbers: function(oa, ob) {
                var a = oa.get(this.sortKey) * 1;
                var b = ob.get(this.sortKey) * 1;
                a = isNaN(a) ? null : a; // if not a number, that can not compare
                b = isNaN(b) ? null : b;

                if (a == b && this.sortKey != 'name') {
                    //for equal attributes sort models by attr 'name':
                    a = oa.get('name');
                    b = ob.get('name');
                    return a < b ? -1 : a > b ? 1 : 0;
                }

                return this.strategies.sort.call(this,a,b);
            },
            sort: function(a,b) {
                var asc = (this.sortOrder == "asc") * 2 - 1; // true/false change to 1/-1.
                if (a == null && b == null) return 0; // undefined or null
                if (a == null) return 1 * asc;
                if (b == null) return -1 * asc;
                return (asc === -1 && a < b || asc === 1 && a > b) * 2 - 1; // true/false change to 1/-1.
            }
        },
        /**
         * Performs a sorting.
         * @param {string} strategy - strategy name
         * @param {string} modelKey - item's attribute name that is used for comparing.
         * @returns {App.Collections.CollectionSort} The sorted collection.
         */
        sortEx: function(strategy, modelKey) {
            this.sortStrategy = this.strategies[strategy] && strategy || this.sortStrategy; // return last expression. so need return strategy, not this.strategies[strategy]
            this.sortKey = this.model.prototype.defaults[modelKey] !== undefined && modelKey || this.sortKey;

            var collection = this[this.sortedModelsKey].sort(this.strategies[this.sortStrategy].bind(this));
            return collection;
        }
    });
});