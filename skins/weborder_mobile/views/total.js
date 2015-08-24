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

define(["total_view"], function(total_view) {
    'use strict';

    var TotalCheckout = App.Views.CoreTotalView.CoreTotalCheckoutView.extend({
        bindings: extendProto('bindings', {
            '.discount-links': 'toggle: showDiscountsLine',
            // '.have-discounts': 'html: haveDiscountCodeOrRewards, toggle: not(any(checkout_last_discount_code))',
            '.have-discount-code': 'html: haveDiscountCode, toggle: not(checkout_last_discount_code)',
            '.remove-discount-code': 'toggle: checkout_last_discount_code'
            // '.have-rewards': 'html: haveRewards'
        }),
        computeds: extendProto('computeds', {
            haveDiscountCodeOrRewards: {
                deps: ['_lp_MYORDER_HAVE_DISCOUNT_CODE_OR_REWARDS', '_lp_MYORDER_DISCOUNT_CODE', '_lp_REWARDS_NUMBER'],
                get: function(MYORDER_HAVE_DISCOUNT_CODE_OR_REWARDS, MYORDER_DISCOUNT_CODE, REWARDS_NUMBER) {
                    return MYORDER_HAVE_DISCOUNT_CODE_OR_REWARDS.replace('%s', wrap(MYORDER_DISCOUNT_CODE, 'discount-link')).replace('%s', wrap(REWARDS_NUMBER, 'rewards-link'));
                }
            },
            haveDiscountCode: {
                deps: ['_lp_MYORDER_HAVE_DISCOUNT_CODE', '_lp_MYORDER_DISCOUNT_CODE'],
                get: function(MYORDER_HAVE_DISCOUNT_CODE, MYORDER_DISCOUNT_CODE) {
                    return MYORDER_HAVE_DISCOUNT_CODE.replace('%s', wrap(MYORDER_DISCOUNT_CODE, 'discount-link'));
                }
            },
            haveRewards: {
                deps: ['_lp_MYORDER_HAVE_DISCOUNT_CODE', '_lp_REWARDS_NUMBER'],
                get: function(MYORDER_HAVE_DISCOUNT_CODE, REWARDS_NUMBER) {
                    return MYORDER_HAVE_DISCOUNT_CODE.replace('%s', wrap(REWARDS_NUMBER, 'rewards-link'));
                }
            },
            showDiscountsLine: {
                deps: ['_system_settings_accept_discount_code', '_system_settings_enable_reward_cards_collecting', 'checkout_last_discount_code'],
                get: function(accept_discount_code, enable_reward_cards_collecting, last_discount_code) {
                    return accept_discount_code && enable_reward_cards_collecting && !last_discount_code
                }
            }
        }),
        events: extendProto('events', {
            'click .discount-link': 'showDiscountCode',
            'click .rewards-link': 'showRewards'
        }),
        showDiscountCode: function() {
            var showDiscountCode = this.options.showDiscountCode;
            typeof showDiscountCode == 'function' && showDiscountCode();
        },
        showRewards: function() {

        }
    });

    function wrap(text, className) {
        return '<span class="link ' + className + '">' + text+ "</span>";
    }

    function extendProto(prop, data) {
        return _.extend({}, App.Views.CoreTotalView.CoreTotalCheckoutView.prototype[prop], data);
    }

    return new (require('factory'))(total_view.initViews.bind(total_view), function() {
        App.Views.TotalView.TotalCheckoutView = TotalCheckout;
    });
});