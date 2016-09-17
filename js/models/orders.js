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
 * Contains {@link App.Models.OrderItem}, {@link App.Collections.OrderItems},
 * {@link App.Models.Order}, {@link App.Collections.Orders} constructors.
 * @module orders
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents an order item.
     * @alias App.Models.OrderItem
     * @augments App.Models.Myorder
     * @example
     * // create an order item model
     * require(['orders'], function() {
     *     var orderItem = new App.Models.OrderItem();
     * });
     */
    App.Models.OrderItem = App.Models.Myorder.extend(
    /**
     * @lends App.Models.OrderItem.prototype
     */
    {
        /**
         * Applies options via [addJSON()]{@link App.Models.Myorder#addJSON} method, calculates `initial_price`, `sum`.
         */
        initialize: function(options) {
            App.Models.Myorder.prototype.initialize.apply(this, arguments);
            if (_.isObject(options)) {
                this.addJSON(options);
                this.set({
                    initial_price: this.get_initial_price(),
                    sum: this.get_modelsum()
                });
            }
        },
        /**
         * Makes reorder.
         * @returns {Array} Array of attributes changed from order placement.
         */
        reorder: function() {
            var product = this.get_product(),
                modifiers = this.get_modifiers(),
                sizeModifier = modifiers && modifiers.getSizeModel(),
                changes = [];

            // make product reorder
            changes.push.apply(changes, product.reorder(!!sizeModifier));

            // remove order item if product isn't available right now
            if (changes.indexOf('active') && !product.get('active') && this.collection) {
                this.collection.remove(this);
            }

            // make modifiers reorder
            if (modifiers) {
                changes.push.apply(changes, modifiers.reorder())
                modifiers.enableFreeModifiers();
            };

            return changes;
        }
    });

    /**
     * @class
     * @classdesc Represents an order items.
     * @alias App.Collections.OrderItem
     * @augments App.Models.Myorder
     * @example
     * // create order items model
     * require(['orders'], function() {
     *     var orderItem = new App.Models.OrderItem();
     * });
     */
    App.Collections.OrderItems = Backbone.Collection.extend(
    /**
     * @lends App.Collections.OrderItems.prototype
     */
    {
        /**
         * Function constructor of item.
         * @type {Backbone.Model}
         * @default App.Models.OrderItem
         */
        model: App.Models.OrderItem,
        /**
         * Calls {@link App.Collections.OrderItem#reorder reorder()} method to each item.
         * @returns {Array} Array of attributes changed from order placement.
         */
        reorder: function () {
            var changes = [];

            this.each(function(orderItem) {
                changes.push.apply(changes, orderItem.reorder());
            });

            return changes;
        }
    });

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
     * @lends App.Models.Order.prototype
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
            tip: 0,
            /**
             * Items quantity.
             * @type {number}
             * @default 0
             */
            items_qty: 0,
            /**
             * Order items.
             * @type {Backbone.Collection}
             * @default null
             */
            items: null,
            /**
             * Items request (jqXHR).
             * @type {?object}
             * @default null
             */
            itemsRequest: null
        },
        /**
         * Initializes `items` attribute.
         * Calculates `items_qty` attribute as algebraic addition of `opts.items[].qty` values.
         */
        initialize: function(opts) {
            this.set('items', new App.Collections.OrderItems);
            if (_.isObject(opts) && Array.isArray(opts.items)) {
                this.set('items_qty', opts.items.reduce(function(iter, item) {
                    return _.isNumber(item.qty) && item.qty > 0 ? iter + item.qty : iter;
                }, 0));
            }
        },
        /**
         * Receives order items from server. Sends request with following parameters:
         * ```
         * {
         *     url: "'/weborders/v1/order/<order id>/orderitems/'",
         *     method: "GET",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"}
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
        getItems: function(authorizationHeader) {
            if (!_.isObject(authorizationHeader)) {
                return;
            }
            var items = this.get('items');
            return Backbone.$.ajax({
                url: '/weborders/v1/order/' + this.get('id') + '/orderitems/',
                method: 'GET',
                headers: authorizationHeader,
                contentType: 'application/json',
                success: function(data) {
                    if (Array.isArray(data.data)) {
                        items.reset(data.data);
                    }
                },
                error: new Function()           // to override global ajax error handler
            });
        },
        /**
         * Sets items. Sends items request if `itemsRequest` value is null.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} `itemsRequest`
         */
        setItems: function(authorizationHeader) {
            var req = this.get('itemsRequest');
            if (!req) {
                req = this.getItems(authorizationHeader);
                this.set('itemsRequest', req);
            }
            return req;
        },
        /**
         * Makes reorder.
         * Emits `onReorderStarted` event once this method gets called.
         * Emits `onReorderCompleted` event passing in parameters an array of attributes changed from order placement.
         * Emits `onReorderFailed` event if `itemsRequest` fails.
         * * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         */
        reorder: function(authorizationHeader) {
            var self = this,
                itemsRequest = this.setItems(authorizationHeader);

            this.trigger('onReorderStarted');
            itemsRequest.done(reorder);
            itemsRequest.fail(this.trigger.bind(this, 'onReorderFailed'));

            function reorder() {
                var _order = self.clone(),
                    order = _order.toJSON(),
                    items = _order.get('items'),
                    settings = App.Settings,
                    myorder = App.Data.myorder,
                    checkout = myorder.checkout,
                    paymentMethods = App.Data.paymentMethods,
                    addresses = App.Data.customer.get('addresses'),
                    dining_option = settings.dining_options.indexOf(order.dining_option) > -1
                        ? _.invert(DINING_OPTION)[order.dining_option]
                        : settings.default_dining_option,
                    changes = [];

                if (!items) {
                    return;
                }

                // empty cart
                myorder.empty_myorder();

                // makes items reorder
                changes.push.apply(changes, items.reorder());

                // delivery address recover.
                if (_.isObject(order.delivery_address)) {
                    // reset addresses selection
                    addresses.invoke('set', {selected: false});
                    // create address for the order's dining option in addresses if it doesn't exist
                    addresses.getCheckoutAddress(dining_option);
                    // set values from order's delivery address
                    addresses.get(dining_option).set(_.extend(
                        addresses.getOrderAddress(order.delivery_address),
                        {
                            selected: true,
                            isReorderAddress: true
                        }
                    ));
                }

                // check dining_option
                if (settings.dining_options.indexOf(order.dining_option) == -1) {
                    changes.push('dining_option');
                }

                // recover checkout
                checkout.set({
                    notes: order.notes,
                    dining_option: dining_option
                });


                if (paymentMethods) {
                    var paymentMethod = paymentMethods.getMethod(order.payment_type);
                    // check paymentMethod
                    if (settings.payment_processor[paymentMethod]) {
                        // recover payment method
                        paymentMethods.set({
                            selected: paymentMethods.getMethod(order.payment_type)
                        });
                    } else {
                        changes.push('paymentMethod');
                    }
                }

                // add items
                items.each(function(orderItem) {
                   myorder.add(orderItem);
                });

                self.trigger('onReorderCompleted', changes);
            }
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
     * @lends App.Collections.Orders.prototype
     */
    {
        /**
         * Function constructor of item.
         * @type {Backbone.Model}
         * @default App.Models.Order
         */
        model: App.Models.Order,
        /**
         * Attribute used as comparator in sorting.
         * @type {string}
         * @default 'id'
         */
        comparator: 'id',
        /**
         * Receives orders from server. Sends request with following parameters:
         * ```
         * {
         *     url: "/weborders/v1/orders/",
         *     method: "GET",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {
         *         establishment: <number>,  // establishment id
         *         web_order: true,          // filters only weborder
         *         page: <number> ,          // page number
         *         limit: <number>           // max orders number  in response
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
                        self.add(data.data);
                    }
                },
                error: new Function()           // to override global ajax error handler
            });
        },
        /**
         * Receives order from server. Sends request with following parameters:
         * ```
         * {
         *     url: "/weborders/v1/orders/",
         *     method: "GET",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {
         *         order: <number>,   // order id
         *     }
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
        get_order: function(authorizationHeader, order_id) {
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
                    order: order_id
                },
                success: function(data) {
                    if (Array.isArray(data.data)) {
                        self.add(data.data);
                    }
                },
                error: new Function()           // to override global ajax error handler
            });
        }
    });
});