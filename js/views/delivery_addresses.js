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
            var locale = App.Data.locale,
                model = _.extend({}, this.options.customer.toJSON()),
                defaultAddress = App.Settings.address,
                address = this.getAddress();

            model.country = address ? address.country : defaultAddress.country;
            model.state = model.country == 'US' ? (address ? address.state : defaultAddress.state) : null;
            model.province = model.country == 'CA' ? (address ? address.province : '') : null;
            model.originalState = model.state;
            model.states = locale.get('CORE')['STATES'];
            model.street_1 = address ? address.street_1 : '';
            model.street_2 = address ? address.street_2 : '';
            model.city = address ? address.city : '';
            model.zipcode = address ? address.zipcode : '';
            model.countries = locale.get('CORE')['COUNTRIES'];

            this.model = model;

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.updateAddress();
        },
        getAddress: function() {
            var customer = this.options.customer.toJSON(),
                lastIndex = customer.addresses.length - 1;

            // return last address
            return customer.addresses.length && typeof customer.addresses[lastIndex].street_1 === 'string' ? customer.addresses[lastIndex] : undefined;
        },
        events: {
            'change select.country': 'countryChange',
            'change select.states': 'changeState',
            'change .shipping-select': 'changeShipping',
            'focus input[name]': 'focus',
            'blur input[name]': 'blur'
        },
        focus: function(event){
            var name = event.target.name,
                prev = null,
                format = 'format' + name,
                listen = 'listen' + name;
            this[format] = function() {
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
            };
            this[listen] = setInterval(this[format], 50);
        },
        blur: function(event){
            var name = event.target.name,
                format = 'format' + name,
                listen = 'listen' + name;
            clearInterval(this['listen' + name]);
            delete this[format];
            delete this[listen];
            this.onChangeElem(event);
        },
        onChangeElem: function(e) {
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
                model = this.model,
                address;

            address = {
                street_1: model.street_1,
                street_2: model.street_2,
                city: model.city,
                state: model.state,
                province: model.province,
                zipcode: model.zipcode,
                country: model.country
            };

            var addresses = customer.get('addresses');

            if (addresses.length === 0 || typeof addresses[addresses.length - 1].street_1 !== 'string') {
                addresses.push(address);
            } else if (shipping_address === -1) {
                addresses[addresses.length - 1] = address;
            }

            addresses[addresses.length - 1].address = customer.address_str();
        }
    });

    var DeliveryAddressesView = AddressView.extend({
        initialize: function() {
            this.isShippingServices = App.skin == App.Skins.RETAIL;

            if (this.isShippingServices)
                this.listenTo(this.options.customer, 'change:shipping_services', this.updateShippingServices, this);

            App.Views.AddressView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
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
                var name = shipping_services[index].class_of_service + " (" + App.Settings.currency_symbol +
                           parseFloat(shipping_services[index].shipping_charge).toFixed(2) +")";
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

            this.changeShipping({currentTarget: shipping.get(0), shipping_status: shipping_status});
        },
        countryChange: function(e) {
            App.Views.AddressView.prototype.countryChange.apply(this, arguments);
            this.options.customer.set('load_shipping_status', '');
        },
        changeShipping: function(e) {
            var price, name,
                value = parseInt(e.currentTarget.value),
                myorder = App.Data.myorder,
                checkout = myorder.checkout,
                oldValue = this.options.customer.get("shipping_selected");

            this.options.customer.set('shipping_selected', value);
            if (value >= 0) {
                price = parseFloat(this.options.customer.get("shipping_services")[value].shipping_charge).toFixed(2) * 1;
                name = this.options.customer.get("shipping_services")[value].class_of_service;
            }
            else {
                price = 0;
                name = MSG.DELIVERY_ITEM;
            }

            myorder.change_dining_option(checkout, checkout.get("dining_option"));
            if (e.shipping_status != "pending") {
                myorder.total.set_delivery_charge(price/*, {silent: App.Data.updateDiscountsStatus == "pending" }*/);
                myorder.deliveryItem.get("product").set({"price": price, "name": name});
            }
        },
        updateAddress: function() {
            App.Views.AddressView.prototype.updateAddress.apply(this, arguments);
            var model = this.model;
            if (this.isShippingServices && model.street_1 && model.city && model.country && model.zipcode
                && (model.country == 'US' ? model.state : true) && (model.country == 'CA' ? model.province : true)) {
                this.options.customer.get_shipping_services();
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