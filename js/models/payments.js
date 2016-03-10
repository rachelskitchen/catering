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
     * @classdesc Represents payment token.
     * @alias App.Models.PaymentToken
     * @augments Backbone.Model
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payment = new App.Models.PaymentToken();
     * });
     */
    App.Models.PaymentToken = Backbone.Model.extend(
    /**
     * @lends App.Models.PaymentToken.prototype
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
             * Card type. 0 - 'AMEX', 1 - 'Discover', 2 - 'MASTERCARD', 3 - 'VISA',
             * 10 - 'MAESTRO', 12 - 'DINERS', 13 - 'JCB'.
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
            selected: false,
            /**
             * Payment token is primary or not.
             * @type {boolean}
             * @default false
             */
            is_primary: false,
            /**
             * Usage frequency. 0 - one time, 1 - recurring. Used in Mercury payment processor.
             * @type {?number}
             * @default null
             */
            frequency: null,
            /**
             * Token expiration time.
             * @type {string}
             * @default ''
             */
            token_expiration: ''
        },
        /**
         * Makes the payment token is selected if `is_primary` attribute is `true`.
         */
        initialize: function() {
            this.get('is_primary') && this.set('selected', true);
            Backbone.Model.prototype.initialize.apply(this, arguments);
        },
        /**
         * Payment token type.
         * @type {string}
         * @default ''
         */
        type: '',
        /**
         * Removes payment token. Sends request with following parameters:
         * ```
         * {
         *     url: <serverURL> + "/customers-auth/v1/customers/payments/<payment type>/<payment id>/",
         *     method: "POST",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {...}  // order json
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
         *
         * - If token isn't found.
         * ```
         * Status: 404
         * {
         *     "detail":"Not found."
         * }
         * ```
         * `App.Data.customer` emits `onTokenNotFound` event in this case.
         *
         * @param {string} serverURL - identity server url.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object.
         */
        removePayment: function(serverURL, authorizationHeader) {
            return Backbone.$.ajax({
                url: serverURL + "/customers-auth/v1/customers/payments/" + this.type + "/" + this.get('id') + "/",
                method: "DELETE",
                headers: authorizationHeader,
                success: new Function(),        // to override global ajax success handler
                error: new Function()           // to override global ajax error handler
            });
        }
    });

    /**
     * @class
     * @classdesc Represents collections of payment tokens.
     * @alias App.Collections.PaymentTokens
     * @augments Backbone.Collection
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payments = new App.Collections.PaymentTokens();
     * });
     */
    App.Collections.PaymentTokens = Backbone.Collection.extend(
    /**
     * @lends App.Collections.PaymentTokens.prototype
     */
    {
        /**
         * Server URL.
         * @type {string}
         * @default ''
         */
        serverURL: '',
        /**
         * If value is `true` selected token is ignored in {@link App.Collections.PaymentTokens#orderPayWithToken} method.
         * @type {boolean}
         * @default false
         */
        ignoreSelectedToken: false,
        /**
         * Creates listener for `change:selected` event to deselect all payments (radio button behavior).
         */
        initialize: function() {
            this.listenTo(this, 'change:selected', function(model, value) {
                if(value) {
                    this.where({selected: true}).forEach(function(payment) {
                        model != payment && payment.set({selected: false});
                    });
                }
            });
            Backbone.Collection.prototype.initialize.apply(this, arguments);
        },
        /**
         * Creates a new order via selected payment token. Sends request with following parameters:
         * ```
         * {
         *     url: "/weborders/v1/order-pay-token/",
         *     method: "POST",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {
         *         payment_processor: <paymentProcessor>
         *         ...
         *     }  // order json
         * }
         * ```
         * If session is already expired or invalid token is used the server returns the following response:
         * ```
         * Status: 403
         * {
         *     "detail":"Authentication credentials were not provided."
         * }
         * ```
         * The model emits `onUserSessionExpired` event in this case. Method `App.Data.custromer.logout()` is automatically called in this case.
         *
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @param {Object} order - payload data (order json).
         * @returns {Object} jqXHR object.
         */
        orderPayWithToken: function(authorizationHeader, order) {
            if(!_.isObject(authorizationHeader) || !_.isObject(order)) {
                return;
            }

            var payment = !this.ignoreSelectedToken ? this.getSelectedPayment() : null,
                cardInfo = _.isObject(order.paymentInfo) && order.paymentInfo.cardInfo;

            if (_.isObject(cardInfo)) {
                if (payment) {
                    cardInfo.token_id = payment.get('id');
                    cardInfo.vault_id = payment.get('vault_id');
                }
                cardInfo.payment_processor = this.paymentProcessor;
            }

            return Backbone.$.ajax({
                url: "/weborders/v1/order-pay-token/",
                method: "POST",
                data: JSON.stringify(order),
                headers: authorizationHeader,
                contentType: "application/json",
                success: new Function(),           // to override global ajax success handler
                error: new Function()              // to override global ajax error handler
            });
        },
        /**
         * @returns {App.Models.PaymentToken} Selected payment.
         */
        getSelectedPayment: function() {
            return this.findWhere({selected: true});
        },
        /**
         * Receives payments. Sends request with following parameters:
         * ```
         * {
         *     url: "https://identity-dev.revelup.com/customers-auth/v1/customers/payments/<type>/",
         *     method: "GET",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"}
         * }
         * ```
         * If session is already expired or invalid token is used the server returns the following response:
         * ```
         * Status: 403
         * {
         *     "detail":"Authentication credentials were not provided."
         * }
         * ```
         * The model emits `onUserSessionExpired` event in this case. Method `App.Data.custromer.logout()` is automatically called in this case.
         *
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object.
         */
        getPayments: function(authorizationHeader) {
            var self = this;
            return Backbone.$.ajax({
                url: this.serverURL + "/customers-auth/v1/customers/payments/" + this.type + "/",
                method: "GET",
                headers: authorizationHeader,
                success: function(data) {
                    if (Array.isArray(data)) {
                        self.reset(data);
                    }
                },
                error: new Function()              // to override global ajax error handler
            });
        },
        /**
         * Removes payment token.
         * @param {number} token_id - token id
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object.
         */
        removePayment: function(token_id, authorizationHeader) {
            var token = this.get(token_id),
                req = token && token.removePayment(this.serverURL, authorizationHeader),
                self = this;

            if (req) {
                req.done(function() {
                    self.remove(token);
                });
            }

            return req;
        },
        /**
         * Selects first item if no one payment token is selected.
         */
        selectFirstItem: function() {
            !this.findWhere({selected: true}) && this.length && this.at(0).set('selected', true);
        }
    });

    /**
     * @class
     * @classdesc Represents USAePay payment token.
     * @alias App.Models.USAePayPayment
     * @augments App.Models.PaymentToken
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payment = new App.Models.USAePayPayment();
     * });
     */
    App.Models.USAePayPayment = App.Models.PaymentToken.extend(
    /**
     * @lends App.Models.USAePayPayment.prototype
     */
    {
        type: 'usaepay'
    });

    /**
     * @class
     * @classdesc Represents collections of USAePay payments.
     * @alias App.Collections.PaymentTokens
     * @augments Backbone.Collection
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payments = new App.Collections.USAePayPayments();
     * });
     */
    App.Collections.USAePayPayments = App.Collections.PaymentTokens.extend(
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
         * Payment processor.
         * @type {string}
         * @default 'usaepaypayment'
         */
        paymentProcessor: 'usaepaypayment',
        /**
         * Payment token type.
         * @type {string}
         * @default 'usaepay'
         */
        type: 'usaepay',
        /**
         * Creates an order making payment with token and creates token in USAePay payment processor.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @param {Object} order - order json (see {@link App.Collections.Myorder#submit_order_and_pay})
         * @param {number} user_id - user id
         * @param {?Object} [card] - CC json (see {@link App.Collections.Myorder#submit_order_and_pay})
         * @returns {Object|undefined} Deferred object.
         */
        orderPayWithToken: function(authorizationHeader, order, user_id, card) {
            if(!_.isObject(authorizationHeader) || !_.isObject(order) || !_.isNumber(user_id)) {
                return;
            }

            var self = this,
                def = Backbone.$.Deferred(),
                isTokenCreated = _.isObject(order.paymentInfo)
                                 && order.paymentInfo.token
                                 && typeof order.paymentInfo.card_type != 'undefined'
                                 && order.paymentInfo.masked_card_number;

            if (isTokenCreated) {
                var data = {
                    customer: user_id,
                    card_type: order.paymentInfo.card_type,
                    last_digits: order.paymentInfo.masked_card_number.replace(/[^\d]/g, ''),
                    first_name: _.isObject(card) ? card.firstName : '',
                    last_name: _.isObject(card) ? card.secondName : '',
                    token: order.paymentInfo.token,
                    instance_name: App.Data.settings.get('hostname').replace(/\..*/, ''),
                    atlas_id: App.Data.settings.get('establishment')
                };

                this.createPaymentToken(authorizationHeader, data)
                    .done(function() {
                        delete order.paymentInfo.token;
                        delete order.paymentInfo.card_type;
                        delete order.paymentInfo.masked_card_number;
                        create_order_and_pay();
                    })
                    .fail(def.reject.bind(def));
            } else {
                create_order_and_pay();
            }

            function create_order_and_pay() {
                App.Collections.PaymentTokens.prototype.orderPayWithToken.call(self, authorizationHeader, order)
                    .done(def.resolve.bind(def))
                    .fail(def.reject.bind(def));
            }

            return def;
        },
        /**
         * Creates a new payment token. Sends request with following parameters:
         * ```
         * {
         *     url: "https://identity-dev.revelup.com/customers-auth/v1/customers/payments/<type>/",
         *     method: "POST",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {
         *         customer: 1,                   // customer id
         *         card_type: 0,                  // card type
         *         last_digits: 1111,             // last four digits of credit card number
         *         first_name: "John",            // first name of cardholder
         *         last_name: "Doe",              // last name of cardholder
         *         token: "abcd-efgh-ijkl-mnop",  // payment token
         *         instance_name: "qa2",          // instance name
         *         atlas_id: 1                    // establishment id
         *     }
         * }
         * ```
         * If session is already expired or invalid token is used the server returns the following response:
         * ```
         * Status: 403
         * {
         *     "detail":"Authentication credentials were not provided."
         * }
         * ```
         * The model emits `onUserSessionExpired` event in this case. Method `App.Data.custromer.logout()` is automatically called in this case.
         *
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @param {number} cardType - card type.
         * @returns {Object} jqXHR object.
         */
        createPaymentToken: function(authorizationHeader, data) {
            var self = this;

            return Backbone.$.ajax({
                url: this.serverURL + "/customers-auth/v1/customers/payments/" + this.type + "/",
                method: "POST",
                data: JSON.stringify(data),
                headers: authorizationHeader,
                contentType: "application/json",
                success: function(data) {
                    self.where({is_primary: true}).forEach(function(payment) {
                        payment.set('is_primary', false);
                    });
                    self.add(data).set('selected', true);
                },
                error: new Function()              // to override global ajax error handler
            });
        }
    });

    /**
     * @class
     * @classdesc Represents Mercury payment token. Token can be used one time.
     * Need to update `id` and `vault_id` after each payment.
     * @alias App.Models.MercuryPayment
     * @augments App.Models.PaymentToken
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payment = new App.Models.MercuryPayment();
     * });
     */
    App.Models.MercuryPayment = App.Models.PaymentToken.extend(
    /**
     * @lends App.Models.MercuryPayment.prototype
     */
    {
        type: 'mercurypay'
    });

    /**
     * @class
     * @classdesc Represents collections of Mercury payments.
     * @alias App.Collections.PaymentTokens
     * @augments Backbone.Collection
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payments = new App.Collections.USAePayPayments();
     * });
     */
    App.Collections.MercuryPayments = App.Collections.PaymentTokens.extend(
    /**
     * @lends App.Collections.MercuryPayments.prototype
     */
    {
        /**
         * Item constructor.
         * @type {Function}
         * @default App.Models.MercuryPayment
         */
        model: App.Models.MercuryPayment,
        /**
         * Payment processor.
         * @type {string}
         * @default 'mercurypaypayment'
         */
        paymentProcessor: 'mercurypaypayment',
        /**
         * Payment token type.
         * @type {string}
         * @default 'mercurypay'
         */
        type: 'mercurypay',
        /**
         * After placing order need to add created token to collection.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @param {Object} order - order json (see {@link App.Collections.Myorder#submit_order_and_pay})
         * @returns {Object} Result of App.Collections.PaymentTokens#orderPayWithToken.
         */
        orderPayWithToken: function() {
            var req = App.Collections.PaymentTokens.prototype.orderPayWithToken.apply(this, arguments);

            req.done(function(jqXHR) {
                console.log('parse token');
            });

            return req;
        }
    });

    /**
     * @class
     * @classdesc Represents Freedom payment token. Token can be expired.
     * @alias App.Models.FreedomPayment
     * @augments App.Models.PaymentToken
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payment = new App.Models.FreedomPayment();
     * });
     */
    App.Models.FreedomPayment = App.Models.PaymentToken.extend(
    /**
     * @lends App.Models.FreedomPayment.prototype
     */
    {
        type: 'freedompay'
    });

    /**
     * @class
     * @classdesc Represents collections of Freedom payments.
     * @alias App.Collections.PaymentTokens
     * @augments Backbone.Collection
     * @example
     * // create an order item
     * require(['payments'], function() {
     *     var payments = new App.Collections.FreedomPayments();
     * });
     */
    App.Collections.FreedomPayments = App.Collections.PaymentTokens.extend(
    /**
     * @lends App.Collections.FreedomPayments.prototype
     */
    {
        /**
         * Item constructor.
         * @type {Function}
         * @default App.Models.FreedomPayment
         */
        model: App.Models.FreedomPayment,
        /**
         * Payment processor.
         * @type {string}
         * @default 'freedompaypayment'
         */
        paymentProcessor: 'freedompaypayment',
        /**
         * Payment token type.
         * @type {string}
         * @default 'freedompay'
         */
        type: 'freedompay',
        /**
         * After placing order need to add created token to collection.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @param {Object} order - order json (see {@link App.Collections.Myorder#submit_order_and_pay})
         * @returns {Object} Result of App.Collections.PaymentTokens#orderPayWithToken.
         */
        orderPayWithToken: function() {
            var req = App.Collections.PaymentTokens.prototype.orderPayWithToken.apply(this, arguments);

            req.done(function(jqXHR) {
                console.log('parse token');
            });

            return req;
        }
    });
});