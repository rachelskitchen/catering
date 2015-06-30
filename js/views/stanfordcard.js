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
            '.number-input': 'value: number, events:["keyup", "blur", "touchend"], attr: {readonly: planId}',
            '.captcha-input': 'value: captchaValue, events:["keyup", "blur", "touchend"], attr: {readonly: planId}',
            '.btn-reload': 'classes: {disabled: planId}',
            '.cancel-input': 'toggle: planId'
        }),
        events: {
            'click .btn-reload': 'reload_captcha',
            'click .cancel-input': 'reset'
        },
        reset: function() {
            this.model.reset();
            this.reload_captcha();
        }
    });

    App.Views.CoreStanfordCardView.CoreStanfordCardPlanView = App.Views.FactoryView.extend({
        name: 'stanfordcard',
        mod: 'plan',
        tagName: 'li',
        className: 'stanford-plan',
        bindings: {
            ':el': 'classes: {active: selected}',
            '.name': 'text: name',
            '.balance': 'text: currencyFormat(balance)'
        },
        events: {
            'click': 'select'
        },
        select: function() {
            this.model.set('selected', true);
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

    return new (require('factory'))(function() {
        App.Views.StanfordCardView = {};
        App.Views.StanfordCardView.StanfordCardMainView = App.Views.CoreStanfordCardView.CoreStanfordCardMainView;
        App.Views.StanfordCardView.StanfordCardPlansView = App.Views.CoreStanfordCardView.CoreStanfordCardPlansView;
        App.Views.StanfordCardView.StanfordCardPlanView = App.Views.CoreStanfordCardView.CoreStanfordCardPlanView;
    });

});