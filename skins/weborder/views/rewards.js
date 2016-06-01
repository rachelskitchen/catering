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

 define(["rewards_view"], function(rewards_view) {
    'use strict';

    var ItemView = App.Views.CoreRewardsView.CoreRewardsItemView.extend({
        bindings: {
            ':el': 'classes: {disabled: disabled, animation: true}',
            '.checkbox': 'classes: {checked: selected}',
            '.points': 'classes: {"optional-text": not(selected), "attention-text": selected, selected: selected}'
        }
    });

    var ItemRewardsView = ItemView.extend({
        bindings: {
            '.reward__redemption-text': 'text: redemptionText(points, _lp_REWARDS_ITEM_POINTS)'
        }
    });

    var VisitRewardsView = ItemView.extend({
        bindings: {
            '.reward__redemption-text': 'text: redemptionText(points, _lp_REWARDS_VISIT_POINTS)'
        }
    });

    var PurchaseRewardsView = ItemView.extend({
        bindings: {
            '.reward__redemption-text': 'text: redemptionText(points, _lp_REWARDS_PURCHASE_POINTS)'
        }
    });

    var RewardsInfoView = App.Views.RewardsView.RewardsInfoView.extend({
        name: 'rewards',
        mod: 'info',
        bindings: {
            '.total-points-redemption': 'toggle: redemption_points',
            '.total-points-redemption__value': 'text: redemption_points',
            '.total-visits-redemption': 'toggle: redemption_visits',
            '.total-visits-redemption__value': 'text: redemption_visits',
            '.total-purchases-redemption': 'toggle: redemption_purchases',
            '.total-purchases-redemption__value': 'text: redemption_purchases',
            '.item-rewards-box': 'classes: {hide: not(length($itemRewards))}',
            '.item-rewards': 'collection: $itemRewards, itemView: "itemRewards"',
            '.visit-rewards-box': 'classes: {hide: not(length($visitRewards))}',
            '.visit-rewards': 'collection: $visitRewards, itemView: "visitRewards"',
            '.purchase-rewards-box': 'classes: {hide: not(length($purchaseRewards))}',
            '.purchase-rewards': 'collection: $purchaseRewards, itemView: "purchaseRewards"',
            '.rewards-unavailable': 'toggle: not(length(rewards))',
            '.total-row-points': 'classes: {hide: isNull(balance_points)}',
            '.total-row-visits': 'classes: {hide: isNull(balance_visits)}',
            '.total-row-purchase': 'classes: {hide: isNull(balance_purchases)}',
            '.apply-reward': 'classes: {disabled: not(length(discounts))}'
        },
        onEnterListeners: {
            '.apply-reward': 'apply'
        },
        bindingSources: {
            itemRewards: function() {
                return new Backbone.Collection();
            },
            visitRewards: function() {
                return new Backbone.Collection();
            },
            purchaseRewards: function() {
                return new Backbone.Collection();
            },
            redemption: function() {
                return new Backbone.Model({
                    points: 0,
                    visits: 0,
                    purchases: 0
                });
            }
        },
        bindingFilters: {
            isNull: function(value) {
                return value === null;
            }
        },
        itemRewards: ItemRewardsView,
        visitRewards: VisitRewardsView,
        purchaseRewards: PurchaseRewardsView,
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'onResetData', this.remove);
            this.listenTo(this.model.get('rewards'), 'add remove', function() {
                this.setItemRewards();
                this.setVisitsRewards();
                this.setPurchaseRewards();
            });
            this.setItemRewards();
            this.setVisitsRewards();
            this.setPurchaseRewards();

            var itemRewards = this.getBinding('$itemRewards'),
                visitRewards = this.getBinding('$visitRewards'),
                purchaseRewards = this.getBinding('$purchaseRewards');

            this.setBinding('redemption_points', this.countPointsToRedeem(itemRewards));
            this.setBinding('redemption_visits', this.countPointsToRedeem(visitRewards));
            this.setBinding('redemption_purchases', this.countPointsToRedeem(purchaseRewards));

            this.listenTo(itemRewards, 'change:selected', function() {
                this.setBinding('redemption_points', this.countPointsToRedeem(itemRewards));
            });
            this.listenTo(visitRewards, 'change:selected', function() {
                this.setBinding('redemption_visits', this.countPointsToRedeem(visitRewards));
            });
            this.listenTo(purchaseRewards, 'change:selected', function() {
                this.setBinding('redemption_purchases', this.countPointsToRedeem(purchaseRewards));
            });
        },
        setItemRewards: function() {
            this.getBinding('$itemRewards').reset(this.model.get('rewards').where({rewards_type: 1}));
        },
        setVisitsRewards: function() {
            this.getBinding('$visitRewards').reset(this.model.get('rewards').where({rewards_type: 2}));
        },
        setPurchaseRewards: function() {
            this.getBinding('$purchaseRewards').reset(this.model.get('rewards').where({rewards_type: 0}));
        },
        countPointsToRedeem: function(collection) {
            return _.reduce(collection.where({selected: true}), function(memo, model) {
                return memo + model.get('points');
            }, 0);
        }
    });

    var RewardsCardView = App.Views.CoreRewardsView.CoreRewardsCardView.extend({
        bindings: {
            '.reward_card_number': 'classes: {disabled: length(customer_rewardCards)}',
            '.rewards-input': 'value: number, events: ["input"], disabled: length(customer_rewardCards)'
        }
    });

    return new (require('factory'))(rewards_view.initViews.bind(rewards_view), function() {
        App.Views.RewardsView.RewardsInfoView = RewardsInfoView;
        App.Views.RewardsView.RewardsCardView = RewardsCardView;
    });
});