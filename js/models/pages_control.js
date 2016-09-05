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
 * Contains {@link App.Models.PagesCtrl} constructor.
 * @module about
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(['backbone'], function(Backbone) {
    'use strict';
   /**
     * @class
     * @classdesc Represents a model to control products paging used by paging views
     * @alias App.Models.PagesCtrl
     * @augments Backbone.Model
     * @example
     * // Create an instance of PagesCtrl:
     *    var pagesModel = new App.Models.PagesCtrl;
     *    ...  // load the first page of the product and get num_of_products value from an ajax responce
     *    pagesModel.calcPages(num_of_products) // calculates the number of pages for the model
     */
    App.Models.PagesCtrl = Backbone.Model.extend(
    /**
     * @lends App.Models.PagesCtrl.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Current page, starting from 1
             * @type {?number}
             */
            cur_page: 1,
            /**
             * The number of pages which can be viewed by a user
             * @type {?number}
             */
            page_count: 0,
            /**
             * Represents either controls (arrows left/right) are currently enabled
             * @type {?boolean}
             */
            controls_enable: true,
            /**
             * The number of products on a page shown to the user
             * @type {number}
             */
            page_size: undefined
        },
        /**
         * Initializes a PagesCtrl instance. Sets page_size property.
         * @param {object} opt - options object, can contains:
         * <pre>
         *   page_size {integer} - initializes page_size object's prop (the num of products per page),
         *   if undefined then the customer settings' view_page_size is used.
         * </pre>
         */
        initialize: function(opt) {
            if (!_.isObject(opt) || !opt.page_size) {
                this.set('page_size', App.SettingsDirectory.view_page_size);
            }
        },
        /**
         * Enables controls (arrows left/right).
         */
        enableControls: function() {
            this.set('controls_enable', true);
        },
        /**
         * Disables controls (arrows left/right).
         */
        disableControls: function() {
            this.set('controls_enable', false);
        },
        /**
         * Calculates the number of pages available for the collection
         * @param {integer} num_of_products - the number of products available for the current entity collection
         */
        calcPages: function(num_of_products) {
            var page_count = parseInt(num_of_products / this.get('page_size') + !!(num_of_products % this.get('page_size')));
            this.set({page_count: page_count});
            return this;
        }
    });
});