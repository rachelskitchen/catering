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

    /**
     * @class App.Models.Rewards
     * Represents customer's rewards (points, visits, purchases).
     */
    App.Models.Rewards = Backbone.Model.extend({
        /**
         * @property {Object} defaults - the set of model attributes with default values.
         *
         * @property {Object} defaults.rewards_earned - rewards earned.
         * @default 0.
         *
         * @property {Object} defaults.discount - discount.
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
            value: 0
        },
        /**
         * @method
         * @returns {boolean} true if 'reward_earned' attribute is more than 0, otherwise false.
         */
        isAvailable: function() {
            return this.get('rewards_earned') > 0;
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
         * @default instance of App.Models.Rewards
         *
         * @property {App.Models.Rewards} defaults.points - point rewards.
         * @default instance of App.Models.Rewards
         *
         * @property {App.Models.Rewards} defaults.visits - rewards for visits.
         * @default instance of App.Models.Rewards
         *
         * @property {string} defaults.number - rewards card number.
         * @default ''.
         */
        defaults: {
            purchases: new App.Models.Rewards,
            points: new App.Models.Rewards,
            visits: new App.Models.Rewards,
            number: ''
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
        },
        /**
         * @method
         * Updates passed rewards type.
         *
         * @param {string} rewardsType - rewards type (one of purchases, points, visits),
         * @param {Object} data - data of rewards type (simple object is converted to instance of App.Models.Rewards)
         */
        updateRewardsType: function(rewardsType, data) {
            if(Object.keys(this.defaults).indexOf(rewardsType) == -1) {
                return;
            }
            if(typeof data == 'undefined') {
                data = this.get(rewardsType);
            }
            if(!(data instanceof App.Models.Rewards)) {
                data = new App.Models.Rewards(data);
            }
            this.set(rewardsType, data);
        },
        /**
         * @method
         * Receives rewards card data from /weborders/reward_cards/ resource. If request failed restores default rewards types.
         *
         * @fires App.Models.RewardsCard#onRewardsReceived - fires when a response from server is received
         */
        getRewards: function() {
            var number = this.get('number'),
                self = this;

            // abort execution if card number isn't assigned
            if(!number.length) {
                return;
            }

            // send request
            Backbone.$.ajax({
                url: '/weborders/reward_cards/',
                type: 'POST',
                data: {
                    establishment: App.Data.settings.get("establishment"),
                    number: number
                },
                dataType: 'json',
                successResp: function(data) {
                    if(data[0] instanceof Object) {
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
                self.updateRewardsType('visits', obj.purchases);
                self.updateRewardsType('points', obj.purchases);
                self.trigger('onRewardsReceived');
            }
        }
    });
});