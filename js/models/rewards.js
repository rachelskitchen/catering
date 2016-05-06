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
 * Contains {@link App.Models.Rewards}, {@link App.Collections.Rewards}, {@link App.Models.RewardsBalance}, {@link App.Models.RewardsCard} constructors.
 * @module rewards
 * @requires module:backbone
 * @requires module:captcha
 * @see {@link module:config.paths actual path}
 */
define(['backbone', 'captcha'], function(Backbone) {
    'use strict';

    var REWARD_TYPES = {
        purchases: 0,
        points: 1,
        visits: 2
    };

    /**
     * @class
     * @classdesc Represents a reward model.
     * @alias App.Models.Rewards
     * @augments Backbone.Model
     * @example
     * // create a reward model
     * require(['reward'], function() {
     *     var reward = new App.Models.Rewards();
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
             * Discount id.
             * @type {?number}
             */
            id: null,
            /**
             * Discount name.
             * @type {String}
             */
            name: '',
            /**
             * Discount amount.
             * @type {Number}
             */
            amount: 0,
            /**
             * Indicated whether this discount is item level.
             * @type {Boolean}
             */
            is_item_level: false,
            /**
             * Number of points needed to redeem reward.
             * @type {Number}
             */
            points: 0,
            /**
             * Reward type.
             * Possible values for rewards_type are:
             *   REWARDS_TYPE_PURCHASES = 0
             *   REWARDS_TYPE_ITEMS = 1
             *   REWARDS_TYPE_VISITS = 2
             * @type {Number}
             */
            rewards_type: null,
            /**
             * Discount type.
             *   0 for Amount; 1 for Percent.
             * @type {Number}
             */
            type: 0,
            /**
             * Indicates whether the reward is selected.
             * @type {boolean}
             */
            selected: false,
            /**
             * Indicates whether the reward is disabled for selection.
             * @type {boolean}
             */
            disabled: false
        }
    });

    /**
     * @class
     * @classdesc Represents a rewards collection.
     * @alias App.Collections.Rewards
     * @augments Backbone.Collection
     * @example
     * // create a rewards collection
     * require(['rewards'], function() {
     *     var rewards = new App.Collection.Rewards();
     * });
     */
    App.Collections.Rewards = Backbone.Collection.extend(
    /**
     * @lends App.Collections.Rewards.prototype
     */
    {
        /**
         * Item constructor.
         * @type {App.Models.Rewards}
         * @default App.Models.Rewards
         */
        model: App.Models.Rewards,
        /**
         * Adds listener to `change:selected` event to update `selected` and `disabled` attributes of items
         * and trigger `onSelectReward` event.
         *
         */
        initialize: function() {
            this.listenTo(this, 'change:selected', function(model, value) {
                this.updateDisabled(model, value);
                this.deselect(model, value);
                this.trigger('onSelectReward');
            });
            Backbone.Collection.prototype.initialize.apply(this, arguments);
        },
        /**
         * Updates items `disabled` attribute.
         *
         * @param {App.Models.Rewards} model - changed model
         * @param {boolean} value - value of `selected` attribute
         */
        updateDisabled: function(model, value) {
            var criteria = {};

            if (App.Settings.allow_multiple_reward_redemptions_per_order) {
                criteria.is_item_level = model.get('is_item_level');
            }

            this.where(criteria).forEach(function(item) {
                item !== model && item.set('disabled', value);
            });
        },
        /**
         * Changes items `selected` attribute on `false`.
         *
         * @param {App.Models.Rewards} model - changed model
         * @param {boolean} value - value of `selected` attribute
         */
        deselect: function(model, value) {
            var criteria = {selected: true};

            if (App.Settings.allow_multiple_reward_redemptions_per_order) {
                criteria.is_item_level = model.get('is_item_level');
            }

            value && this.where(criteria).forEach(function(item) {
                item !== model && item.set('selected', false);
            });
        }
    });

    /**
     * @class
     * @classdesc Represents a rewards balance model.
     * @alias App.Models.RewardsBalance
     * @augments Backbone.Model
     * @example
     * // create a rewards balance model
     * require(['reward'], function() {
     *     var rewardsBalance = new App.Models.RewardsBalance();
     * });
     */
    App.Models.RewardsBalance = Backbone.Model.extend(
    /**
     * @lends App.Models.RewardsBalance.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {Object}
         * @enum
         */
        defaults: {
            /**
             * Points balance.
             * @type {?Number}
             */
            points: null,
            /**
             * Visits balance.
             * @type {?Number}
             */
            visits: null,
            /**
             * Purchases balance
             * @type {?Number}
             */
            purchases: null
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
         * @property {string} number - rewards card number
         * @property {App.Collections.Rewards} rewards - collection of rewards
         * @property {App.Models.RewardsBalance} balance - model of rewards balances
         * @property {Array} discounts - ids of selected discounts. Its maximum length is 2.
         */
        defaults: _.extend({}, App.Models.Captcha.prototype.defaults, {
            number: '',
            rewards: new App.Collections.Rewards,
            balance: new App.Models.RewardsBalance,
            discounts: []
        }),
        /**
         * Converts `rewards` to instance of {@link App.Collection.Rewards}, `balance` to instance of {@link App.Models.Rewards}.
         */
        initialize: function() {
            this.REWARD_TYPES = REWARD_TYPES;
            this.updateRewards();
            this.updateBalance();
            this.listenTo(this, 'onSelectReward', this.updateSelected);
            this.listenTo(this, 'change:rewards', this.updateRewards.bind(this, undefined));
            this.listenTo(this, 'change:balance', this.updateBalance.bind(this, undefined));
        },
        /**
         * Converts 'rewards' attribute to instance of App.Collections.Rewards.
         * @param  {object} data - data to set.
         */
        updateRewards: function(data) {
            // 'change:rewards' event is triggerred
            if (typeof data == 'undefined') {
                data = this.get('rewards');
                if (Array.isArray(data)) {
                    data = new App.Collections.Rewards(data);
                    this.set('rewards', data);
                }
            }
            // data is array of discounts, received from backend
            else if (Array.isArray(data)) {
                this.get('rewards').set(data);
            }
        },
        /**
         * Converts 'balance' attribute to instance of App.Models.RewardsBalance.
         * @param  {object} data - data to set.
         */
        updateBalance: function(data) {
            if (typeof data == 'undefined') {
                data = this.get('balance');
            }
            if (!(data instanceof App.Models.RewardsBalance)) {
                // keys of data object can be strings or numbers
                (typeof data.points != 'undefined')
                    || (typeof data[this.REWARD_TYPES.points] != 'undefined' && (data.points = data[this.REWARD_TYPES.points]));

                (typeof data.visits != 'undefined')
                    || (typeof data[this.REWARD_TYPES.visits] != 'undefined' && (data.visits = data[this.REWARD_TYPES.visits]));

                (typeof data.purchases != 'undefined')
                    || (typeof data[this.REWARD_TYPES.purchases] !=' undefined' && (data.purchases = data[this.REWARD_TYPES.purchases]));

                data = new App.Models.RewardsBalance({
                    points: data.points,
                    visits:  data.visits,
                    purchases: data.purchases
                });
            }
            this.set('balance', data);
        },
        /**
         * Updates list of selected rewards.
         */
        updateSelected: function() {
            var selectedDiscounts = this.get('rewards').reduce(function(memo, reward) {
                reward.get('selected') && memo.push(reward.get('id'));
                return memo;
            }, []);
            this.set('discounts', selectedDiscounts);
        },
        /**
         * Receives rewards card data from server. If a request failed restores default rewards types.
         * Used parameters of the request are:
         * ```
         * {
         *     url: '/weborders/rewards/',
         *     type: 'POST',
         *     dataType: 'json',
         *     data: {
         *         establishmentId: <establishment id>,
         *         number: <rewards card number>,
         *         captchaKey: <captcha key>,
         *         captchaValue: <captcha value>
         *     }
         * }
         * ```
         */
        getRewards: function() {
            var number = this.get('number'),
                captchaKey = this.get('captchaKey'),
                captchaValue = this.get('captchaValue'),
                self = this,
                items;

            // abort execution if card number, captchaKey, captchaValue aren't assigned
            if(!number.length || !captchaKey.length || !captchaValue.length) {
                return;
            }

            // can not send request to rewards/ with no items
            if (!App.Data.myorder.length) {
                this.trigger('onRewardsErrors', _loc.REWARDS_EMPTY_CART);
                return;
            }

            // get the order items info for submitting to server
            items = App.Data.myorder.map(function(order) {
                return order.item_submit();
            });

            // send request
            Backbone.$.ajax({
                url: '/weborders/rewards/',
                type: 'POST',
                data: JSON.stringify({
                    establishmentId: App.Data.settings.get("establishment"),
                    items: items,
                    orderInfo: {
                        rewards_card: {
                            number: number
                        }
                    },
                    captchaKey: captchaKey,
                    captchaValue: captchaValue
                }),
                dataType: 'json',
                success: function(data) {
                    // expect response that may have following formats:
                    // {status: 'OK', data: {...}} - card number exists
                    // {status: 'REWARD_CARD_NOT_FOUND', errorsMsg: '...'} - card number doesn't exist
                    // {status: 'ERROR', errorMsg: '...'} - invalid captcha
                    if (data.status == 'OK') {
                        data = data.data;
                        if (data instanceof Object && data.discounts instanceof Object) {
                            updateData(data);
                        } else {
                            // restore default rewards
                            resetData();
                        }
                        self.trigger('onRewardsReceived');
                    } else {
                        // restore default rewards
                        resetData();
                        self.trigger('onRewardsErrors', data.errorMsg);
                    }
                }
            });

            function updateData(obj) {
                self.updateRewards(obj.discounts);
                self.updateBalance(obj.balances);
            }

            function resetData() {
                self.set('discounts', self.defaults.discounts);
                self.get('rewards').reset();
            }
        },
        /**
         * Saves data in a storage. 'rewardsCard' is used as entry name.
         */
        saveData: function() {
            var data = _.extend(this.toJSON(), {
                rewards: this.get('rewards').toJSON(),
                balance: this.get('balance').toJSON()
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
            var defaults = $.extend({}, this.defaults);
            delete defaults.rewards;
            this.set(defaults);
            this.get('rewards').reset(); // reset rewards collection
            this.get('rewards').trigger('update');
            this.trigger('onResetData');
        },
        /**
         * Resets all attributes to default values except `number` attribute.
         */
        resetDataAfterPayment: function() {
            var defaults = $.extend({}, this.defaults);
            delete defaults.number;
            delete defaults.rewards;
            this.set(defaults);
            this.get('rewards').reset(); // reset rewards collection
        }
    });
});