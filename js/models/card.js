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

define(["backbone"], function(Backbone) {
    'use strict';

    App.Models.Card = Backbone.Model.extend({
        defaults: {
            firstName: '',
            secondName: '',
            cardNumber: '',
            securityCode: '',
            expMonth: 0,
            expDate: 0,
            expTotal: "",
            street: '',
            city: '',
            state: '',
            zip: '',
            img: App.Data.settings.get("img_path")
        },
        /**
        * Save current state model in storage (detected automatic).
        */
        saveCard: function() {
            setData('card',this);
        },
        empty_card_number: function() {
            this.set({cardNumber: '', expMonth: 0, expDate: 0});
        },
        /**
        * Load state model from storage (detected automatic).
        */
        loadCard: function() {
            var data = getData('card');
            data = data instanceof Object ? data : {};
            delete data.img;
            this.set(data);
            return this;
        },
        check: function() {
            var cardPattern = /^[3-6]\d{12,18}$/,
                skin = App.Data.settings.get('skin'),
                card = this.toJSON(),
                err = [];

            err = err.concat(this.checkPerson());
            !cardPattern.test(card.cardNumber) && err.push('Card Number');
            err = err.concat(this.checkSecurityCode());

            if (err.length) {
                return {
                    status: "ERROR_EMPTY_FIELDS",
                    errorMsg: MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')),
                    errorList: err
                };
            }
            var month = card.expMonth,
                year = card.expDate,
                date = new Date(year, month),
                dateCur = new Date();

            if (date < dateCur) {
                return {
                    status: "ERROR",
                    errorMsg: MSG.ERROR_CARD_EXP
                };
            }

            return {
                status: "OK"
            };
        },
        checkPerson: function() {
            var card = this.toJSON(),
                payment = App.Data.settings.get_payment_process(),
                err = [];

            if (payment.paypal && payment.paypal_direct_credit_card) {
                !card.firstName && err.push('First Name');
                !card.secondName && err.push('Last Name');
            }

            return err;
        },
        checkSecurityCode: function() {
            var securityPattern = /^\d{3,4}$/,
                card = this.toJSON(),
                err = [];
            !securityPattern.test(card.securityCode) && err.push('Security Code');
            return err;
        }
    });
});