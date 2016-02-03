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

 define(["factory", "myorder_view"], function(factory) {
    'use strict';

    var RewardsCardView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'card',
        bindings: {
            '.rewards-input': 'value: number, events: ["input"]',
            '.rewards-captcha-input': 'value: captchaValue, events: ["input"]',
            '.submit-card': 'classes: {disabled: disableBtn}',
            '.captcha-image': 'updateCaptcha: url'
        },
        events: {
            'click .submit-card': 'submit',
            'keydown .submit-card': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.submit();
                }
            },
            'click .update-captcha': 'updateCaptcha',
            'keydown .update-captcha': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.updateCaptcha();
                }
            }
        },
        initialize: function() {
            this.listenTo(this.model, 'onResetData', this.updateCaptcha);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            inputTypeMask(this.$('.rewards-input'), /^\d*$/, this.model.get('number'), 'numeric');
            this.updateCaptcha();
        },
        computeds: {
            disableBtn: {
                deps: ['number', 'captchaValue', 'captchaKey'],
                get: function(number, captchaValue, captchaKey) {
                    return !(number && captchaValue && captchaKey);
                }
            },
            url: {
                deps: ['captchaImage', '_settings_host'],
                get: function(captchaImage, _settings_host) {
                    if(captchaImage) {
                        return _settings_host + captchaImage;
                    } else {
                        return '';
                    }
                }
            }
        },
        submit: function() {
            this.model.trigger('onGetRewards');
        },
        updateCaptcha: function() {
            this.removeCaptchaSpinner();
            this.createCaptchaSpinner();
            this.model.set('captchaImage', '');
            this.model.set('captchaValue', '');
            this.model.loadCaptcha();
        },
        createCaptchaSpinner: function() {
            this.$('.captcha-spinner').spinner();
            this.captchaSpinner = this.$('.ui-spinner');
        },
        removeCaptchaSpinner: function() {
            this.captchaSpinner && this.captchaSpinner.remove();
            delete this.captchaSpinner;
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

    var RewardsPointsItemView = App.Views.MyOrderView.MyOrderItemView.extend({
        name: 'rewards',
        mod: 'points_item',
        className: 'order-item',
        initialize: function() {
            // Set current `this` value as `this` value for `this.bindingSources.item` function.
            // To avoid change of RewardsPointsItemView.prototype.bindingSources.item after first view initialization
            // need to create own property 'bindingSources' as clone of prototype value.
            this.bindingSources = _.extend({}, this.bindingSources);
            this.bindingSources.item = this.bindingSources.item.bind(this);
            App.Views.MyOrderView.MyOrderItemView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.weight': 'classes: {hide: select(item_sold_by_weight, false, true)}',
            '.quantity': 'classes: {hide: item_sold_by_weight}',
            '.weight.name': 'text: format("$1 $2", item_sizeModifier, item_name)',
            '.quantity.name': 'text: format("$1x $2 $3", item_quantity, item_sizeModifier, item_name)',
            '.weight-info': 'text: weightPriceFormat(item_weight, item_initial_price)',
            '.price': 'text: currencyFormat(item_sum)',
            '.discount': 'text: currencyFormat(reward_discount)',
            'li.special': 'toggle: item_special',
            'span.special': 'text: item_special',
            '.cost': 'toggle: false'
        },
        bindingSources: {
            item: function() {
                return new Backbone.Model(this.getData());
            }
        },
        updateBingingSource: function() {
            var item = this.getBinding('$item');
            item.set(this.getData());
            item.trigger('update');
        },
        update: function() {
            this.updateBingingSource();
            App.Views.MyOrderView.MyOrderItemView.prototype.update.apply(this, arguments);
        }
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
            '.points-selection': 'toggle: isPointsAvailable, classes: {active: points_selected}',
            '.visits-selection': 'toggle: isVisitsAvailable, classes: {active: visits_selected}',
            '.purchases-selection': 'toggle: isPurchasesAvailable, classes: {active: purchases_selected}',
            '.rewards-unavailable': 'toggle: doNotQualifyRewards',
            '.points-collected': 'classes: {hide: isPointsDefault}',
            '.visits-collected': 'classes: {hide: isVisitsDefault}',
            '.purchases-collected': 'classes: {hide: isPurchasesDefault}',
            '.apply-reward': 'classes: {disabled: select(redemption_code, false, true)}',
            '.points-redemption': 'text: pointsPerReward(points_value, points_rewards_earned)',
            '.visits-redemption': 'text: pointsPerReward(visits_value, visits_rewards_earned)',
            '.purchases-redemption': 'text: pointsPerReward(purchases_value, purchases_rewards_earned)',
            '.items-with-points': 'collection:$itemsWithPointsRewardDiscount, itemView:"itemWithPointDiscountView"',
            '.points-redemption-info': 'text: selectText(points_value, points_rewards_earned, _lp_REWARDS_POINTS_REDEMPTION_AMOUNT)',
            '.visits-redemption-info': 'text: selectText(visits_value, visits_rewards_earned, _lp_REWARDS_POINTS_REDEMPTION_AMOUNT)',
            '.purchases-redemption-info': 'text: selectText(purchases_value, purchases_rewards_earned, _lp_REWARDS_POINTS_REDEMPTION_AMOUNT)',
        },
        events: function() {
            return {
                'click .apply-reward': this.apply,
                'click .points-selection': this.selectRewardType.bind(this, 'points'),
                'click .visits-selection': this.selectRewardType.bind(this, 'visits'),
                'click .purchases-selection': this.selectRewardType.bind(this, 'purchases')
            }
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'onResetData', this.resetOriginalRedemptionCode, this);

            // update $itemsWithPointsRewardDiscount when items or points discount update
            this.listenTo(this.collection, 'add remove change', this.updateItemsWithPointsRewardDiscount, this);
            this.listenTo(this.model.get('points'), 'change:discount', this.updateItemsWithPointsRewardDiscount, this);

            this.updateItemsWithPointsRewardDiscount();
            this.setOriginalRedemptionCode();
        },
        computeds: {
            isPointsAvailable: {
                deps: ['points', 'points_rewards_earned', '$itemsWithPointsRewardDiscount'],
                get: function(points, rewards, items) {
                    return points.isAvailable() && items.length;
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
            isPointsDefault: {
                deps: ['points'],
                get: function(points) {
                    return points.isDefault();
                }
            },
            isVisitsDefault: {
                deps: ['visits'],
                get: function(visits) {
                    return visits.isDefault();
                }
            },
            isPurchasesDefault: {
                deps: ['purchases'],
                get: function(purchases) {
                    return purchases.isDefault();
                }
            },
            doNotQualifyRewards: {
                deps: ['isPointsAvailable', 'isVisitsAvailable', 'isPurchasesAvailable'],
                get: function(isPointsAvailable, isVisitsAvailable, isPurchasesAvailable) {
                    return !(isPointsAvailable || isVisitsAvailable || isPurchasesAvailable);
                }
            }
        },
        bindingFilters: {
            pointsPerReward: function(points, rewards) {
                return parseInt(points / rewards, 10);
            },
            selectText: function(points, rewards, text1, text2) {
                if(Array.isArray(text1) && typeof text2 == 'undefined') {
                    text2 = text1[1];
                    text1 = text1[0];
                }
                return parseInt(points / rewards, 10) <= 1 ? text1 : text2;
            }
        },
        bindingSources: {
            itemsWithPointsRewardDiscount: function() {
                return new Backbone.Collection();
            }
        },
        itemWithPointDiscountView: RewardsPointsItemView,
        remove: function() {
            !this.removed && this.model.set('redemption_code', this.originalRedemptionCode);
            this.removed = true;
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        apply: function() {
            this.setOriginalRedemptionCode();
            this.model.trigger('onRedemptionApplied');
        },
        selectRewardType: function(type) {
            var model = this.model.get(type);

            // If reward type is already selected need to unselect it.
            // Otherwise it should be selected.
            if(model && model.get('selected')) {
                this.model.selectRewardsType(null);
            } else {
                this.model.selectRewardsType(type);
            }
        },
        setOriginalRedemptionCode: function() {
            this.originalRedemptionCode = this.model.get('redemption_code');
        },
        resetOriginalRedemptionCode: function() {
            this.originalRedemptionCode = this.model.defaults.redemption_code;
        },
        updateItemsWithPointsRewardDiscount: function() {
            var items = this.getBinding('$itemsWithPointsRewardDiscount'),
                discount = this.model.get('points').get('discount');
            items.reset(this.collection.getItemsWithPointsRewardDiscount(discount));
            items.trigger('update');
        }
    });

    return new (require('factory'))(function() {
        App.Views.RewardsView = {}
        App.Views.RewardsView.RewardsCardView = RewardsCardView;
        App.Views.RewardsView.RewardsItemApplicationView = RewardsItemApplicationView;
        App.Views.RewardsView.RewardsOrderApplicationView = RewardsOrderApplicationView;
        App.Views.RewardsView.RewardsInfoView = RewardsInfoView;
        App.Views.RewardsView.RewardsPointsItemView = RewardsPointsItemView;
    });
});