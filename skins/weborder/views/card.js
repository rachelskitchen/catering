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

define(["card_view"], function(card_view) {
    'use strict';

    var checkoutAddress = 1,
        profileAddress = 2,
        newAddress = -1;

    var CardMainView = App.Views.CoreCardView.CoreCardMainView.extend({
    	bindings: {
    		'.checkbox-outer': 'classes: {hide: not(token_paymentsExist)}',
    		'.checkbox': "checkedSpan: {value: rememberCard, outer_elem: '.checkbox-outer'}",
            '.dialog-input': 'classes: {hide: not(paymentMethods_credit_card_dialog)}'
    	}
    });

    var CardBillingAddressView = App.Views.FactoryView.extend({
        name: 'card',
        mod: 'billing_address',
        initialize: function() {
            // set default country for new address
            this.setDefaultCountry();
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.countries': 'value: country_code, options: countries',
            '.states': 'value: state, options: states',
            '.states-wrap': 'classes: {hide: not(equal(country_code, "US"))}',
            '.addresses': 'value: selectedAddress, options: addresses',
            '.zip-code-label': 'text: select(equal(country_code, "US"), _lp_PROFILE_ZIP_CODE, _lp_PROFILE_POSTAL_CODE)',
            '.new-address': 'classes: {hide: hideNewAddress}',
            '.street_1': 'value: street_1, events: ["input"]',
            '.city': 'value: city, events: ["input"]',
            '.zipcode': 'value: zipcode, events: ["input"]'
        },
        computeds: {
            hideNewAddress: function() {
                return this.getBinding('selectedAddress') != newAddress;
            },
            selectedAddress: {
                get: function() {
                    var card = this.getBinding('$card');
                    if (card.get('use_profile_address')) {
                        return profileAddress;
                    } else if (card.get('use_checkout_address')) {
                        return checkoutAddress
                    } else {
                        return newAddress;
                    }
                },
                set: function(value) {
                    var card = this.getBinding('$card');
                    card.set({
                        use_profile_address: value == profileAddress,
                        use_checkout_address: value == checkoutAddress
                    });
                }
            },
            addresses: {
                deps: ['checkout_dining_option', 'customer_shipping_address', 'customer_access_token'],
                get: function(dining_option, shipping_address) {
                    var customer = this.getBinding('$customer'),
                        options = [];
                    if (customer.isAuthorized() && customer.getProfileAddress()) {
                        options.push({
                            label: _loc.CARD_PROFILE_ADDRESS,
                            value: profileAddress
                        });
                    }
                    if (dining_option == 'DINING_OPTION_DELIVERY' && shipping_address == customer.get('deliveryAddressIndex')) {
                        options.push({
                            label: _loc.CARD_DELIVERY_ADDRESS,
                            value: checkoutAddress
                        });
                    }
                    if (dining_option == 'DINING_OPTION_SHIPPING' && shipping_address == customer.get('shippingAddressIndex')) {
                        options.push({
                            label: _loc.CARD_SHIPPING_ADDRESS,
                            value: checkoutAddress
                        });
                    }
                    if (dining_option == 'DINING_OPTION_CATERING' && shipping_address == customer.get('cateringAddressIndex')) {
                        options.push({
                            label: _loc.CARD_CATERING_ADDRESS,
                            value: checkoutAddress
                        });
                    }
                    options.push({
                        label: _loc.CARD_NEW_ADDRESS,
                        value: newAddress
                    });
                    return options;
                }
            },
            countries: function() {
                return sortObj(_loc['COUNTRIES']);
            },
            states: function() {
                return sortObj(_loc['STATES']);
            }
        },
        setDefaultCountry: function() {
            var checkoutAddress = this.options.customer.getCheckoutAddress(),
                storeAddress = App.Settings.address;
            if (_.isObject(checkoutAddress) && checkoutAddress.country) {
                this.model.set('country_code', checkoutAddress.country);
            } else if (_.isObject(storeAddress) && storeAddress.country) {
                this.model.set('country_code', storeAddress.country);
            }
        }
    });

    function sortObj(obj) {
        var sorted = sort_i18nObject(obj),
            result = [];
        for (var key in sorted) {
            result.push({
                label: sorted[key],
                value: key
            });
        }
        return result;
    }

	return new (require('factory'))(card_view.initViews.bind(card_view), function() {
        App.Views.CardView.CardMainView = CardMainView;
        App.Views.CardView.CardBillingAddressView = CardBillingAddressView;
    });
});