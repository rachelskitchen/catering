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
         * @property {string} remainingBalance=null - remaining balance on the card
         * @property {string} token='' - token for current session
         * @property {boolean} selected=false - the card is selected for payment or not
         */
        defaults: _.extend({}, App.Models.Captcha.prototype.defaults,
        {
            cardNumber: '',
            storageKey: 'giftcard',
            remainingBalance: null,
            token: '',
            selected: false
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
         * Links the gift card to customer. Sends request with following parameters:
         * ```
         * {
         *     url: "/weborders/v1/giftcard/<cardNumber>/link/",
         *     method: "GET",
         *     headers: {Authorization: "Bearer XXX"},
         *     data: {
         *         captchaValue: <captcha value>,
         *         captchaKey: <captcha key>
         *     }
         * }
         * ```
         * There are available following responses:
         * - Successful link:
         * ```
         * Status code 200
         * {
         *     status: "OK",
         *     data: {remaining_balance: 123, number: '12345'}
         * }
         * ```
         *
         * - Invalid captcha
         * ```
         * Status code 200
         * {
         *     status: "ERROR",
         *     errorMsg: "Invalid captcha or api credentials"
         * }
         * ```
         *
         * - Gift card isn't found
         * ```
         * Status code 200
         * {
         *     status: "ERROR",
         *     errorMsg: "Not found"
         * }
         * ```
         *
         * - Authorization header isn't valid:
         * ```
         * Status code 403
         * ```
         *
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object.
         */
        linkToCustomer: function(authorizationHeader) {
            var cardNumber = this.get('cardNumber'),
                captchaValue = this.get('captchaValue'),
                captchaKey = this.get('captchaKey'),
                self = this;

            if(!_.isObject(authorizationHeader) || !cardNumber || !captchaValue || !captchaKey) {
                return;
            }

            return Backbone.$.ajax({
                url: "/weborders/v1/giftcard/" + cardNumber + "/link/",
                method: "GET",
                headers: authorizationHeader,
                data: {
                    captchaValue: captchaValue,
                },
                success: function(data) {
                    if (!_.isObject(data)) {
                        return;
                    }

                    switch(data.status) {
                        case "OK":
                            self.set({
                                remainingBalance: data.data.remaining_balance,
                                token: data.data.token,
                                selected: true
                            });
                            break;
                        default:
                            self.trigger('onLinkError', data.errorMsg || 'Gift Card error');
                            self.trigger("onResetData");
                    }
                },
                error: new Function()           // to override global ajax error handler
            });
        },
        /**
         * Unlinks the gift card to customer. Sends request with following parameters:
         * ```
         * {
         *     url: "/weborders/v1/giftcard/<cardNumber>/unlink/",
         *     method: "GET",
         *     headers: {Authorization: "Bearer XXX"}
         * }
         * ```
         * There are available following responses:
         * - Successful link:
         * ```
         * Status code 200
         * {
         *     status: "OK"
         * }
         * ```
         *
         * - Authorization header is invalid:
         * ```
         * Status code 403
         * ```
         *
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object.
         */
        unlinkToCustomer: function(authorizationHeader) {
            var cardNumber = this.get('cardNumber'),
                self = this;

            if(!_.isObject(authorizationHeader) || !cardNumber) {
                return;
            }

            return Backbone.$.ajax({
                url: "/weborders/v1/giftcard/" + cardNumber + "/unlink/",
                method: "GET",
                headers: authorizationHeader,
                success: function(data) {
                    if (data.status == 'OK' && self.collection) {
                        self.collection.remove(self);
                    }
                },
                error: new Function()           // to override global ajax error handler
            });
        }
    });

    /**
     * @class
     * @classdesc Represents collection of gift cards.
     * @alias App.Collections.GiftCards
     * @augments Backbone.Collection
     * @example
     * // create a gift cards collection
     * require(['giftcard'], function() {
     *     var giftcards = new App.Collections.GiftCards([{cardNumber: '777'}, {cardNumber: '555'}]);
     * });
     */
    App.Collections.GiftCards = Backbone.Collection.extend(
    /**
     * @lends App.Collections.GiftCards.prototype
     */
    {
        /**
         * Item constructor.
         * @type {Function}
         * @default App.Models.GiftCard
         */
        model: App.Models.GiftCard,
        /**
         * If value is `true` selected gift card is ignored for payment.
         * @type {boolean}
         * @default false
         */
        ignoreSelected: false,
        /**
         * Adds listener to 'change:selected' to implement radio button behavior for gift card selection. New added item triggers 'change:selected' event.
         */
        initialize: function() {
            this.listenTo(this, 'change:selected', function(model, value) {
                if (value) {
                    this.where({selected: true}).forEach(function(item) {
                        item !== model && item.set('selected', false);
                    });
                }
            });

            this.listenTo(this, 'add', function(model) {
                model.trigger('change:selected', model, model.get('selected'));
            });
        },
        /**
         * Receives gift cards from server. Sends request with following parameters:
         * ```
         * {
         *     url: "/weborders/v1/giftcard/",
         *     method: "GET",
         *     headers: {Authorization: "Bearer XXX"}
         * }
         * ```
         * There are available following responses:
         * - Successful link:
         * ```
         * Status code 200
         * {
         *     status: "OK"
         *     data: []
         * }
         * ```
         *
         * - Authorization header is invalid:
         * ```
         * Status code 403
         * ```
         *
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} jqXHR object.
         */
        getCards: function(authorizationHeader) {
            var self = this;

            if (!_.isObject(authorizationHeader)) {
                return;
            }

            return Backbone.$.ajax({
                url: "/weborders/v1/giftcard/",
                method: "GET",
                headers: authorizationHeader,
                success: function(data) {
                    if (data.status == "OK" && Array.isArray(data.data)) {
                        self.reset(data.data.map(function(giftCard) {
                            return {
                                cardNumber: giftCard.number,
                                remainingBalance: giftCard.remaining_balance,
                                token: giftCard.token
                            };
                        }));
                    }
                },
                error: new Function()           // to override global ajax error handler
            });
        },
        /**
         * @returns {?App.Models.GiftCard} Selected gift card.
         */
        getSelected: function() {
            return this.findWhere({selected: true});
        },
        /**
         * Selects first gift card if any gift card isn't selected.
         */
        selectFirstItem: function() {
            if (!this.where({selected: true}).length && this.length) {
                this.at(0).set('selected', true);
            }
        },
        /**
         * Adds unique new item or updates existing.
         * @param {App.Models.GiftCard} giftCard - gift card model.
         */
        addUniqueItem: function(giftCard) {
            if (!(giftCard instanceof App.Models.GiftCard)) {
                return;
            }

            var existingGiftCard = this.findWhere({cardNumber: giftCard.get('cardNumber')});

            if (existingGiftCard) {
                existingGiftCard.set(giftCard.toJSON());
            } else {
                this.add(giftCard);
            }
        }
    });
});