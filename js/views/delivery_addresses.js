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
            var model = _.extend({}, this.options.customer.toJSON()),
                defaultAddress = App.Settings.address,
                address = this.getAddress();

            model.country = address && address.country ? address.country : defaultAddress.country;
            model.state = model.country == 'US' ? (address ? address.state : defaultAddress.state) : null;
            model.province = model.country == 'CA' ? (address ? address.province : '') : null;
            model.originalState = model.state;
            model.states = _loc['STATES'];
            model.street_1 = address ? address.street_1 : '';
            model.street_2 = address ? address.street_2 : '';
            model.city = address ? address.city : '';
            model.zipcode = address ? address.zipcode : '';
            model.countries = _loc['COUNTRIES'];

            this.model = model;

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.updateAddress();
        },
        getAddress: function() {
            var customer = this.options.customer.toJSON(),
                shipping_address = customer.shipping_address;

            // if shipping address isn't selected take last index
            if(this.options.customer.isDefaultShippingAddress()) {
                shipping_address = customer.addresses.length - 1;
            } else {
                var reverse_addr_index = shipping_address == customer.deliveryAddressIndex ? customer.shippingAddressIndex : customer.deliveryAddressIndex;
                var addr = customer.addresses[shipping_address];
                var reverse_addr = customer.addresses[reverse_addr_index];
                addr == undefined && (addr = {});
                if (reverse_addr) {
                    if ((addr.country && reverse_addr.country && addr.country == reverse_addr.country) ||
                        (!addr.country && reverse_addr.country == App.Settings.address.country)) { //if country was changed that we can't copy address
                        if (!addr.province && !addr.street_1 && !addr.street_2 && !addr.city && !addr.zipcode) { //and we will copy address if all target fields are empty only
                            return _.extend(addr, { state: reverse_addr.state,
                                                    province: reverse_addr.province,
                                                    street_1: reverse_addr.street_1,
                                                    street_2: reverse_addr.street_2,
                                                    city: reverse_addr.city,
                                                    zipcode: reverse_addr.zipcode });
                        }
                    }
                }
            }

            // return last address
            return customer.addresses[shipping_address] && typeof customer.addresses[shipping_address].street_1 === 'string' ? customer.addresses[shipping_address] : undefined;
        },
        bindings: {
            'input[name=zipcode]': 'restrictInput: "0123456789", kbdSwitcher: "numeric", pattern: /^(\\d{0,9})$/'
        },
        computeds: {
            zipcodeValue: {
                deps: ['customer_shippingAddressIndex', 'customer_deliveryAddressIndex', 'customer_addresses'],
                get: function(customer_shippingAddressIndex, customer_deliveryAddressIndex, customer_addresses) {
                    if (customer_addresses.length > 0) {
                        var addr_index = customer_deliveryAddressIndex;
                        if (this.options.checkout.get('dining_option')  === 'DINING_OPTION_SHIPPING') {
                            addr_index = customer_shippingAddressIndex;
                        }
                        return _.isUndefined(customer_addresses[addr_index]) ? "" : customer_addresses[addr_index].zipcode;
                    }
                    return "";
                }
            }
        },
        events: {
            'change select.country': 'countryChange',
            'change select.states': 'changeState',
            'change .shipping-select': 'changeShipping',
            'input input[name]': 'input',
            'blur input[name]': 'change',
            'change input[name]': 'change'
        },
        input: function(event){
            var name = event.target.name,
                prev = null;
            if(event.target.value === prev)
                return;
            try {
                var start = event.target.selectionStart,
                    end = event.target.selectionEnd,
                    direction = event.target.selectionDirection;
            } catch(e) {
                console.log('There is not selection API');
            }
            event.target.value = fistLetterToUpperCase(event.target.value);
            prev = event.target.value;
            try {
                event.target.setSelectionRange(start, end, direction);
            } catch(e) {}
        },
        change: function(e) {
            e.target.value = fistLetterToUpperCase(e.target.value).trim();
            if (this.model[e.target.name] != e.target.value) {
                this.model[e.target.name] = e.target.value;
                this.updateAddress();
            }
        },
        countryChange: function(e) {
            this.model.country = e.target.value;

            if (this.model.country == 'US') {
                if (typeof this.model.originalState == 'string' && this.model.originalState.length > 0)
                    this.model.state = this.model.originalState;
                else {
                    this.model.state = this.model.originalState = "CA";
                }
            }
            else {
                this.model.state = undefined;
            }

            this.model.province = this.model.country == 'CA' ? "" : undefined;
            this.render(); // need to hide state if this is neccessary
            this.updateAddress();
        },
        changeState: function(e) {
            this.model.state = this.model.originalState = e.target.value;
            this.updateAddress();
        },
        updateAddress: function() {
            var customer = this.options.customer,
                shipping_address = customer.get('shipping_address'),
                addresses = customer.get('addresses'),
                model = this.model,
                address;

            // if shipping_address isn't selected take last index
            if(customer.isDefaultShippingAddress()) {
                shipping_address = addresses.length ? addresses.length - 1 : 0;
            }

            address = {
                street_1: model.street_1,
                street_2: model.street_2,
                city: model.city,
                state: model.state,
                province: model.province,
                zipcode: model.zipcode,
                country: model.country
            };

            addresses[shipping_address] = address;
            addresses[shipping_address].address = customer.address_str(shipping_address);
        }
    });

    var DeliveryAddressesView = AddressView.extend({
        initialize: function() {
            this.isShippingServices = this.options.checkout && this.options.checkout.get('dining_option') === 'DINING_OPTION_SHIPPING';

            if (this.isShippingServices)
                this.listenTo(this.options.customer, 'change:shipping_services', this.updateShippingServices, this);

            App.Views.AddressView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.model.isShippingServices = this.isShippingServices;

            App.Views.AddressView.prototype.render.apply(this, arguments);

            if (this.isShippingServices)
                this.updateShippingServices();

            return this;
        },
        updateShippingServices: function(){
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
            var model = this.model;
            if (this.isShippingServices && model.street_1 && model.city && model.country && model.zipcode
                && (model.country == 'US' ? model.state : true) && (model.country == 'CA' ? model.province : true)) {
                // need to reset shipping services before updating them
                // due to server needs a no shipping service specified to return a new set of shipping services.
                this.options.customer.resetShippingServices();
                App.Data.myorder.update_cart_totals({update_shipping_options: true});
            }
        }
    });

    function getInitialAddresses(i) {
        return !i.street_1;
    }

    return new (require('factory'))(function() {
        App.Views.AddressView = AddressView;
        App.Views.DeliveryAddressesView = DeliveryAddressesView;
    });
});