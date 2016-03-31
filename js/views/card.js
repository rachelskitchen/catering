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
            '.secure': 'value: securityCode, events: ["input"], restrictInput: "0123456789", pattern: /^[\\d|-]{0,4}$/',
            '.card-expiration-month': 'value: expMonth',
            '.card-expiration-year': 'value: expDate, options: years',
            '#saveCard': 'checked: saveCard'
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

    App.Views.CoreCardView.CoreCardBillingAddressView = App.Views.FactoryView.extend({
        name: 'card',
        mod: 'billing_address',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.update_use_profile_address(this.model.get('use_profile_address'));

            var model = this.options.customer.toJSON(),
                        defaultAddress = App.Settings.address,
                        address = this.options.customer.getCheckoutAddress();
            var country = address && address.country ? address.country : defaultAddress.country;
            var state = country == 'US' ? (model.address ? address.state : defaultAddress.state) : null;
            if (!this.model.get('country_code')) {
                this.options.address.set('country_code', country);
            }
            if (!this.model.get('state')) {
                this.options.address.set('state', state);
            }
        },
        start: function() {
           this.options.customer.trigger("change:addresses");
        },
        events: {
            'click #use_profile_address': 'change',
        },
        bindings: {
            "#use_profile_address":"classes:{hide:hide_profile_address}",
            "#use_profile_address .title":"text:use_profile_address_title,classes:{inactive:not(use_profile_address)}",
            ".checkbox":"classes:{checked:use_profile_address,unchecked:not(use_profile_address)}",
            ".address input":"attr:{disabled:select(use_profile_address,'disabled',false)}",
            ".address":"classes:{inactive:use_profile_address}",
            ".address select":"attr:{disabled:select(use_profile_address,'disabled',false)}",
            ".address select.states": "value: state, options: states",
            ".address select.countries": "value: country_code, options: countries",
            ".address .city": "value: address_city",
            ".address .street_1": "value: address_street_1",
            ".address .zipcode": "value: address_zipcode",
            "label[for=zipcode] span": "text: zipcode_label",
            ".states-wrap": "classes:{hide:hide_states}"
        },
        computeds: {
            hide_states: {
                deps: ["address_country_code"],
                get: function(country_code) {
                    return !(country_code == "US");
                }
            },
            zipcode_label: {
                deps: ["address_country_code"],
                get: function(country_code) {
                    return (country_code == "US" ? _loc.PROFILE_ZIP_CODE : _loc.PROFILE_POSTAL_CODE) + ":";
                }
            },
            use_profile_address_title: {
                deps: ["customer_addresses"],
                get: function() {
                    var customer = this.options.customer;
                    var addr = customer.getProfileAddress();
                    if (!customer.isAuthorized() || !addr) {
                        return "";
                    }
                    var addr_str = [addr.street_1,addr.city,addr.state,addr.country,addr.zipcode].join(", ");
                    return _loc.USE_PROFILE_ADDRESS_TITLE_1 + ' \"' + addr_str + '\"';
                }
            },
            hide_profile_address: {
                deps: ["customer_addresses"],
                get: function() {
                    var customer = this.options.customer;
                    var addr = customer.getProfileAddress();
                    if (!customer.isAuthorized() || !addr || !addr.city || !addr.country_code || !addr.street_1 || !addr.zipcode)
                        return true;
                    else
                        return false;
                }
            },
            states: function() {
                return sort_i18nObject(_loc['STATES']);
            },
            state: {
                deps: ["address_state"],
                set: function(state) {
                    var key = _.findKey(_loc['STATES'], function(value) { return value == state; } );
                    this.options.address.set('state', key);
                },
                get: function() {
                    var state = this.options.address.get("state");
                    return state ? _loc['STATES'][state] : null;
                }
            },
            countries: function() {
                return sort_i18nObject(_loc['COUNTRIES']);
            },
            country_code: {
                deps: ["address_country_code"],
                set: function(country) {
                    var key = _.findKey(_loc['COUNTRIES'], function(value) { return value == country; } );
                    this.options.address.set('country_code', key);
                },
                get: function() {
                    var country_code = this.options.address.get("country_code");
                    return country_code ? _loc['COUNTRIES'][country_code] : null;
                }
            },
        },
        change: function(event){
            event.stopImmediatePropagation();
            event.preventDefault();
            var el = this.$(".checkbox"),
                checked = el.attr('checked') == "checked" ? false : true;
            this.update_use_profile_address(checked);
        },
        update_use_profile_address: function(checked) {
            this.model.set('use_profile_address', checked);
            this.$('.checkbox').attr('checked', checked ? 'checked' : false);
        }
    });

    return new (require('factory'))(function() {
        App.Views.CardView = {};
        App.Views.CardView.CardMainView = App.Views.CoreCardView.CoreCardMainView;
        App.Views.CardView.CardBillingAddressView = App.Views.CoreCardView.CoreCardBillingAddressView;
    });
});