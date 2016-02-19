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
 * Contains {@link App.Models.USAePayPayment}, {@link App.Collections.USAePayPayments} constructors.
 * @module payments
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(['backbone'], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents USAePay payment.
     * @alias App.Models.USAePayPayment
     * @augments Backbone.Model
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payment = new App.Models.USAePayPayment();
     * });
     */
    App.Models.USAePayPayment = Backbone.Model.extend(
    /**
     * @lends App.Models.USAePayPayment.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Customer id.
             * @type {?number}
             * @default null
             */
            customer: null,
            /**
             * Card type. 0 - 'AMEX', 1 - 'Discover', 2 - 'MASTERCARD', 3 - 'VISA'
             * @type {number}
             * @default null
             */
            card_type: null,
            /**
             * Last 4 digits of card number.
             * @type {?number}
             * @default null
             */
            last_digits: null,
            /**
             * First name of cardholder.
             * @type {string}
             * @default ''
             */
            first_name: '',
            /**
             * Last name of cardholder.
             * @type {string}
             * @default ''
             */
            last_name: '',
            /**
             * Payment token.
             * @type {string}
             * @default ''
             */
            token: '',
            /**
             * Payment vault id.
             * @type {?number}
             * @default null
             */
            vault_id: null,
            /**
             * Establishment data.
             * ```
             * {
             *     atlas_id: 1,                      // establishment id
             *     is_shared_establishments: false,  // token can be shared between others establishments
             *     is_shared_instances: false,       // token can be shared between instances
             *     instance_name: "<instance name>"  // instance name
             * }
             * ```
             * @type {?Object}
             * @default null
             */
            establishment: null,
            /**
             * Selected for payment.
             * @type {boolean}
             * @default false
             */
            selected: false
        }
    });

    /**
     * @class
     * @classdesc Represents collections of USAePay payments.
     * @alias App.Collections.USAePayPayments
     * @augments Backbone.Collection
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payments = new App.Collections.USAePayPayments();
     * });
     */
    App.Collections.USAePayPayments = Backbone.Collection.extend(
    /**
     * @lends App.Collections.USAePayPayments.prototype
     */
    {
        /**
         * Item constructor.
         * @type {Function}
         * @default App.Models.USAePayPayment
         */
        model: App.Models.USAePayPayment,
        /**
         *
         */
        orderPayUSAePayToken: function(authorizationHeader, myorder) {
            if(!_.isObject(authorizationHeader) || typeof myorder != 'string') {
                return;
            }
console.log(authorizationHeader);
            return $.ajax({
                url: "/weborders/v1/order-pay-usaepay-token/",
                method: "POST",
                data: myorder,
                headers: authorizationHeader,
                contentType: "application/json",
                success: new Function(),
                error: new Function()
            });
        }
    });
});