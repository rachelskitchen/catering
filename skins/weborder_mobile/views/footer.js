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

    var FooterMainView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'main',
        bindings: {
            '.btn': 'text: btn_title'
        },
        events: {
            'click .btn:not(.disabled)': 'action'
        },
        action: function() {
            this.model.get('action')();
        }
    });

    var FooterCartView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: format("$1: $2 - $3", _lp_TOTAL_SUBTOTAL, currencyFormat(total_subtotal), _lp_CHECKOUT)'
        }
    });

    var FooterPaymentSelectionView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: format("$1: $2 - $3", _lp_BALANCE_DUE, currencyFormat(total_grandTotal), _lp_SUBMIT_PAYMENT)'
        }
    });

    var FooterRewardsView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: btn_title, classes: {disabled: not(all(rewardsCard_captchaValue, rewardsCard_captchaKey, rewardsCard_number))}'
        }
    });

    var FooterRewardRedemptionView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: btn_title, classes: {disabled: not(rewardsCard_redemption_code)}'
        }
    });

    return new factory(function() {
        App.Views.FooterView = {};
        App.Views.FooterView.FooterMainView = FooterMainView;
        App.Views.FooterView.FooterCartView = FooterCartView;
        App.Views.FooterView.FooterPaymentSelectionView = FooterPaymentSelectionView;
        App.Views.FooterView.FooterRewardRedemptionView = FooterRewardRedemptionView;
        App.Views.FooterView.FooterRewardsView = FooterRewardsView;
    });
});