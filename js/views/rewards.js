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
            '.rewards-captcha-input': 'value: captchaValue, events: ["input"]',
            '.submit-card': 'classes: {disabled: disableBtn}',
            '.captcha-image': 'updateCaptcha: url, classes:{test: url}'
        },
        events: {
            'click .submit-card': 'submit',
            'click .update-captcha': 'updateCaptcha'
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            inputTypeNumberMask(this.$('.rewards-input'), /^\d*$/, this.model.get('number'), true);
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
        bindingHandlers: {
            updateCaptcha: function($el, value) {
                var view = this.view;
                value && $el.on('load', removeSpinner).error(removeSpinner);
                $el.attr('src', value);
                function removeSpinner() {
                    $el.off('load error');
                    view.removeCaptchaSpinner();
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
            '.apply-reward': 'classes: {disabled: select(redemption_code, false, true)}'
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
            this.setOriginalRedemptionCode();
        },
        computeds: {
            isPointsAvailable: {
                deps: ['points', 'points_rewards_earned'],
                get: function(points) {
                    return points.isAvailable() && this.collection.getItemsWithPointValue().length;
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