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

    var FooterCardView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: btn_title, classes: {disabled: not(all(card_captchaValue, card_captchaKey, card_number))}'
        }
    });

    var FooterRewardRedemptionView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: btn_title, classes: {disabled: select(length(rewardsCard_discounts), false, true)}'
        }
    });

    var FooterStanfordCardView = FooterMainView.extend({
        name: 'footer',
        mod: 'stanford_card',
        bindings: {
            '.submit-card': 'text: _lp_SUBMIT_CARD, toggle: not(card_validated), classes: {disabled: not(all(card_captchaValue, card_captchaKey, card_number))}',
            '.submit-order': 'text: _lp_SUBMIT_ORDER, toggle: card_validated, classes: {disabled: not(card_planId)}'
        },
        events: {
            'click .submit-card': 'submitCard',
            'click .submit-order': 'submitOrder'
        },
        submitCard: function() {
            var submitCard = this.options.submitCard;
            typeof submitCard == 'function' && submitCard();
        },
        submitOrder: function() {
            var submitOrder = this.options.submitOrder;
            typeof submitOrder == 'function' && submitOrder();
        }
    });

    var FooterPaymentInfoView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: format("$1 - $2", _lp_SUBMIT_PAYMENT, currencyFormat(total_grandTotal))'
        }
    });

    var FooterStanfordReloadView = FooterMainView.extend({
        bindings: {
            '.btn': 'text: btn_title, classes: {disabled: not(all(card_captchaValue, card_captchaKey, card_number, decimal(orderItem_initial_price)))}'
        }
    });


    return new factory(function() {
        App.Views.FooterView = {};
        App.Views.FooterView.FooterMainView = FooterMainView;
        App.Views.FooterView.FooterCartView = FooterCartView;
        App.Views.FooterView.FooterPaymentSelectionView = FooterPaymentSelectionView;
        App.Views.FooterView.FooterRewardRedemptionView = FooterRewardRedemptionView;
        App.Views.FooterView.FooterCardView = FooterCardView;
        App.Views.FooterView.FooterStanfordCardView = FooterStanfordCardView;
        App.Views.FooterView.FooterPaymentInfoView = FooterPaymentInfoView;
        App.Views.FooterView.FooterStanfordReloadView = FooterStanfordReloadView;
    });
});