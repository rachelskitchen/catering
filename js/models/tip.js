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
  * Contains {@link App.Models.Tip} constructor.
  * @module tip
  * @requires module:backbone
  * @see {@link module:config.paths actual path}
  */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a tips model.
     * @alias App.Models.Tip
     * @augments Backbone.Model
     * @example
     * // create a tips model
     * require(['tip'], function() {
     *     var tips = new App.Models.Tip();
     * });
     */
    App.Models.Tip = Backbone.Model.extend({
        /**
         * @prop {object} defaults - literal object containing attributes with default values.
         *
         * @prop {boolean} defaults.type - tips type (false value means tips in cash, true - will be charged from credit card).
         * @default false.
         *
         * @prop {boolean} defaults.amount - defines how to calculate amount (true - as percent from subtotal, false - specific amount in currency).
         * @default true.
         *
         * @prop {array} defaults.percents - pre-defined array of percent values which user can choose (10%, 15%, 20%).
         * @default [10, 15, 20].
         *
         * @prop {number} defaults.sum - the amount entered by user (it's used when `amount` attribute value is false).
         * @default 0.
         *
         * @prop {number} defaults.percent - percent value chosen by user.
         * @default 0.
         *
         * @prop {number} defaults.percent - percent value chosen by user.
         * @default 0.
         *
         * @prop {number} defaults.tipTotal - tip amount after applying last subtotal.
         * @default 0.
         *
         * @prop {number} defaults.subtotal - last subtotal amount applied.
         * @default 0.
         */
        defaults: {
            type: false, // tip in cash (false) or credit card (true)
            amount: true, // true - %, false - $
            percents: [10,15,20], // percent variant
            sum: 0, // sum if amount false
            percent: 0, // percent if amount true
            tipTotal: 0, // the result tip amount
            subtotal: 0, // last applied subtotal
        },
        /**
         * Adds listener to call `update_tip()` on attributes change.
         */
        initialize: function() {
            this.listenTo(this, "change", this.update_tip, this);
        },
        /**
         * Sets new tips value to `tipTotal`.
         */
        update_tip: function() {
            this.set("tipTotal", this.get_tip(this.get('subtotal'), App.Data.myorder.total.get_discounts_str(), App.Data.myorder.get_service_fee_charge()));
        },
        /**
         * @param {number} subtotal - subtotal amount to calculate percent.
         * @returns {number} tips amount.
         */
        get_tip: function(subtotal, discounts, serviceFee) {
            var type = this.get('type'),
                amount = this.get('amount'),
                percent = this.get('percent') * 1,
                sum = this.get('sum') * 1;

            this.set('subtotal', subtotal);

            if (!type) {
                return 0;
            } else {
                if (amount) {
                    return percent * (subtotal * 1 + discounts * 1 - serviceFee * 1) / 100;
                }
                else {
                    return sum;
                }
            }
        },
        /**
         * Sets default values for all attributes.
         */
        empty: function() {
            this.set(this.defaults);
        },
        /**
         * Saves data to a storage. 'tip' key is used.
         */
        saveTip: function() {
            setData('tip', this);
        },
        /**
         * Restores data from a storage. 'tip' key is used.
         */
        loadTip : function() {
            this.set(getData('tip'));
        }
    });
});