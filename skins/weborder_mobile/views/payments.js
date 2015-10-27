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
            '[data-payment="cash"]': 'classes: {"font-color2": equal(selected, "cash"), "bg-color1": equal(selected, "cash")}',
            '[data-payment="credit_card_button"]': 'classes: {"font-color2": equal(selected, "credit_card_button"), "bg-color1": equal(selected, "credit_card_button")}',
            '[data-payment="gift_card"]': 'classes: {"font-color2": equal(selected, "gift_card"), "bg-color1": equal(selected, "gift_card")}',
            '[data-payment="paypal"]': 'classes: {"font-color2": equal(selected, "paypal"), "bg-color1": equal(selected, "paypal")}',
            '[data-payment="stanford"]': 'classes: {"font-color2": equal(selected, "stanford"), "bg-color1": equal(selected, "stanford"), hide: equal(checkout_dining_option, "DINING_OPTION_ONLINE")}'
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
        selectPayment: function(e) {
            this.model.set('selected', Backbone.$(e.target).data('payment'));
        }
    });

    return new factory(function() {
        App.Views.PaymentsView = {};
        App.Views.PaymentsView.PaymentsMainView = PaymentsMain;
    });
});