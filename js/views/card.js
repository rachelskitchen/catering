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

define(["backbone", "factory"], function(Backbone) {
    'use strict';

    App.Views.CoreCardView = {};

    App.Views.CoreCardView.CoreCardMainView = App.Views.FactoryView.extend({
        name: 'card',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'add_card', this.setData, this);
            this.listenTo(this.model, 'change:firstName change:secondName', this.updateData, this); // update first name & last name of view
        },
        render: function() {
            var expYear, expMonth, cardNumber, securityCode, model = {}, self = this;
            model.firstName = this.model.escape('firstName');
            model.secondName = this.model.escape('secondName');
            model.cardNumber = this.model.escape('cardNumber');
            model.securityCode = this.model.escape('securityCode');
            model.street = this.model.escape('street');
            model.city = this.model.escape('city');
            model.state = this.model.escape('state');
            model.zip = this.model.escape('zip');
            model.isFirefox = /firefox/i.test(navigator.userAgent);
            expYear = this.$('#exp-year');

            var payment = App.Data.settings.get_payment_process();
            if (payment.paypal && payment.paypal_direct_credit_card)
                model.paypal_direct_credit_card = true;
            else
                model.paypal_direct_credit_card = false;
            this.$el.html(this.template(model));

            expYear = this.$('#exp-year');
            cardNumber = this.$('.number');
            securityCode = this.$('.secure');
            expMonth = this.$('#exp-month');

            for(var i = (new Date).getFullYear(), l = i + 21; i <= l; i++)
                expYear.append('<option value="' + i + '">' + i + '</option>');

            expMonth.val(this.model.escape('expMonth'));
            $('option:selected', expMonth).length === 0 && $('option:first', expMonth).prop('selected',true);
            expYear.val(this.model.escape('expDate'));
            $('option:selected', expYear).length === 0 && $('option:first', expYear).prop('selected',true);

            inputTypeNumberMask(cardNumber, /^\d{0,19}$/);
            inputTypeNumberMask(securityCode, /^(\d{0,4})$/, '', 1); // Bug 13910
            if (cssua.userAgent.mobile) {
                var ios_version_old = false;
                if (cssua.userAgent.ios && cssua.userAgent.ios.substr(0, 1) == 6) {
                    ios_version_old = true;
                }
                var hack = false;
                if (cssua.userAgent.android) {
                    /*
                    Hack for bug: https://code.google.com/p/android/issues/detail?id=24626.
                    Bug of Revel Systems: http://bugzilla.revelup.com/bugzilla/show_bug.cgi?id=5368.
                    */
                    if (check_android_old_version(cssua.userAgent.android)) { // checking version OS Android (old version is Android <= 4.2.1)
                        hack = true;
                        cardNumber.attr("type", "text");
                        cardNumber.focus(function() {
                            $(this).attr("type", "number");
                        });
                        cardNumber.blur(function() {
                            $(this).attr("type", "text");
                        });
                        securityCode.attr("type", "text");
                        securityCode.focus(function() {
                            $(this).attr("type", "number");
                        });
                        securityCode.blur(function() {
                            $(this).attr("type", "text");
                        });
                    }
                }
                if (!hack) {
                    if (ios_version_old) {
                        cardNumber.attr("type", "text");
                    }
                }
            }

            this.$('.first_name, .last_name').numberMask({pattern: /^.*$/ }).on("keypressNumber", function(event) {
                try {
                    var start = event.target.selectionStart,
                        end = event.target.selectionEnd,
                        direction = event.target.selectionDirection;
                } catch(e) {
                    console.log('There is not selection API');
                }
                var new_value = this.value.replace(/(^[a-z])|\s([a-z])/g, function(m, g1, g2){
                    return g1 ? g1.toUpperCase() : ' ' + g2.toUpperCase();
                });
                this.value = new_value;

                // bug #18410: "Web Orders: double customer name is displayed for the order on iPad if enter the first name with the space"
                var isGapsLeft = false;
                if (new_value.charCodeAt(0) == 32) { // if gaps at the beginning of the line then save length of line
                    isGapsLeft = true;
                    var lWithoutTrim = new_value.length;
                }
                if ( ~this.className.indexOf('first_name') ) {
                    self.model.set('firstName', new_value);
                    new_value = self.model.get('firstName'); // get a new value that it was trimmed at model
                } else {
                    self.model.set('secondName', new_value);
                    new_value = self.model.get('secondName'); // get a new value that it was trimmed at model
                }
                if (isGapsLeft) {
                    var lWithTrim = new_value.length,
                        offset = lWithoutTrim - lWithTrim;
                    start -= offset, end -= offset;
                }

                try {
                    event.target.setSelectionRange(start, end, direction);
                } catch(e) {}
            });
        },
        events: {
            'blur .first_name': 'changeFirstName',
            'blur .last_name': 'changeLastName',
        },
        /**
         * Change the firstName property of model.
         *
         * @param {object} e Event object.
         */
        changeFirstName: function(e) {
            this.model.set('firstName', e.target.value);
        },
        /**
         * Change the secondName property of model.
         *
         * @param {object} e Event object.
         */
        changeLastName: function(e) {
            this.model.set('secondName', e.target.value);
        },
        setData: function() {
            var data = {
                    firstName: this.$('.first_name').val(),
                    secondName: this.$('.last_name').val(),
                    cardNumber: this.$('.number').val(),
                    securityCode: this.$('.secure').val(),
                    expMonth: this.$('#exp-month').val(),
                    expDate: this.$('#exp-year').val(),
                    street: this.$('.address').val(),
                    city: this.$('.city').val(),
                    state: this.$('.state').val(),
                    zip: this.$('.zip').val()
                };
            this.model.set(data);
        },
        /**
         * Update first name & last name of view.
         */
        updateData: function() {
            this.$('.first_name').val(this.model.get('firstName'));
            this.$('.last_name').val(this.model.get('secondName'));
        }
    });

    return new (require('factory'))(function() {
        App.Views.CardView = {};
        App.Views.CardView.CardMainView = App.Views.CoreCardView.CoreCardMainView;
    });
});