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
     * @classdesc Represents abstract tree item.
     * @alias App.Models.TreeItem
     * @augments Backbone.Model
     * @example
     * // create a tree item
     * require(['tree'], function() {
     *     var treItem = new App.Models.TreeItem();
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
             * @default false
             */
            collapsed: false,
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
         *
         */
    });
});