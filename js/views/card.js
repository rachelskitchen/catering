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

    var years = (function() {
        var arr= [];
        for(var i = (new Date).getFullYear(), l = i + 21; i <= l; i++) {
            arr.push(i);
        }
        return arr;
    })();

    App.Views.CoreCardView = {};

    App.Views.CoreCardView.CoreCardMainView = App.Views.FactoryView.extend({
        name: 'card',
        mod: 'main',
        bindings: {
            '.first_name': 'value: firstLetterToUpperCase(firstName), events: ["input"], trackCaretPosition: firstName',
            '.last_name': 'value: firstLetterToUpperCase(secondName), events: ["input"], trackCaretPosition: secondName',
            '.number': 'value: cardNumber, events: ["input"], restrictInput: "0123456789", pattern: /^[\\d|-]{0,19}$/',
            '.secure': 'value: securityCode, events: ["input"], restrictInput: "0123456789", kbdSwitcher: "numeric", pattern: /^[\\d|-]{0,4}$/',
            '.card-expiration-month': 'value: expMonth',
            '.card-expiration-year': 'value: expDate, options: years'
        },
        computeds: {
            years: function() {
                return years;
            }
        },
        render: function() {
            var self = this,
                model = {},
                cardNumber, securityCode;
            model.isFirefox = /firefox/i.test(navigator.userAgent);

            this.$el.html(this.template(model));

            /**
             * Hack for bug: https://code.google.com/p/android/issues/detail?id=24626.
             * Bug of Revel Systems: http://bugzilla.revelup.com/bugzilla/show_bug.cgi?id=5368.
             */
            cardNumber = this.$('.number');
            securityCode = this.$('.secure');

            if (cssua.userAgent.mobile) {
                if (cssua.userAgent.android) {
                    // checking version OS Android (old version is Android <= 4.2.1)
                    if (check_android_old_version(cssua.userAgent.android)) {
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
            }

            return this;
        }
    });

    return new (require('factory'))(function() {
        App.Views.CardView = {};
        App.Views.CardView.CardMainView = App.Views.CoreCardView.CoreCardMainView;
    });
});