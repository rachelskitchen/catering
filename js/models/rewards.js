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

define(['backbone'], function(Backbone) {
    'use strict';

    var REDEMPTION_CODES = {
        points: 1,
        visits: 2,
        purchases: 3
    };

    /**
     * @class App.Models.Rewards
     * Represents customer's rewards (points, visits, purchases).
     */
    App.Models.Rewards = Backbone.Model.extend({
        /**
         * @property {Object} defaults - the set of model attributes with default values.
         *
         * @property {Object} defaults.rewards_earned - number of rewards earned (points / points per rewards). Only 1 reward may be redeemed per time.
         * @default 0.
         *
         * @property {Object} defaults.discount - discount for 1 reward redemption.
         * @default 0.
         *
         * @property {Object} defaults.point_to_next_reward - points to next reward earned.
         * @default 0.
         *
         * @property {Object} defaults.value - points collected.
         * @default 0.
         */
        defaults: {
            rewards_earned: 0,
            discount: 0,
            point_to_next_reward: 0,
            value: 0,
            selected: false
        },
        /**
         * @method
         * @returns {boolean} true if 'reward_earned' attribute isn't less than 1, otherwise false.
         */
        isAvailable: function() {
            return this.get('rewards_earned') >= 1;
        },
        /**
         * @method
         * @returns {boolean} true if all attributes have default values
         */
        isDefault: function() {
            return Object.keys(this.defaults).every(function(attr) {
                return this.defaults[attr] === this.get(attr);
            }, this);
        }
    });

    /**
     * @class App.Models.RewardsCard
     * Represents customer's rewards card data.
     */
    App.Models.RewardsCard = Backbone.Model.extend({
        /**
         * @property {Object} defaults - the set of model attributes with default values.
         *
         * @property {App.Models.Rewards} defaults.purchases - rewards for purchases.
         * @default instance of App.Models.Rewards.
         *
         * @property {App.Models.Rewards} defaults.points - point rewards.
         * @default instance of App.Models.Rewards.
         *
         * @property {App.Models.Rewards} defaults.visits - rewards for visits.
         * @default instance of App.Models.Rewards.
         *
         * @property {string} defaults.number - rewards card number.
         * @default ''.
         *
         * @property {number} defaults.redemption_code - code of selected rewards type. 1 - points reward, 2 - visits reward, 3 - purchases reward.
         * @defaults null.
         */
        defaults: {
            purchases: new App.Models.Rewards,
            points: new App.Models.Rewards,
            visits: new App.Models.Rewards,
            number: '',
            redemption_code: null,
            captchaImage: '',
            captchaKey: '',
            captchaValue: ''
        },
        /**
         * @method
         * Ensures 'purchases', 'points', 'visits' attributes are instances of App.Models.Rewards.
         */
        initialize: function() {
            this.updateRewardsType('purchases', this.get('purchases'));
            this.updateRewardsType('visits', this.get('visits'));
            this.updateRewardsType('points', this.get('points'));
            this.listenTo(this, 'change:purchases', this.updateRewardsType.bind(this, 'purchases', undefined));
            this.listenTo(this, 'change:visits', this.updateRewardsType.bind(this, 'visits', undefined));
            this.listenTo(this, 'change:points', this.updateRewardsType.bind(this, 'points', undefined));
            this.listenTo(this, 'change:redemption_code', function(model, value) {
                Object.keys(REDEMPTION_CODES).forEach(this.updateSelected, this);
            }, this);
        },
        /**
         * @method
         * Updates passed rewards type.
         *
         * @param {string} rewardsType - rewards type (one of purchases, points, visits),
         * @param {Object} data - data of rewards type (simple object is converted to instance of App.Models.Rewards)
         */
        updateRewardsType: function(rewardsType, data) {
            if(Object.keys(REDEMPTION_CODES).indexOf(rewardsType) == -1) {
                return;
            }
            if(typeof data == 'undefined') {
                data = this.get(rewardsType);
            }
            if(!(data instanceof App.Models.Rewards)) {
                data = new App.Models.Rewards(data);
            }
            this.set(rewardsType, data);
            this.updateSelected(rewardsType);
        },
        /**
         * @method
         * Receives rewards card data from /weborders/reward_cards/ resource. If request failed restores default rewards types.
         *
         * @fires App.Models.RewardsCard#onRewardsReceived - fires when a response from server is received
         */
        getRewards: function() {
            var number = this.get('number'),
                captchaKey = this.get('captchaKey'),
                captchaValue = this.get('captchaValue'),
                self = this;

            // abort execution if card number, captchaKey, captchaValue aren't assigned
            if(!number.length || !captchaKey.length || !captchaValue.length) {
                return;
            }

            // send request
            Backbone.$.ajax({
                url: '/weborders/reward_cards/',
                type: 'POST',
                data: JSON.stringify({
                    establishment: App.Data.settings.get("establishment"),
                    number: number,
                    captchaKey: captchaKey,
                    captchaValue: captchaValue
                }),
                dataType: 'json',
                successResp: function(data) {
                    if(Array.isArray(data) && data[0] instanceof Object) {
                        _.defaults(data[0], self.defaults);
                        updateRewards(data[0]);
                    } else {
                        // restore default rewards types
                        updateRewards(self.defaults);
                    }
                },
                errorResp: function(data) {
                    // restore default rewards types
                    updateRewards(self.defaults);
                }
            });

            function updateRewards(obj) {
                self.updateRewardsType('purchases', obj.purchases);
                self.updateRewardsType('visits', obj.visits);
                self.updateRewardsType('points', obj.points);
                self.trigger('onRewardsReceived');
            }
        },
        /**
         * @method
         * Set `redemption_code` attribute.
         */
        selectRewardsType: function(rewardsType) {
            var reward = this.get(rewardsType),
                isAvailable = Object.keys(REDEMPTION_CODES).indexOf(rewardsType) > -1 && reward.isAvailable();
            this.set('redemption_code', isAvailable ? REDEMPTION_CODES[rewardsType] : this.defaults.redemption_code);
        },
        /**
         * @method
         * Saves data in storage. 'rewardsCard' is used as entry name.
         */
        saveData: function() {
            var data = _.extend(this.toJSON(), {
                points: this.get('points').toJSON(),
                visits: this.get('visits').toJSON(),
                purchases: this.get('purchases').toJSON()
            });
            setData('rewardsCard', data);
        },
        /**
         * @method
         * Restores data from storage. 'rewardsCard' is used as entry name.
         */
        loadData: function() {
            var data = getData('rewardsCard');
            data = data instanceof Object ? data : {};
            this.set(data);
        },
        /**
         * @method
         * Resets all attributes to default values.
         */
        resetData: function() {
            this.set(this.defaults);
        },
        /**
         * @method
         * Loads captcha data.
         */
        loadCaptcha: function() {
            var self = this;
            Backbone.$.getJSON('/weborders/captcha/?establishment=1', {}, function(json) {
                self.set('captchaImage', json.captcha_image);
                self.set('captchaKey', json.captcha_key);
            });
        },
        /**
         * @method
         * Updates `selected` attribute of reward type.
         *
         * @param key - one of 'points', 'visits', 'purchases' reward types.
         */
        updateSelected: function(key) {
            var redemption = this.get('redemption_code'),
                model = this.get(key);
            if(model){
                model.set({selected: redemption ? REDEMPTION_CODES[key] === redemption : model.defaults.selected});
            }
        }
    });
});