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

    var RewardsItemView = App.Views.ItemView.extend({
        name: 'rewards',
        mod: 'item',
        el: '<li class="reward-selection__item"></li>',
        bindings: {
            ':el': 'classes: {"reward-selection__item_selected": selected}',
            '.reward__name': 'text: name',
            '.reward__discount-amount': 'text: discountAmount(amount, type)',
            '.reward__discount-text': 'text: select(is_item_level, _lp_REWARDS_ITEM_LEVEL_DISCOUNT, _lp_REWARDS_ENTIRE_ORDER_DISCOUNT)',
            '.reward__redemption-amount': 'text: points',
            '.reward__redemption-text': 'text: redemptionText(points)'
        },
        events: {
            'click': 'selectReward'
        },
        bindingFilters: {
            /**
             * Sets text that reflects reward type and amount of points to be redeemed.
             * 
             * @param  {string} rewardType - Reward type.
             * @param  {Number} points - Amount of points.
             * @returns {string} - 
             */
            redemptionText: function(points) {
                var text = _loc.REWARDS_POINTS_REDEMPTION_AMOUNT,
                    text1, text2;

                if (Array.isArray(text)) {
                    text1 = text[0];
                    text2 = text[1];
                }
                else {
                    text1 = text2 = text;
                }

                // handle plural
                return parseInt(points, 10) <= 1 ? text1 : text2;
            },
            discountAmount: function(amount, type) {
                return type ? Number(amount).toFixed(0) + '%' : App.Settings.currency_symbol + round_monetary_currency(amount);
            }
        },
        /**
         * Toggles selection of clicked reward.
         * If allow_multiple_reward_redemptions_per_order settings is true:
         * allow one selected reward of each level (item/order),
         * else allow only one selected reward.
         */
        selectReward: function() {
            var selected = this.model.get('selected'),
                allowMultiple = App.Data.settings.get('settings_system').allow_multiple_reward_redemptions_per_order;

            // reward is getting selected
            if (!selected) {
                var criteria = {selected: true};

                if (allowMultiple) {
                    // need  to find selected reward only with the same level
                    criteria.is_item_level = this.model.get('is_item_level')
                }

                // find selected reward(s)
                var selectedModels = this.model.collection.where(criteria);
                // remove selection
                selectedModels.length && _.invoke(selectedModels, 'set', {selected: false});
            } 

            // toggle selection
            this.model.set('selected', !selected);
            App.Data.myorder.rewardsCard.trigger('onSelectReward');
        }
    });

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

    var RewardsInfoView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'info',
        bindings: {
            '.rewards-number': 'text: number',
            '.total-points': 'text: balance_points',
            '.total-visits': 'text: balance_visits',
            '.total-purchases': 'text: currencyFormat(balance_purchases)',
            '.reward-selection': 'collection: rewards, itemView: "rewardItem"',
            '.rewards-unavailable': 'toggle: not(length(rewards))',
            '.rewards-total__item_points': 'classes: {hide: isNull(balance_points)}',
            '.rewards-total__item_visits': 'classes: {hide: isNull(balance_visits)}',
            '.rewards-total__item_purchases': 'classes: {hide: isNull(balance_purchases)}',
            '.apply-reward': 'classes: {disabled: select(length(discounts), false, true)}'
        },

        events: {
            'click .apply-reward': 'apply'
        },

        bindingFilters: {
            isNull: function(value) {
                return value === null;
            }
        },

        rewardItem: RewardsItemView,

        initialize: function() {
            var self = this;
            this.listenTo(this.model, 'onResetData', function() {
                self.remove();
            });
            this.listenTo(this.appData.mainModel, 'change:popup', function() {
                var selectedCard = self.options.rewards.findWhere({selected: true});                
                !selectedCard && self.apply();
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            typeof Backbone.$.fn.contentarrow == 'function' && this.$('.reward-selection').contentarrow();
        },

        remove: function() {
            typeof Backbone.$.fn.contentarrow == 'function' && this.$('.reward-selection').contentarrow('destroy');
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },

        apply: function() {
            this.model.trigger('onRedemptionApplied');
        }
    });

    return new (require('factory'))(function() {
        App.Views.RewardsView = {}
        App.Views.RewardsView.RewardsCardView = RewardsCardView;
        App.Views.RewardsView.RewardsItemApplicationView = RewardsItemApplicationView;
        App.Views.RewardsView.RewardsOrderApplicationView = RewardsOrderApplicationView;
        App.Views.RewardsView.RewardsInfoView = RewardsInfoView;
        App.Views.RewardsView.RewardsItemView = RewardsItemView;
    });
});