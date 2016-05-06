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

    var ItemRewardsView = App.Views.CoreRewardsView.CoreRewardsItemView.extend({
        name: 'rewards',
        mod: 'item_item',
        bindings: {
            '.reward__redemption-text': 'text: redemptionText(points, _lp_REWARDS_ITEM_POINTS)'
        }
    });

    var VisitRewardsView = App.Views.CoreRewardsView.CoreRewardsItemView.extend({
        name: 'rewards',
        mod: 'item_visit',
        bindings: {
            '.reward__redemption-text': 'text: redemptionText(points, _lp_REWARDS_VISIT_POINTS)'
        }
    });

    var PurchaseRewardsView = App.Views.CoreRewardsView.CoreRewardsItemView.extend({
        name: 'rewards',
        mod: 'item_purchase',
        bindings: {
            '.reward__redemption-text': 'text: redemptionText(points, _lp_REWARDS_PURCHASE_POINTS)'
        }
    });

    var RewardsInfoView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'info',
        bindings: {
            '.rewards-number': 'text: number',
            '.total-points': 'text: balance_points',
            '.total-visits': 'text: balance_visits',
            '.total-purchases': 'text: currencyFormat(balance_purchases)',
            '.item-rewards-box': 'toggle: length($itemRewards)',
            '.item-rewards': 'collection: $itemRewards, itemView: "itemRewards"',
            '.visit-rewards-box': 'toggle: length($visitRewards)',
            '.visit-rewards': 'collection: $visitRewards, itemView: "visitRewards"',
            '.purchase-rewards-box': 'toggle: length($purchaseRewards)',
            '.purchase-rewards': 'collection: $purchaseRewards, itemView: "purchaseRewards"',
            '.rewards-unavailable': 'toggle: not(length(rewards))',
            '.total-row-points': 'classes: {hide: isNull(balance_points)}',
            '.total-row-visits': 'classes: {hide: isNull(balance_visits)}',
            '.total-row-purchase': 'classes: {hide: isNull(balance_purchases)}',
            '.apply-reward': 'classes: {disabled: not(length(discounts))}'
        },
        events: {
            'click .apply-reward': 'apply'
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
            this.listenTo(this.model, 'onResetData', this.remove);
            this.listenTo(this.model.get('rewards'), 'add remove', function() {
                this.setItemRewards();
                this.setVisitsRewards();
                this.setPurchaseRewards();
            });
            this.setItemRewards();
            this.setVisitsRewards();
            this.setPurchaseRewards();
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        apply: function() {
            this.model.trigger('onRedemptionApplied');
        },
        setItemRewards: function() {
            this.getBinding('$itemRewards').reset(this.model.get('rewards').where({type: 1}));
        },
        setVisitsRewards: function() {
            this.getBinding('$visitRewards').reset(this.model.get('rewards').where({type: 2}));
        },
        setPurchaseRewards: function() {
            this.getBinding('$purchaseRewards').reset(this.model.get('rewards').where({type: 0}));
        }
    });

    return new (require('factory'))(rewards_view.initViews.bind(rewards_view), function() {
        App.Views.RewardsView.RewardsInfoView = RewardsInfoView;
    });
});