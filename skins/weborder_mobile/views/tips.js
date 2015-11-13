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

define(["tips_view"], function(tips_view) {
    'use strict';

    var TipsLineView = App.Views.FactoryView.extend({
        name: 'tips',
        mod: 'line',
        bindings: {
            '.ctrl': 'reset: tipValue, events: ["click"]',
            '.tipAmount': 'value: monetaryFormat(tipValue), events:["blur"], restrictInput: "0123456789.", kbdSwitcher: "float"',
            '.percent-10': 'classes: {selected: equal(percentValue, 10)}',
            '.percent-15': 'classes: {selected: equal(percentValue, 15)}',
            '.percent-20': 'classes: {selected: equal(percentValue, 20)}',
            '.percent-10 .percent-sum': 'text: currencyFormat(percents_10)',
            '.percent-15 .percent-sum': 'text: currencyFormat(percents_15)',
            '.percent-20 .percent-sum': 'text: currencyFormat(percents_20)',
        },
        events: {
            'click .percent': 'setPercent'
        },
        computeds: {
            tipValue: {
                deps: ['tipTotal'],
                set: function(value) {
                    value = Number(value);

                    if(!value) {
                        this.model.set({
                            type: false
                        });
                    } else {
                        this.model.set({
                            type: true,
                            amount: false,
                            sum: value
                        });
                    }

                    this.model.trigger('change:tipTotal');

                    return value;
                },
                get: function(tipTotal) {
                    return tipTotal;
                }
            },
            percentValue: {
                deps: ['percent', 'sum', 'subtotal', 'amount', 'type'],
                get: function(percent, sum, subtotal, amount, type) {
                    if (!type) {
                        return 0;
                    }
                    if (amount) {
                        return percent;
                    }
                    return sum ? (sum / subtotal * 100) : 0
                }
            },
            percents_10: {
                deps: ['subtotal', 'discounts_str'],
                get: function(subtotal, discounts_str) {
                    return this.getPercentAmount(subtotal, discounts_str, 10);
                }
            },
            percents_15: {
                deps: ['subtotal', 'discounts_str'],
                get: function(subtotal, discounts_str) {
                    return this.getPercentAmount(subtotal, discounts_str, 15);
                }
            },
            percents_20: {
                deps: ['subtotal', 'discounts_str'],
                get: function(subtotal, discounts_str) {
                    return this.getPercentAmount(subtotal, discounts_str, 20);
                }
            }
        },
        setPercent: function(e) {
            this.model.set({
                type: true,
                amount: true,
                percent: Backbone.$(e.target).data('amount')
            });
        },
        getPercentAmount: function(subtotal, discounts_str, percent) {
            var tip = new this.model.constructor({
                type: true,
                amount: true,
                percent: percent
            });
            var serviceFee = App.Data.myorder.get_service_fee_charge();
            return tip.get_tip(subtotal, discounts_str, serviceFee);
        }
    });

    return new (require('factory'))(tips_view.initViews.bind(tips_view), function() {
        App.Views.TipsView.TipsLineView = TipsLineView;
    });
});