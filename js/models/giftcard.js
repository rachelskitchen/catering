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
 * Contains {@link App.Models.GiftCard} constructor.
 * @module giftcard
 * @requires module:backbone
 * @requires module:captcha
 * @see {@link module:config.paths actual path}
 */
define(["backbone", "captcha"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a Gift Card model.
     * @alias App.Models.GiftCard
     * @augments App.Models.Captcha
     * @example
     * // create a gift card model
     * require(['giftcard'], function() {
     *     var giftcard = new App.Models.GiftCard({cardNumber: '777'});
     * });
     */
    App.Models.GiftCard = App.Models.Captcha.extend(
    /**
     * @lends App.Models.GiftCard.prototype
     */
    {
        /**
         * Contains attributes with default values. Extends {@link App.Models.Captcha#defaults}.
         * @type {object}
         * @property {string} cardNumber='' - gift card number
         * @property {string} storageKey='giftcard' - key in a storage
         */
        defaults: _.extend({}, App.Models.Captcha.prototype.defaults,
        {
            cardNumber: '',
            storageKey: 'giftcard'
        }),
        /**
         * Saves attributes values in a storage (detected automatic).
         */
        saveCard: function() {
            setData(this.get('storageKey'), this);
        },
        /**
         * Restores attributes values from a storage.
         */
        loadCard: function() {
            var data = getData(this.get('storageKey'));
            data = data instanceof Object ? data : {};
            delete data.img;
            this.set(data);
            return this;
        },
        /**
         * Checks `cardNumber`, `captchaValue` values.
         * @returns {Object} One of the following objects:
         * - If all attributes aren't empty: `{status: "OK"}`
         * - If empty attributes exist:
         * ```
         * {
         *     status: "ERROR_EMPTY_FIELDS",
         *     errorMsg: <error message>,
         *     errorList: [] // array containing empty attributes
         * }
         * ```
         */
        check: function() {
            var err = [];
            if (!this.get('cardNumber')) {
                err.push(_loc.GIFTCARD_NUMBER);
            }
            if (!this.get('captchaValue')) {
                err.push(_loc.GIFTCARD_CAPTCHA);
            }
            if (err.length) {
                return {
                    status: "ERROR_EMPTY_FIELDS",
                    errorMsg: MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')),
                    errorList: err
                };
            } else {
                return {
                    status: "OK"
                };
            };
        },
        /**
         * Links the gift card to customer.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object
         */
        linkToCustomer: function(authorizationHeader) {
            var cardNumber = this.get('cardNumber');

            if(!_.isObject(authorizationHeader) || !cardNumber) {
                return;
            }

            return Backbone.$.ajax({
                url: "/weborders/v1/giftcard/" + cardNumber + "/link/",
                method: "POST",
                headers: authorizationHeader,
                success: new Function(),        // to override global ajax success handler
                error: new Function()
            });
        }
    });
});