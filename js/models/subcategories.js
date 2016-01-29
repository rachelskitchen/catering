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
  * Contains {@link App.Models.ParentCategory}, {@link App.Collections.SubCategories} constructors.
  * @module subcategories
  * @requires module:backbone
  * @requires module:categories
  * @requires module:products
  * @see {@link module:config.paths actual path}
  */
 define(['categories', 'products'], function() {
    'use strict';

    /**
     * @class
     * @classdesc Represents parent category.
     * @alias App.Models.ParentCategory
     * @augments Backbone.Model
     * @example
     * // create a model
     * require(['subcategories'], function() {
     *     var parent = new App.Models.ParentCategory();
     * });
     */
    App.Models.ParentCategory = Backbone.Model.extend(
    /**
     * @lends App.Models.ParentCategory.prototype
     */
    {
        /**
         * @property {object} defaults - literal object containing attributes with default values
         *
         * @property {string} defaults.name - parent category name.
         * @default ''.
         *
         * @property {number} defaults.sort - sort number.
         * @default null.
         *
         * @property {string} defaults.ids - comma separted list of subcategories.
         * @default ''.
         *
         * @property {App.Collections.Categories} defaults.subs - collection of subcategories.
         * @default null.
         */
        defaults: {
            name: '',
            sort: null,
            ids: '',
            subs: null
        },
        /**
         * Converts `subs` to instance of {@link App.Collections.Categories}.
         */
        initialize: function() {
            var self = this;
            var subs = this.get('subs');
            if(subs instanceof App.Collections.Categories) {
                subs = subs.toJSON();
            } else if(!Array.isArray(subs)) {
                subs = [];
            }
            subs = this.addProducts(subs);
            this.set('subs', new App.Collections.Categories(subs));
        },
        /**
         * Adds new model to `subs` collection.
         * @param {object} data - object or instance of {@link App.Models.Category}
         */
        addSub: function(data) {
            this.addProducts(data);
            this.get('subs').add(data);
        },
        /**
         * Creates new category ('View All'), containing all subcategories, to present all products on one page.
         */
        addAllSubs: function() {
            var name = this.get('id'),
                subs = this.get('subs'),
                self = this,
                allSubs;

            allSubs = new App.Models.Category({
                name: _loc['SUBCATEGORIES_VIEW_ALL'],
                parent_name: name,
                sort: -1,
                active: true,
                id: name,
                ids: subs.pluck('id')
            });
            this.addSub(allSubs);

            // need deactivate allSubs if any active subcategory is not present
            allSubs.listenTo(subs, 'change:active', deactivateAllSubs);
            deactivateAllSubs();

            function deactivateAllSubs() {
                subs.where({active: true}).length == 0 && allSubs.set('active', false);
            }
        },
        /**
         * Sets new instance of {@link App.Collections.Products} to `products` attribute of given model/object(s).
         * @param {array|object|App.Models.Category} subs - can be instance of App.Models.Category / array of models| object / array of objects
         */
        addProducts: function(subs) {
            if(Array.isArray(subs)) {
                _.each(subs, addProducts);
            } else {
                addProducts(subs);
            }

            function addProducts(sub) {
                var products = new App.Collections.Products();
                if(sub instanceof Backbone.Model) {
                    sub.set('products', products);
                } else if(_.isObject(sub)) {
                    sub.products = products;
                }
            }

            return subs;
        }
    });

    /**
     * @class
     * @classdesc Represents collection of categories.
     * @alias App.Collections.SubCategories
     * @augments Backbone.Model
     * @example
     * // create a collection
     * require(['subcategories'], function() {
     *     var subs = new App.Collections.SubCategories();
     * });
     */
    App.Collections.SubCategories = Backbone.Collection.extend({
        /**
         * @property {Function} model - constructor of items.
         * @default App.Models.ParentCategory.
         */
        model: App.Models.ParentCategory,
        /**
         * @property {string} comparator - attribute that used for sorting.
         */
        comparator: 'sort',
        /**
         * Gets all active subcategories of parent category with given id.
         * @param  {string} id - id of parent category.
         * @return {array} - list of subcategories or empty array.
         */
        getSubs: function(id) {
            var parent = this.get(id);
            debugger;
            if(parent)
                return parent.get('subs').where({active: true});
            else
                return [];
        }
    });
 });