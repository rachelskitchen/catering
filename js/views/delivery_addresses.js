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

define(['backbone', 'factory'], function(Backbone) {
    'use strict';

    /*
        receives instance of App.Models.Customer constructor in options,
        creates model using address data from customer.addresses array,
        updates address in customer.addresses array
     */
    var AddressView = App.Views.FactoryView.extend({
        initialize: function() {
            var dfd = this.options.customer.addressesRequest || new Backbone.$.Deferred().resolve(),
                self = this;

            // wait until customer addresses are loaded
            dfd.always(function() {
                self.initModel();
                App.Views.FactoryView.prototype.initialize.apply(self, arguments);
                self.updateAddress();
                self.listenTo(App.Data.customer, 'change:access_token', self.updateAddress);
            });
        },
        initModel: function() {
            var model = {},
                customer = this.options.customer,
                addresses = customer.get('addresses'),
                checkout = this.options.checkout,
                dining_option = checkout.get('dining_option'),
                defaultAddress = App.Settings.address,
                address;

            if (!customer.isAuthorized() || !addresses.isProfileAddressSelected()) { // do not touch profile addresses
                address = addresses.getCheckoutAddress(dining_option);
                model = _.extend(model, customer.toJSON());
            }
            if (customer.isAuthorized()) {
                // use only not fully filled address from profile to populate address fields
                var fullyFilledAddresses = customer.get('addresses').filter(function(addr) {
                    addr = addr.toJSON();
                    return addr && addr.street_1 && addr.city && addr.country && addr.zipcode
                        && (checkout.get('dining_option') == 'DINING_OPTION_DELIVERY' ? addr.country == App.Settings.address.country : true)
                        && (addr.country == 'US' ? addr.state : true) && (addr.country == 'CA' ? addr.province : true);
                });
                if (!fullyFilledAddresses.length) {
                    address = addresses.getCheckoutAddress(dining_option, true);
                    model = _.extend(model, customer.toJSON());
                }
            }

            model.country = address && address.country ? address.country : defaultAddress.country;
            model.state = model.country == 'US' ? (address ? address.state : defaultAddress.state) : null;
            model.province = model.country == 'CA' ? (address ? address.province : '') : null;
            model.originalState = model.state;
            model.states = sort_i18nObject(_loc['STATES']);
            model.countries = sort_i18nObject(_loc['COUNTRIES']);
            model.street_1 = address ? address.street_1 : '';
            model.street_2 = address ? address.street_2 : '';
            model.city = address ? address.city : '';
            model.zipcode = address ? address.zipcode : '';

            this.model = new Backbone.Model(model);
            this.prevValues = model;
        },
        bindings: {
            'input[name="street_1"]': 'value: firstLetterToUpperCase(street_1), events: ["input"], trackCaretPosition: street_1',
            'input[name="street_2"]': 'value: firstLetterToUpperCase(street_2), events: ["input"], trackCaretPosition: street_2',
            'input[name="city"]': 'value: firstLetterToUpperCase(city), events: ["input"], trackCaretPosition: city',
            'input[name="province"]': 'value: firstLetterToUpperCase(province), events: ["input"], trackCaretPosition: province',
            'input[name=zipcode]': 'value: zipcode, pattern: /^((\\w|\\s){0,20})$/', // all requirements are in Bug 33655
            '.zip-label-text': 'text: select(equal(country, "US"), _lp_PROFILE_ZIP_CODE, _lp_PROFILE_POSTAL_CODE)'
        },
        events: {
            'change select.country': 'countryChange',
            'change select.states': 'changeState',
            'change .shipping-select': 'changeShipping',
            'blur input[name]': 'change',
            'change input[name]': 'change'
        },
        change: function(e) {
            e.target.value = e.target.value.trim();
            if (this.prevValues[e.target.name] != e.target.value) {
                this.prevValues[e.target.name] = e.target.value;
                this.updateAddress();
            }
        },
        countryChange: function(e) {
            var model = this.model.toJSON();
            model.country = e.target.value;

            if (model.country == 'US') {
                if (typeof model.originalState == 'string' && model.originalState.length > 0)
                    model.state = model.originalState;
                else {
                    model.state = model.originalState = 'CA';
                }
            }
            else {
                model.state = undefined;
            }

            model.province = model.country == 'CA' ? '' : undefined;

            this.model.set(model);
            this.render(); // need to hide state if this is neccessary

            this.updateAddress();
        },
        changeState: function(e) {
            this.model.set({'state': e.target.value, 'originalState': e.target.value});
            this.updateAddress();
        },
        updateAddress: function() {
            var customer = this.options.customer,
                shipping_address = customer.get('shipping_address'),
                addresses = customer.get('addresses'),
                model = this.model.toJSON(),
                updatedAddressObj,
                selectedAddress = addresses.getSelectedAddress();

            // do not change profile addresses
            if (selectedAddress && selectedAddress.isProfileAddress()) {
                selectedAddress.set('address', selectedAddress.toString());
                return;
            }

            // if shipping_address isn't selected
            if (!selectedAddress) {
                var dining_option = this.options.checkout.get('dining_option');
                selectedAddress = addresses.get(dining_option);
                if (!selectedAddress) {
                    // create the empty address for the selected dining option
                    selectedAddress = new App.Models.CustomerAddress({id: dining_option, selected: true});
                    addresses.add(selectedAddress);
                }
            }

            updatedAddressObj = {
                street_1: model.street_1,
                street_2: model.street_2,
                city: model.city,
                state: model.state,
                province: model.province,
                zipcode: model.zipcode,
                country: model.country
            };
            updatedAddressObj.address = selectedAddress.toString(updatedAddressObj);

            selectedAddress.set(updatedAddressObj);
        }
    });

    var DeliveryAddressesView = AddressView.extend({
        initialize: function() {
            this.isShippingServices = this.options.checkout && this.options.checkout.get('dining_option') === 'DINING_OPTION_SHIPPING';

            if (this.isShippingServices)
                this.listenTo(this.options.customer, 'change:shipping_services', this.updateShippingServices, this);

            App.Views.AddressView.prototype.initialize.apply(this, arguments);

            this.toggleAddressEdit();
            this.listenTo(this.options.customer.get('addresses'), 'change:selected', this.toggleAddressEdit);
        },
        bindings: {
            '.address-selection': 'toggle: showAddressSelection',
            '.shipping-services': 'toggle: equal(checkout_dining_option, "DINING_OPTION_SHIPPING")'
        },
        events: {
            'change #addresses': 'updateAddress'
        },
        computeds: {
            /**
             * Indicates whether the user is logged in.
             */
            isAuthorized: {
                deps: ['customer_access_token'],
                get: function() {
                    return this.options.customer.isAuthorized();
                }
            },
            /**
             * Indicates whether the address selection drop-down list should be shown.
             */
            showAddressSelection: {
                deps: ['isAuthorized', 'customer_addresses', 'checkout_dining_option'],
                get: function(isAuthorized, customer_addresses, checkout_dining_option) {
                    return isAuthorized && customer_addresses.filter(function(addr) {
                        var address = addr.toJSON();
                        return addr.isProfileAddress() && address.street_1 && address.city && address.country && address.zipcode
                            && (checkout_dining_option == 'DINING_OPTION_DELIVERY' ? address.country == App.Settings.address.country : true)
                            && (address.country == 'US' ? address.state : true) && (address.country == 'CA' ? address.province : true);
                    }).length;
                }
            },
        },
        render: function() {
            this.model.set('isShippingServices', this.isShippingServices);

            App.Views.AddressView.prototype.render.apply(this, arguments);

            if (this.isShippingServices)
                this.updateShippingServices();

            return this;
        },
        updateShippingServices: function() {
            var customer = this.options.customer,
                shipping_services = customer.get("shipping_services"),
                shipping_status = customer.get("load_shipping_status");

            var shipping = this.$('.shipping-select').empty(),
                selectWrapper = shipping.parents('.select-wrapper');
            if (!shipping_status || shipping_status == "pending") {
                shipping_services = [];
                customer.set("shipping_selected", -1);
            } else {
                if (shipping_services.length && customer.get("shipping_selected") < 0)
                    customer.set("shipping_selected", 0);
            }

            for (var index in shipping_services) {
                var name = shipping_services[index].service_name + " (" + App.Settings.currency_symbol +
                           parseFloat(shipping_services[index].shipping_and_handling_charge).toFixed(2) +")";
                shipping.append('<option value="' + index + '" ' + (customer.get('shipping_selected') == index ? 'selected="selected"' : '') + '>' + name + '</option>');
            };

            shipping.removeAttr("data-status");
            if (!shipping_status || shipping_status == "pending" || shipping_services.length == 0) {
                shipping.attr("disabled", "disabled");
                shipping.attr("data-status", "pending");
                selectWrapper.addClass('disabled');
            }
            else {
                shipping.removeAttr("disabled");
                selectWrapper.removeClass('disabled');
            }

            if (shipping_status && shipping_status != "pending" && shipping_services.length == 0) {
                shipping.append('<option value="-1">' + MSG.ERROR_SHIPPING_SERVICES_NOT_FOUND + '</option>');
                shipping.attr("data-status", "error");
            }

            if (!shipping_status) {
                shipping.append('<option value="-1">' + MSG.SHIPPING_SERVICES_SET_ADDRESS + '</option>');
            }

            this.$(".shipping-status").html("");
            if (shipping_status == "pending") {
                shipping.append('<option value="-1">' + MSG.SHIPPING_SERVICES_RETRIVE_IN_PROGRESS + '</option>');
                this.$(".shipping-status").spinner();
            }
        },
        countryChange: function(e) {
            App.Views.AddressView.prototype.countryChange.apply(this, arguments);
            this.options.customer.resetShippingServices();
        },
        changeShipping: function(e) {
            var shipping = {}, name,
                value = parseInt(e.currentTarget.value),
                myorder = App.Data.myorder,
                checkout = myorder.checkout;

            this.options.customer.set('shipping_selected', value);
            if (value >= 0) {
                shipping = this.options.customer.get("shipping_services")[value];
                myorder.total.set('shipping', shipping.shipping_and_handling_charge);
            }

            if (e.shipping_status != "pending" && !isNaN(value) && value != this.options.customer.defaults.shipping_selected) {
                myorder.update_cart_totals();
            }
        },
        updateAddress: function() {
            App.Views.AddressView.prototype.updateAddress.apply(this, arguments);
            var dining_option = this.options.checkout.get('dining_option'),
                model = this.options.customer.get('addresses').getCheckoutAddress(dining_option);
            // need to reset shipping services before updating them
            // due to server needs a no shipping service specified to return a new set of shipping services.
            this.options.customer.resetShippingServices();
            this.isShippingServices = this.options.checkout && this.options.checkout.get('dining_option') === 'DINING_OPTION_SHIPPING';
            if (this.isShippingServices && model.street_1 && model.city && model.country && model.zipcode
                && (model.country == 'US' ? model.state : true) && (model.country == 'CA' ? model.province : true)) {
                App.Data.myorder.update_cart_totals({update_shipping_options: true});
            }
        },
        toggleAddressEdit: function() {
            var show = !this.getBinding('isAuthorized') || !this.getBinding('customer_addresses').isProfileAddressSelected() || !this.getBinding('showAddressSelection');
            this.$('.address-edit').toggle(show);
        }
    });

    var DeliveryAddressesSelectionView = App.Views.FactoryView.extend({
        initialize: function() {
            this.listenTo(this.options.customer, 'change:access_token', function(customer, value) {
                if (!value) {
                    return this.$('#addresses').html('');
                }
                delete this.options.address_index;
                this.updateAddressesOptions();
            });
            this.listenTo(this.options.customer.get('addresses'), 'reset add remove', function() {
                this.updateAddressesOptions();
            });

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            ':el': 'toggle: showAddressSelection', // wrapper of the address selection drop-down
            '#addresses': 'value: selectedAddressId', // the address selection drop-down
        },
        bindingSources: _.extend({}, DeliveryAddressesView.prototype.bindingSources),
        computeds: _.extend({}, DeliveryAddressesView.prototype.computeds, {
            selectedAddressId: {
                deps: ['customer_addresses'],
                get: function(customer_addresses) {
                    var selectedAddr = customer_addresses.getSelectedAddress();
                    // set -1 if no address is selected or if selected address is not from profile
                    // value -1 corresponds the 'Enter new address' option
                    if (selectedAddr && !isNaN(selectedAddr.get('id'))) {
                        return selectedAddr.get('id');
                    }
                    return -1;
                }
            }
        }),
        events: {
            'change #addresses': 'changeSelection'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            this.updateAddressesOptions();

            return this;
        },
        resetShippingServices: function() {
            this.options.customer.resetShippingServices();
        },
        changeSelection: function(e) {
            var value = Number(e.target.value),
                addresses = this.getBinding('customer_addresses'),
                addressId = value != -1 ? value : this.getBinding('checkout_dining_option'),
                addr = addresses.get(addressId);
            if (!addr) {
                addr = new App.Models.CustomerAddress({id: addressId});
            }
            addr && addr.set('selected', true);
        },
        /**
         * Rendering of 'Address' drop-down list.
         */
        updateAddressesOptions: function() {
            var customer = this.options.customer,
                checkout = this.options.checkout,
                dining_option = checkout.get('dining_option');

            if (!customer.isAuthorized()) {
                return;
            }

            var addresses = customer.get('addresses'),
                address,
                optionsStr = '',
                options = addresses.map(function(addr) {
                    address = addr.toJSON();
                    if (addr.isProfileAddress() && address.street_1) {
                        return address && address.street_1 && address.city && address.country && address.zipcode
                            && (dining_option == 'DINING_OPTION_DELIVERY' ? address.country == App.Settings.address.country : true)
                            && (address.country == 'US' ? address.state : true) && (address.country == 'CA' ? address.province : true)
                            ? {label: address.street_1, value: address.id} : undefined;
                    }
                    else {
                        return undefined;
                    }
                }).filter(function(addr) {
                    return addr;
                });

            if (options.length) {
                optionsStr = _.reduce(options, function(memo, option) {
                    return memo + '<option value="' + option.value + '">' + option.label + '</option>';
                }, '');
                optionsStr += '<option value="-1">' + _loc.ENTER_NEW_ADDRESS + '</option>';

                this.$('#addresses').html(optionsStr);

                if (this.options.address_index == -1) { // default profile address should be selected
                    var addr = addresses.get(options[0].value);
                    addr && addr.set('selected', true);
                    delete this.options.address_index;
                }
                else {
                    this.$('#addresses').val(-1);
                }
            }
        },
        /**
         * Updates value of 'Enter New Address' option.
         */
        updateNewAddressIndex: function() {
            var checkout = this.options.checkout,
                customer = this.options.customer,
                newValue = App.Data.myorder.getShippingAddress(checkout.get('dining_option'));

            this.$('#addresses option').filter(function(i, el) {
                return $(el).val() < 3;
            }).val(newValue);

            if (customer.get('shipping_address') < 3) {
                this.$('#addresses').val(newValue);
            }
        }
    });

    function getInitialAddresses(i) {
        return !i.street_1;
    }

    return new (require('factory'))(function() {
        App.Views.AddressView = AddressView;
        App.Views.DeliveryAddressesView = DeliveryAddressesView;
        App.Views.DeliveryAddressesSelectionView = DeliveryAddressesSelectionView;
    });
});