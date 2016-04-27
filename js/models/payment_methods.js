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
 * Contains {@link App.Models.Payments} constructor.
 * @module payment_methods
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents payment methods available for user.
     * @alias App.Models.PaymentMethods
     * @augments Backbone.Model
     * @example
     * // create a paymentMethods model
     * require(['payment_methods'], function() {
     *     var paymentMethods = new App.Models.PaymentMethods();
     * });
     */
    App.Models.PaymentMethods = Backbone.Model.extend(
    /**
     * @lends App.Models.PaymentMethods.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * Currently selected payment method
             * @type {string}
             * @default ''
             */
            selected: '',
            /**
             * Array of available payment methods
             * @type {Array}
             * @default ['credit_card_button', 'gift_card', 'cash', 'paypal', 'stanford']
             */
            available_payments: ['credit_card_button', 'gift_card', 'cash', 'paypal', 'stanford']
        },
        /**
         * Sets default payment method.
         */
        initialize: function() {
            this.setDefaultPayment();
        },
        /**
         * Marks first available payment method as selected.
         */
        setDefaultPayment: function() {
            this.get('available_payments').some(function(payment) {
                if(this.get(payment)) {
                    this.set('selected', payment);
                    return true;
                }
            }, this);
        },
        /**
         * Triggers unique event for selected payment method.
         *  - 'credit_card_button' method emits 'payWithCreditCard' event;
         *  - 'gift_card' method emits 'payWithGiftCard' event;
         *  - 'paypal' method emits 'payWithPayPal' event;
         *  - 'cash' method emits 'payWithCash' event;
         *  - 'stanford' method emits 'payWithStanfordCard' event;
         */
        onPay: function() {
            switch(this.get('selected')) {
                case 'credit_card_button':
                    this.trigger('payWithCreditCard');
                    break;

                case 'gift_card':
                    this.trigger('payWithGiftCard');
                    break;

                case 'paypal':
                    this.trigger('payWithPayPal');
                    break;

                case 'cash':
                    this.trigger('payWithCash');
                    break;

                case 'stanford':
                    this.trigger('payWithStanfordCard');
                    break;

                default:
                    break;
            }
        }
    });
});