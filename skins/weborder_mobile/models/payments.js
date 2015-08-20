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

define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * Represents payments model
     */
    App.Models.Payments = Backbone.Model.extend({
        /**
         * @property {string} defaults.selected - selected payment type.
         * @default ''.
         *
         * @property {Array} defaults.available_payments - list of available payment types.
         * @default ['credit_card_button', 'gift_card', 'cash', 'paypal', 'stanford'].
         */
        defaults: {
            selected: '',
            available_payments: ['credit_card_button', 'gift_card', 'cash', 'paypal', 'stanford']
        },
        initialize: function() {
            this.setDefaultPayment();
        },
        setDefaultPayment: function() {
            this.get('available_payments').some(function(payment) {
                if(this.get(payment)) {
                    this.set('selected', payment);
                    return true;
                }
            }, this);
        },
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