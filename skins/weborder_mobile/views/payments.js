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

define(["factory"], function(factory) {
    'use strict';

    var PaymentsMain = App.Views.FactoryView.extend({
        name: 'payments',
        mod: 'main',
        events: {
            'click .payment': 'selectPayment'
        },
        bindings: {
            '.cash': 'text: cash',
            '[data-payment="cash"]': 'classes: {"primary-button": equal(selected, "cash"), "regular-button": not(equal(selected, "cash"))}',
            '[data-payment="credit_card_button"]': 'classes: {"primary-button": equal(selected, "credit_card_button"), "regular-button": not(equal(selected, "credit_card_button"))}',
            '[data-payment="gift_card"]': 'classes: {"primary-button": equal(selected, "gift_card"), "regular-button": not(equal(selected, "gift_card"))}',
            '[data-payment="paypal"]': 'classes: {"primary-button": equal(selected, "paypal"), "regular-button": not(equal(selected, "paypal"))}',
            '[data-payment="stanford"]': 'classes: {"primary-button": equal(selected, "stanford"), "regular-button": not(equal(selected, "stanford")), hide: orderItems_hasGiftCard}'
        },
        computeds: {
            cash: {
                deps: ['checkout_dining_option'],
                get: function(dining_option) {
                    var isDelivery = dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING';
                    return isDelivery ? MSG.PAY_AT_DELIVERY : MSG.PAY_AT_STORE;
                }
            }
        },
        bindingSources: {
            orderItems: function() {
                var model = new Backbone.Model({
                    hasGiftCard: hasGiftCard()
                });

                model.listenTo(App.Data.myorder, 'add remove', function() {
                    model.set('hasGiftCard', hasGiftCard());
                });

                return model;

                function hasGiftCard() {
                    return App.Data.myorder.some(function(item) {
                        return item.is_gift();
                    });
                }
            }
        },
        selectPayment: function(e) {
            this.model.set('selected', Backbone.$(e.target).data('payment'));
        }
    });

    return new factory(function() {
        App.Views.PaymentsView = {};
        App.Views.PaymentsView.PaymentsMainView = PaymentsMain;
    });
});