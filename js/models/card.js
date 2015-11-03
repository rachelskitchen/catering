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
        initialize: function() {
            this.syncWithRevelAPI();
        },
        /**
         * @method
         * Trims the `firstName`, `lastName` attributes value.
         */
        trim: function() {
            this.set({
                firstName: trim.call(this, 'firstName'),
                secondName: trim.call(this, 'secondName')
            });
            function trim(type) {
                var value = this.get(type);
                return typeof value  == 'string' ? Backbone.$.trim(value) : this.defaults[type];
            }
        },
        /**
        * Save current state model in storage (detected automatic).
        */
        saveCard: function() {
            this.trim();
            setData('card',this);
        },
        /**
         * Removing card information.
         */
        empty_card_number: function() {
            this.set({cardNumber: '', expMonth: 0, expDate: 0, securityCode: ''});
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
        check: function(opts) {
            var card = this.toJSON(),
                err = [];

            //`opts` object may have following properties:
            //  `ignorePerson` (if it's true person data isn't validated),
            //  `ignoreCardNumber` (if it's true card number isn't validated)
            //  `ignoreSecurityCode` (if it's true security code isn't validated)
            //  `ignoreExpDate` (if it's true expiration date isn't validated)
            opts = opts instanceof Object ? opts : {};

            !opts.ignorePerson && err.push.apply(err, this.checkPerson());
            !opts.ignoreCardNumber && err.push.apply(err, this.checkCardNumber());
            !opts.ignoreSecurityCode && err.push.apply(err, this.checkSecurityCode());

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

            if (!opts.ignoreExpDate && date < dateCur) {
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
            this.trim();

            var card = this.toJSON(),
                payment = App.Data.settings.get_payment_process(),
                err = [];

            if (payment.paypal) {
                (!card.firstName) && err.push(_loc.CARD_FIRST_NAME);
                (!card.secondName) && err.push(_loc.CARD_LAST_NAME);
            }

            return err;
        },
        checkSecurityCode: function() {
            var securityPattern = /^\d{3,4}$/,
                card = this.toJSON(),
                err = [];

            (!securityPattern.test(card.securityCode)) && err.push(_loc.CARD_SECURITY_CODE);
            return err;
        },
        checkCardNumber: function() {
            var cardPattern = /^[3-6]\d{12,18}$/,
                card = this.toJSON(),
                err = [];

            (!cardPattern.test(card.cardNumber)) && err.push(_loc.CARD_NUMBER);
            return err;
        },
        /**
         * Removal of information about credit card.
         */
        clearData: function() {
            this.empty_card_number();
            this.saveCard();
        },
        /**
         * Synchronization with Revel API.
         */
        syncWithRevelAPI: function() {
            var RevelAPI = this.get('RevelAPI');

            if(!RevelAPI || !RevelAPI.isAvailable()) {
                return;
            }

            var profileCustomer = RevelAPI.get('customer'),
                profileExists = RevelAPI.get('profileExists'),
                self = this;

            // when user saves profile model should be updated
            this.listenTo(RevelAPI, 'onProfileSaved', update);

            // listen to profile customer changes if user wasn't set any value for one of 'firstName', 'secondName' fields
            this.listenTo(profileCustomer, 'change', function() {
                if(RevelAPI.get('profileExists') && !this.get('firstName') && !this.get('secondName')) {
                    update();
                }
            }, this);

            // fill out current model
            this.set(getData());

            function update() {
                var data = profileCustomer.toJSON();
                self.set(getData());
            }

            function getData() {
                var data = profileCustomer.toJSON();
                return {
                    firstName: data.first_name,
                    secondName: data.last_name
                };
            }
        }
    });
});