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
 * Contains {@link App.Models.Category}, {@link App.Collections.Categories} constructors.
 * @module categories
 * @requires module:backbone
 * @requires module:collection_sort
 * @see {@link module:config.paths actual path}
 */
define(["backbone", "collection_sort"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a menu category.
     * @alias App.Models.Category
     * @example
     * // create a category model
     * require(['categories'], function() {
     *     App.Data.category = new App.Models.Category({id: 7});
     * });
     */
    App.Models.Category = Backbone.Model.extend(
    /**
     * @lends App.Models.Category.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * Category description
             * @type {string}
             */
            description: '',
            /**
             * Category id
             * @type {(null|number|string)}
             */
            id: null,
            /**
             * Default url of category icon
             * @type {(null|string)}
             */
            image: App.Data.settings.get_img_default(),
            /**
             * Category name
             * @type {(null|string)}
             */
            name: null,
            /**
             * Parent category name
             * @type {(null|string)}
             */
            parent_name: null,
            /**
             * Parent category sort value
             * @type {(null|number)}
             */
            parent_sort: null,
            /**
             * Category sort value
             * @type {(null|number)}
             */
            sort: null,
            /**
             * Custom sort value
             * @type {(null|number|string)}
             */
            sort_val: null,
            /**
             * Path for relative URL
             * @type {(null|number|string)}
             */
            img: App.Data.settings.get("img_path"),
            /**
             * Indicates the category is active (`true`) or inactive (`false`)
             * @type {boolean}
             */
            active: true,
            /**
             * Custom menu
             * @type {(null|Object)}
             */
            timetables: null
        }
    });

    /**
     * @class
     * @classdesc Represents a collection of categories
     * @alias App.Collections.Categories
     * @augments App.Collections.CollectionSort
     * @example
     * // create a category collection
     * requires(['categories'], function() {
     *     App.Data.categories = new App.Collections.Categories();
     * });
     */
    App.Collections.Categories = App.Collections.CollectionSort.extend(
    /**
     * @lends App.Collections.Categories.prototype
     */
    {
        /**
         * Item constructor.
         * @type {App.Models.Category}
         * @default App.Models.Category
         */
        model: App.Models.Category,
        /**
         * Id or ids array of selected categories.
         * @type {(null|number|Array.number|string|Array.string)}
         * @default null
         */
        selected: null,
        /**
         * Id of selected parent category.
         * @type {?number}
         * @default null
         */
        parent_selected: null,
        /**
         * Sort strategy.
         * @type {string}
         * @default "sortNumbers"
         */
        sortStrategy: "sortNumbers",
        /**
         * A key of model that used for sorting.
         * @type {string}
         * @default "sort_val"
         */
        sortKey: "sort_val",
        /**
         * Sorting type ("asc" or "desc").
         * @type {string}
         * @default "asc"
         */
        sortOrder: "asc", //or "desc"
        /**
         * A Key of model that used for sorting by Backbone.Collection.
         * @type {string}
         * @default "sort"
         */
        comparator: 'sort',
        /**
         * Path for relative URL of images.
         * @type {string}
         * @default {@link App.Data.settings#img_path}.
         */
        img: App.Data.settings.get("img_path"),
        /**
         * Gets categories from backend.
         * Request parameters:
         * ```
         * url:  "/weborders/product_categories/"
         * data: {establishment: %estId%}
         * type: "GET"
         * ```
         * Failure request leads to the app reloading.
         * @returns {Object} Deffered object that resolves as a response is received.
         */
        get_categories: function() {
            var self = this;
            var dfd = $.Deferred();
            $.ajax({
                url: App.Data.settings.get("host") + "/weborders/product_categories/",
                data: {
                    establishment: App.Data.settings.get("establishment")
                },
                dataType: "json",
                successResp: function(data) {
                    if (data.length) {
                        self.selected = 0;
                        self.parent_selected = 0;
                    }
                    for (var i=0; i<data.length; i++) {
                        var category = data[i];
                        if (!category.image || category.image === "") {
                            category.image = App.Data.settings.get_img_default();
                        }
                        category.sort_val = parseInt(category.parent_sort || 0) * 1000 + parseInt(category.sort || 0);
                        category.timetables = format_timetables(category.timetables);
                        self.add(category);
                    }
                    dfd.resolve();
                },
                error: function() {
                    App.Data.errors.alert(MSG.ERROR_CATEGORY_LOAD, true); // user notification
                }
            });
            return dfd;
        },
        /**
         * Changes a category on inactive.
         * @param {(number|string|Array)} id - category id that should be inactivated.
         */
        set_inactive: function(id) {
            this.where({id: id}).forEach(function(el) {
                el.set('active', false);
            });
        },
        /**
         * Parses parent categories in the collection.
         * @returns {Array} An array each item is object literal representation of parent category:
         * ```
         * [
         *     {
         *          name: <parent_name>
         *          sort: <parent_sort>
         *          subcategories: App.Collections.Categories
         *     },
         *     ...
         * ]
         * ```
         */
        getParents: function() {
            var parents = {};

            this.each(function(item) {
                item = item.toJSON();

                if(!item.active) {
                    return;
                }

                if(item.parent_name in parents) {
                    addSubCategory();
                } else {
                    parents[item.parent_name] = {
                        name: item.parent_name,
                        sort: item.parent_sort,
                        ids: '',
                        subs: []
                    };
                    addSubCategory();
                }

                function addSubCategory() {
                    var parent = parents[item.parent_name];
                    parent.subs.push(item);
                    parent.ids += parent.ids.length ? ',' + item.id : item.id;
                }
            });

            return _.toArray(parents);
        }
    });
});
