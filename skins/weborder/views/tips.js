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
        className: 'give-tips-box',
        bindings: {
            '.ctrl': 'reset: tipValue, events: ["click"]',
            '.tipAmount': 'value: monetaryFormat(tipValue), events:["blur"], restrictInput: "0123456789.", kbdSwitcher: "float"',
            '.percents': 'value: percentAmount, options: _percents',
            '.types': 'value: typeValue, options: [{label: _lp_TIPS_NONE, value: "0"}, {label: _lp_TIPS_CREDIT, value: "1"}]',
            '.tip-amount-box': 'attr: {"data-currency": _system_settings_currency_symbol}, classes: {disabled: not(type)}',
            '.percents-box': 'classes: {disabled: not(type)}'
        },
        computeds: {
            _percents: {
                deps: ['percents'],
                get: function(percents) {
                    var percents = [{label: _loc.TIPS_OTHER, value: '0'}],
                        _percents = this.model.get('percents');
                    Array.isArray(_percents) && _percents.forEach(function(percent) {
                        percents.push({label: percent + '%', value: percent});
                    });
                    return percents;
                }
            },
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
            percentAmount: {
                deps: ['percent', 'sum', 'subtotal', 'amount', 'type', 'total_discounts'],
                get: function(percent, sum, subtotal, amount, type, discounts) {
                    if (!type) {
                        return 0;
                    }
                    // percent amount already set
                    if (amount) {
                        return percent;
                    }
                    // tips sum is 0
                    else if (!sum) {
                        return 0;
                    }
                    var serviceFee = App.Data.myorder.get_service_fee_charge(),
                        total = subtotal * 1 + discounts * 1 - serviceFee * 1; // subtotal before discounts
                    return total ? (sum / total * 100) : 0;
                },
                set: function(value) {
                    value = Number(value);

                    if (!value) {
                        this.model.set({
                            amount: false
                        });
                    } else {
                        this.model.set({
                            amount: true,
                            percent: value
                        });
                    }

                    this.model.trigger('change');

                    return value
                }
            },
            typeValue: {
                deps: ['type'],
                get: function(type) {
                    return Number(this.model.get('type'));
                },
                set: function(value) {
                    value = Boolean(Number(value));
                    this.model.set('type', value);
                    return value;
                }
            }
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