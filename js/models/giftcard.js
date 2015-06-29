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

define(["backbone", "captcha"], function(Backbone) {
    'use strict';

    App.Models.GiftCard = App.Models.Captcha.extend({
        defaults: _.extend({}, App.Models.Captcha.prototype.defaults, {
            cardNumber: '',
            storageKey: 'giftcard'
        }),
        /**
        * Save current state model in storage (detected automatic).
        */
        saveCard: function() {
            setData(this.get('storageKey'), this);
        },
        loadCard: function() {
            var data = getData(this.get('storageKey'));
            data = data instanceof Object ? data : {};
            delete data.img;
            this.set(data);
            return this;
        },
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
        }
    });
});