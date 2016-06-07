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

    App.Views.CoreRewardsView = {};

    var RewardsItemView = App.Views.CoreRewardsView.CoreRewardsItemView = App.Views.ItemView.extend({
        name: 'rewards',
        mod: 'item',
        el: '<li class="reward-selection__item"></li>',
        bindings: {
            ':el': 'classes: {"reward-selection__item_selected": selected}',
            '.reward__name': 'text: name',
            '.reward__discount-amount': 'text: discountAmount(amount, type)',
            '.reward__discount-text': 'text: select(is_item_level, _lp_REWARDS_ITEM_LEVEL_DISCOUNT, _lp_REWARDS_ENTIRE_ORDER_DISCOUNT)',
            '.reward__redemption-amount': 'text: points',
            '.reward__redemption-text': 'text: redemptionText(points, _lp_REWARDS_POINTS_REDEMPTION_AMOUNT)'
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
            redemptionText: function(points, text) {
                var text1, text2;

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

            // toggle selection
            this.model.set('selected', !selected);
            this.options.collectionView.model.trigger('onSelectReward');
        }
    });

    App.Views.CoreRewardsView.CoreRewardsCardView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'card',
        bindings: {
            '.rewards-input': 'value: number, events: ["input"], disabled: length(customer_rewardCards)',
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
            var self = this;
            this.listenTo(this.model, 'onResetData', this.updateCaptcha);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            inputTypeMask(this.$('.rewards-input'), /^\d*$/, this.model.get('number'), 'numeric');
            this.listenTo(this.model, 'updateCaptcha', this.updateCaptcha, this);
            this.listenTo(this.options.customer.get('rewardCards'), "add remove reset", function() {
                self.options.customer.trigger('change:rewardCards'); //it's to update binding value customer_rewardCards
            });
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

    App.Views.CoreRecaptchaView = {};
    App.Views.CoreRecaptchaView.CoreRecaptchaMainView = App.Views.FactoryView.extend({
        name: 'recaptcha',
        mod: 'main',
        initialize: function() {
            var self = this,
                dfd = App.Data.settings.load_google_captcha();

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);

            if (dfd.state() != 'resolved') {
                this.loadResourceSpinner();
            }
            dfd.done(function(){
                self.removeResourceSpinner();
                grecaptcha.render(self.$('.captcha_container')[0], {
                   'sitekey' : App.Settings.recaptcha_site_key,
                   'theme' : 'light',  // optional
                   'callback': self.sessionKeyCallback.bind(self),
                   'expired-callback': self.sessionExpiresCallback.bind(self)
                });
            });
            this.updateCaptcha();
        },
        loadResourceSpinner: function() {
            this.$('.spinner-container').spinner();
            this.resourceSpinner = this.$('.ui-spinner');
        },
        removeResourceSpinner: function() {
            this.resourceSpinner && this.resourceSpinner.remove();
            delete this.resourceSpinner;
        },
        sessionKeyCallback: function(response) {
            trace("sessionKeyCallback=>", response);
            this.model.set('captchaValue', response);
        },
        sessionExpiresCallback: function() {
            trace("sessionKeyExpires =>");
            this.model.set('captchaValue', '');
        },
        updateCaptcha: function() {
            this.model.loadCaptcha();
        }
       // get_session_key: function() {
       //     return grecaptcha.getResponse( this.widgetId );
       // }
    });

    App.Views.CoreRewardsView.CoreRewardsCardView = App.Views.FactoryView.extend({
        name: 'rewards',
        mod: 'card',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.subViews.push(App.Views.GeneratorView.create('CoreRecaptcha', {
                    el: this.$('.recaptcha_view'),
                    model: this.model,
                    mod: 'Main',
                    cacheId: true }));

            this.listenTo(this.options.customer.get('rewardCards'), "add remove reset", function() {
                self.options.customer.trigger('change:rewardCards'); //it's to update binding value customer_rewardCards
            });
        },
        bindings: {
            '.rewards-input': 'value: number, events: ["input"], disabled: length(customer_rewardCards)',
            '.submit-card': 'classes: {disabled: disableBtn}',
        },
        events: {
            'click .submit-card': 'submit',
            'keydown .submit-card': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.submit();
                }
            },
        },
        computeds: {
            disableBtn: {
                deps: ['number', 'captchaValue'],
                get: function(number, captchaValue) {
                    return !(number && captchaValue);
                }
            },
        },
        submit: function() {
            this.model.trigger('onGetRewards');
        }
    });

    var RewardsCardProfileView = App.Views.CoreRewardsView.CoreRewardsCardView.extend({
        name: 'profile',
        mod: 'rewardcard'
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
            var rewardsCard = this.collection.rewardsCard;
            rewardsCard.update(this.model);
            rewardsCard.trigger('onRedemptionApplied');
        }
    });

    return new (require('factory'))(function() {
        App.Views.RewardsView = {}
        App.Views.RewardsView.RewardsCardView = App.Views.CoreRewardsView.CoreRewardsCardView;
        App.Views.RewardsView.RewardsCardProfileView = RewardsCardProfileView;
        App.Views.RewardsView.RewardsItemApplicationView = RewardsItemApplicationView;
        App.Views.RewardsView.RewardsOrderApplicationView = RewardsOrderApplicationView;
        App.Views.RewardsView.RewardsInfoView = RewardsInfoView;
        App.Views.RewardsView.RewardsItemView = RewardsItemView;
    });
});