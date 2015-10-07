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

define(["factory", "giftcard_view"], function(factory) {
    'use strict';

    App.Views.CoreStanfordCardView = {};

    App.Views.CoreStanfordCardView.CoreStanfordCardMainView = App.Views.CoreGiftCardView.CoreGiftCardMainView.extend({
        name: 'stanfordcard',
        mod: 'main',
        bindings: _.extend({}, App.Views.CoreGiftCardView.CoreGiftCardMainView.prototype.bindings, {
            '.number-input': 'value: number, events:["keyup", "blur", "touchend"], attr: {readonly: validated}, restrictInput: "0123456789", kbdSwitcher: "numeric", pattern: /^(\\d{0,15})$/',
            '.captcha-input': 'value: captchaValue, events:["keyup", "blur", "touchend"], attr: {readonly: validated}, pattern: /^\\w{0,4}$/',
            '.btn-reload': 'classes: {disabled: validated}',
            '.cancel-input': 'toggle: validated',
            '.captcha_input_line': 'toggle: not(validated)',
            '.captcha_container': 'toggle: not(validated)',
            '.card_title': 'text:select(validated, _lp_STANFORDCARD_TITLE_INFO, _lp_STANFORDCARD_TITLE)'
        }),
        events: {
            'click .btn-reload': 'updateCaptcha',
            'click .cancel-input': 'reset'
        },
        initialize: function() {
            App.Views.CoreGiftCardView.CoreGiftCardMainView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:planId', this.updateCartTotals, this);
            this.updateCartTotals(this.model, this.model.get('planId'));
        },
        reset: function() {
            this.model.reset();
            this.updateCaptcha();
        },
        removeFromDOMTree: function() {
            this.updateCartTotals();
            App.Views.CoreGiftCardView.CoreGiftCardMainView.prototype.removeFromDOMTree.apply(this, arguments);
        },
        remove: function() {
            this.updateCartTotals();
            App.Views.CoreGiftCardView.CoreGiftCardMainView.prototype.remove.apply(this, arguments);
        },
        updateCartTotals: function(model, planId) {
            var myorder = this.options.myorder;
            if(planId) {
                myorder.update_cart_totals({type: PAYMENT_TYPE.STANFORD, planId: planId});
            } else {
                myorder.update_cart_totals();
            }
        }
    });

    App.Views.CoreStanfordCardView.CoreStanfordCardPlanView = App.Views.FactoryView.extend({
        name: 'stanfordcard',
        mod: 'plan',
        tagName: 'li',
        className: 'stanford-plan',
        initialize: function(options) {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            ':el': 'classes: {active: selected, disabled: not(is_enough_funds)}, toggle: equal(type, "D")',
            '.name': 'text: name',
            '.balance': 'text: currencyFormat(balance)'
        },
        events: {
            'click': 'select'
        },
        select: function() {
            if (this.model.is_enough_funds()) {
                this.model.set('selected', true);
            }
        }
    });

    App.Views.CoreStanfordCardView.CoreStanfordCardPlansView = App.Views.FactoryView.extend({
        name: 'stanfordcard',
        mod: 'plans',
        bindings: {
            ':el': 'toggle: plansLength',
            '.list': 'collection: $collection'
        },
        computeds: {
            plansLength: {
                deps: ['$collection'],
                get: function(plans) {
                    return plans.length;
                }
            }
        },
        itemView: App.Views.CoreStanfordCardView.CoreStanfordCardPlanView
    });

    App.Views.CoreStanfordCardView.CoreStanfordStudentStatusView = App.Views.FactoryView.extend({
        name: 'stanfordcard',
        mod: 'student',
        events: {
            'click .btn-yes': 'yes',
            'click .btn-no': 'no',
        },
        yes: function() {
            this.model.trigger('onStudent');
        },
        no: function() {
            this.model.doNotAskStudentStatus();
            this.model.trigger('onNotStudent');
        }
    });

    App.Views.CoreStanfordCardView.CoreStanfordCardReloadView = App.Views.CoreStanfordCardView.CoreStanfordCardMainView.extend({
        name: 'stanfordcard',
        mod: 'reload',
        initialize: function() {
            var model = this.model.toJSON();
            this.ignoreUpdateCaptcha = model.captchaImage && model.captchaKey && model.captchaValue;
            App.Views.CoreStanfordCardView.CoreStanfordCardMainView.prototype.initialize.apply(this, arguments);
            delete this.ignoreUpdateCaptcha;
        },
        updateCaptcha: function() {
            !this.ignoreUpdateCaptcha && App.Views.CoreStanfordCardView.CoreStanfordCardMainView.prototype.updateCaptcha.apply(this, arguments);
        },
        updateCartTotals: new Function() // override parent's method to avoid myorder.update_cart_total() calling
    });

    return new (require('factory'))(function() {
        App.Views.StanfordCardView = {};
        App.Views.StanfordCardView.StanfordCardMainView = App.Views.CoreStanfordCardView.CoreStanfordCardMainView;
        App.Views.StanfordCardView.StanfordCardPlansView = App.Views.CoreStanfordCardView.CoreStanfordCardPlansView;
        App.Views.StanfordCardView.StanfordCardPlanView = App.Views.CoreStanfordCardView.CoreStanfordCardPlanView;
        App.Views.StanfordCardView.StanfordCardStudentStatusView = App.Views.CoreStanfordCardView.CoreStanfordStudentStatusView;
        App.Views.StanfordCardView.StanfordCardReloadView = App.Views.CoreStanfordCardView.CoreStanfordCardReloadView;
    });

});