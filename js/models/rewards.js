/**
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

/**
 * Contains {@link App.Models.Rewards}, {@link App.Models.RewardsCard} constructors.
 * @module rewards
 * @requires module:backbone
 * @requires module:captcha
 * @see {@link module:config.paths actual path}
 */
define(['backbone', 'captcha'], function(Backbone) {
    'use strict';

    /**
     * Redemption codes.
     * @alias module:rewards~REDEMPTION_CODES
     * @type {Object}
     * @enum
     */
    var REDEMPTION_CODES = {
        /**
         * Redemption code for 'points' rewards.
         * @type {number}
         */
        points: 1,
        /**
         * Redemption code for 'visits' rewards.
         * @type {number}
         */
        visits: 2,
        /**
         * Redemption code for 'purchasess' rewards.
         * @type {number}
         */
        purchases: 3
    };

    /**
     * @class
     * @classdesc Represents a rewards model.
     * @alias App.Models.Rewards
     * @augments Backbone.Model
     * @example
     * // create a rewards model
     * require(['rewards'], function() {
     *     var rewards = new App.Models.Rewards();
     * });
     */
    App.Models.Rewards = Backbone.Model.extend(
    /**
     * @lends App.Models.Rewards.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {Object}
         * @enum
         */
        defaults: {
            /**
             * Number of rewards earned (points / points per rewards). Only 1 reward may be redeemed per time.
             * @type {number}
             */
            rewards_earned: 0,
            /**
             * Discount for 1 reward redemption.
             * @type {number}
             */
            discount: 0,
            /**
             * Points to next reward earned.
             * @type {number}
             */
            point_to_next_reward: 0,
            /**
             * Collected points.
             * @type {number}
             */
            value: 0,
            /**
             * Rewards is selected or not.
             * @type {boolean}
             */
            selected: false
        },
        /**
         * @returns {boolean} `true` if `reward_earned` attribute isn't less than `1`.
         */
        isAvailable: function() {
            return this.get('rewards_earned') >= 1;
        },
        /**
         * @returns {boolean} `true` if all attributes have default values.
         */
        isDefault: function() {
            return Object.keys(this.defaults).every(function(attr) {
                return this.defaults[attr] === this.get(attr);
            }, this);
        }
    });

    /**
     * @class
     * @classdesc Represents a rewards card model.
     * @alias App.Models.RewardsCard
     * @augments App.Models.Captcha
     * @example
     * // create a rewards card model
     * require(['rewards'], function() {
     *     var rewards = new App.Models.RewardsCard();
     * });
     */
    App.Models.RewardsCard = App.Models.Captcha.extend(
    /**
     * @lends App.Models.RewardsCard.prototype
     */
    {
        /**
         * Contains attributes with default values. Extends {@link App.Models.Captcha#defaults}.
         * @type {Object}
         * @property {App.Models.Rewards} purchases - rewards for purchases
         * @property {App.Models.Rewards} points - point rewards
         * @property {App.Models.Rewards} visits - rewards for visits
         * @property {string} number - rewards card number
         * @property {?number} redemption_code - code of selected rewards type ({@link module:rewards~REDEMPTION_CODES REDEMPTION_CODES})
         */
        defaults: _.extend({}, App.Models.Captcha.prototype.defaults, {
            purchases: new App.Models.Rewards,
            points: new App.Models.Rewards,
            visits: new App.Models.Rewards,
            number: '',
            redemption_code: null
        }),
        /**
         * Converts 'purchases', 'points', 'visits' attributes to instances of App.Models.Rewards.
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
         * Updates passed `rewardsType`.
         * @param {string} rewardsType - rewards type (one of 'purchases', 'points', 'visits')
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
         * Receives rewards card data from server. If a request failed restores default rewards types.
         * Used parameters of the request are:
         * ```
         * {
         *     url: '/weborders/reward_cards/',
         *     type: 'POST',
         *     dataType: 'json',
         *     data: JSON.stringify({
         *         establishment: <establishment id>,
         *         number: <rewards card number>,
         *         captchaKey: <captcha key>,
         *         captchaValue: <captcha value>
         *     })
         * }
         * ```
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
                success: function(data) {
                    // expect response that may have following formats:
                    // {status: 'OK', data:[...]} - card number exists
                    // {status: 'ERROR', data: []} - card number doesn't exist
                    // {status: 'ERROR', errorMsg: '...'} - invalid captcha
                    if(data.data) {
                        data = data.data;
                        if(Array.isArray(data) && data[0] instanceof Object) {
                            _.defaults(data[0], self.defaults);
                            updateRewards(data[0]);
                        } else {
                            // restore default rewards types
                            updateRewards(self.defaults);
                        }
                        self.trigger('onRewardsReceived');
                    } else {
                        // restore default rewards types
                        updateRewards(self.defaults);
                        self.trigger('onRewardsErrors', data.errorMsg);
                    }
                }
            });

            function updateRewards(obj) {
                self.updateRewardsType('purchases', obj.purchases);
                self.updateRewardsType('visits', obj.visits);
                self.updateRewardsType('points', obj.points);
            }
        },
        /**
         * Sets `redemption_code` attribute according `rewardsType` value.
         * @param {string} rewardsType - rewards type
         */
        selectRewardsType: function(rewardsType) {
            var reward = this.get(rewardsType),
                isAvailable = Object.keys(REDEMPTION_CODES).indexOf(rewardsType) > -1 && reward.isAvailable();
            this.set('redemption_code', isAvailable ? REDEMPTION_CODES[rewardsType] : this.defaults.redemption_code);
        },
        /**
         * Saves data in a storage. 'rewardsCard' is used as entry name.
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
         * Restores data from a storage. 'rewardsCard' is used as entry name.
         */
        loadData: function() {
            var data = getData('rewardsCard');
            data = data instanceof Object ? data : {};
            this.set(data);
        },
        /**
         * Resets all attributes to default values.
         */
        resetData: function() {
            this.set(this.defaults);
            this.trigger('onResetData');
        },
        /**
         * Resets all attributes to default values except `number` attribute.
         */
        resetDataAfterPayment: function() {
            var defaults = $.extend({}, this.defaults);
            delete defaults.number;
            this.set(defaults);
            this.trigger('onResetData');
        },
        /**
         * Updates `selected` attribute of reward type.
         * @param {string} key - one of 'points', 'visits', 'purchases' reward types.
         */
        updateSelected: function(key) {
            var redemption = this.get('redemption_code'),
                model = this.get(key);
            if(model instanceof App.Models.Rewards) {
                model.set({selected: getRedemption()});
            } else if(model instanceof Object) {
                model.selected = getRedemption();
            }

            function getRedemption() {
                return redemption ? REDEMPTION_CODES[key] === redemption : model.defaults.selected
            }
        }
    });
});