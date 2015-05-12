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

 define(["factory", "backbone_epoxy"], function(factory) {
    'use strict';

    var RewardsCardView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'card',
        bindings: {
            '.rewards-input': 'value: number, events: ["input"]',
            '.submit-card': 'classes: {disabled: select(number, false, true)}',
        },
        events: {
            'click .submit-card': 'submit'
        },
        submit: function() {
            this.model.trigger('onGetRewards');
        }
    });

    var RewardsItemApplicationView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'item_application',
        tagName: 'li',
        binding: {
            '.discount': 'text: currencyFormat(discount)'
        }
    });

    var RewardsOrderApplicationView = RewardsItemApplicationView.extend({
        name: 'rewards',
        mod: 'order_application'
    });

    var RewardsInfoView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'info',
        bindings: {
            '.rewards-number': 'text: number',
            '.total-points': 'text: points_value',
            '.total-visits': 'text: visits_value',
            '.total-purchases': 'text: currencyFormat(purchases_value)',
            '.points-discount': 'text: currencyFormat(points_discount)',
            '.visits-discount': 'text: currencyFormat(visits_discount)',
            '.purchases-discount': 'text: currencyFormat(purchases_discount)',
            '.points-selection': 'toggle: isPointsAvailable',
            '.visits-selection': 'toggle: isVisitsAvailable',
            '.purchases-selection': 'toggle: isPurchasesAvailable',
            '.rewards-unavailable': 'toggle: doNotQualifyRewards'
        },
        events: {
            'click .apply-reward': 'apply'
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        computeds: {
            isPointsAvailable: {
                deps: ['points', 'points_rewards_earned'],
                get: function(points) {
                    return points.isAvailable();
                }
            },
            isVisitsAvailable: {
                deps: ['visits', 'visits_rewards_earned'],
                get: function(visits) {
                    return visits.isAvailable();
                }
            },
            isPurchasesAvailable: {
                deps: ['purchases', 'purchases_rewards_earned'],
                get: function(purchases) {
                    return purchases.isAvailable();
                }
            },
            doNotQualifyRewards: {
                deps: ['points_rewards_earned', 'visits_rewards_earned', 'purchases_rewards_earned'],
                get: function() {
console.log('doNotQualifyRewards', this.getBinding('isPointsAvailable'), this.getBinding('isVisitsAvailable'), this.getBinding('isPurchasesAvailable'))
                    return !(this.getBinding('isPointsAvailable') || this.getBinding('isVisitsAvailable') || this.getBinding('isPurchasesAvailable'));
                }
            }
        },
        apply: function() {
            console.log('reward has been applied');
        }
    });

    return new (require('factory'))(function() {
        App.Views.RewardsView = {}
        App.Views.RewardsView.RewardsCardView = RewardsCardView;
        App.Views.RewardsView.RewardsItemApplicationView = RewardsItemApplicationView;
        App.Views.RewardsView.RewardsOrderApplicationView = RewardsOrderApplicationView;
        App.Views.RewardsView.RewardsInfoView = RewardsInfoView;
    });
});