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
 * Contains {@link App.Models.Order}, {@link App.Collections.Orders} constructors.
 * @module orders
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a customer's order.
     * @alias App.Models.Order
     * @augments Backbone.Model
     * @example
     * // create an order model
     * require(['orders'], function() {
     *     var order = new App.Models.Order();
     * });
     */
    App.Models.Order = Backbone.Model.extend(
    /**
     * @lends Backbone.Model
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * Call name. Short customer info in one line.
             * It may contain first name, last name, delivery address, phone, custom dining options
             * @type {string}
             * @default ''
             */
            call_name: '',
            /**
             * Indicates whether the order is closed. An order gets closed when it is completed on POS.
             * @type {boolean}
             * @default false
             */
            closed: false,
            /**
             * Order placement time in 'mm/dd/yyyy hh:mm' format.
             * @type {string}
             * @default ''
             */
            created_date: '',
            /**
             * Delivery/Sipping/Catering address.
             * @type {?Object}
             * @defaut null
             */
            delivery_address: null,
            /**
             * Dining option.
             * @type {number}
             * @default 0
             */
            dining_option: 0,
            /**
             * Order discount.
             * @type {number}
             * @default 0
             */
            discounts: 0,
            /**
             * Grand total (includes tip, tax, surcharge, sub total).
             * @type {number}
             * @default 0
             */
            final_total: 0,
            /**
             * Order id.
             * @type {?number}
             * @default null
             */
            id: null,
            /**
             * Order notes.
             * @type {string}
             * @default ''
             */
            notes: '',
            /**
             * Payment type.
             * ```
             *     PAYPAL MOBILE (PayPal app) - 1,
             *     CREDIT CARD- 2,
             *     PAYPAL - 3,
             *     NO_PAYMENT (Pay at store, Pay at Delivery) - 4,
             *     GIFT CARD - 5,
             *     STANFORD CARD - 6
             * ```
             * @type {number}
             * @default 2
             */
            payment_type: 2,
            /**
             * Pickup time in 'mm/dd/yyyy hh:mm' format.
             * @type {?string}
             * @default null
             */
            pickup_time: null,
            /**
             * Prevailing surcharge rate.
             * @type {number}
             * @default 0
             */
            prevailing_surcharge: 0,
            /**
             * Prevailing tax rate.
             * @type {number}
             * @default 0
             */
            prevailing_tax: 0,
            /**
             * Balance due amount.
             * @type {number}
             * @default 0
             */
            remaining_due: 0,
            /**
             * Sut total amount.
             * @type {number}
             * @default 0
             */
            subtotal: 0,
            /**
             * Surcharge amount.
             * @type {number}
             * @default 0
             */
            surcharge: 0,
            /**
             * Tax amount.
             * @type {number}
             * @default 0
             */
            tax: 0,
            /**
             * Tax country. It allows to determine whether tax is included to sub total.
             * @type {string}
             * @default 'us'
             */
            tax_country: 'us',
            /**
             * Tip amount.
             * @type {number}
             * @default 0
             */
            tip: 0
        }
    });

    /**
     * @class
     * @classdesc Represents a customer's orders.
     * @alias App.Collection.Orders
     * @augments Backbone.Model
     * @example
     * // create an orders collection
     * require(['orders'], function() {
     *     var order = new App.Models.Order();
     * });
     */
    App.Collections.Orders = Backbone.Collection.extend(
    /**
     * @lends Backbone.Collection
     */
    {
        /**
         * Function constructor of item.
         * @type {Backbone.Model}
         * @default App.Models.Order
         */
        model: App.Models.Order,
        /**
         * Receives orders from server. Sends request with following parameters:
         * ```
         * {
         *     url: "/weborders/v1/orders/",
         *     method: "GET",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {
         *         establishment: 14,   // establishment id
         *         web_order: true,     // filters only weborder
         *         page: <number> ,     // page number
         *         limit: <number>      // max orders number  in response
         *     }  // order json
         * }
         * ```
         * - If session is already expired or invalid token is used the server returns the following response:
         * ```
         * Status: 403
         * {
         *     "detail":"Authentication credentials were not provided."
         * }
         * ```
         * `App.Data.customer` emits `onUserSessionExpired` event in this case. Method `App.Data.custromer.logout()` is automatically called in this case.
         * ```
         *
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object.
         */
        get_orders: function(authorizationHeader) {
            if (!_.isObject(authorizationHeader)) {
                return;
            }
            var self = this;
            return Backbone.$.ajax({
                url: '/weborders/v1/orders/',
                method: 'GET',
                headers: authorizationHeader,
                contentType: 'application/json',
                data: {
                    establishment: App.Data.settings.get('establishment'),
                    web_order: true,
                    page: 1,
                    limit: 30
                },
                success: function(data) {
                    if (Array.isArray(data.data)) {
                        self.reset(data.data);
                    }
                },        // to override global ajax success handler
                error: new Function()           // to override global ajax error handler
            });
        }
    });
});