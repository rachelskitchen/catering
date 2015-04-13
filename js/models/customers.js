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

define(["backbone", "geopoint"], function(Backbone) {
    'use strict';

    /*
     * @class App.Models.Customer
     * Represents customer's data.
     */
    App.Models.Customer = Backbone.Model.extend({
        /**
         * @property {Object} defaults - the set of model attributes with default values.
         *
         * @property {string} defaults.first_name - customer's first name.
         * @default ''.
         *
         * @property {string} defaults.last_name - customer's last name.
         * @default ''.
         *
         * @property {string} defaults.phone - customer's phone number (string type because may have "+", "." signs).
         * @default ''.
         *
         * @property {string} defaults.email - customer's email.
         * @default ''.
         *
         * @property {string|number} defaults.id - customer's id.
         * @default null.
         *
         * @property {Object[]} defaults.addresses - array of customer's addresses.
         * @default [].
         * @property {string} defaults.addresses[].address - full address line.
         * @property {string} defaults.addresses[].city - city of address.
         * @property {string} defaults.addresses[].country - country of address.
         * @property {string} defaults.addresses[].state - state of address.
         * @property {string} defaults.addresses[].street_1 - address line 1.
         * @property {string} defaults.addresses[].street_2 - address line 2.
         * @property {string} defaults.addresses[].zipcode - zipcode of address (string type because may contains letter symbols, UK for ex.).
         * @property {string} defaults.addresses[].province - province of address (used only if country is CA).
         *
         * @property {number} defaults.shipping_address - index of selected address (index of adresses array).
         * @default -1.
         *
         * @property {Object[]} defaults.shipping_services - array of shipping sevices.
         * @default [].
         * @property {string} defaults.shipping_services[].class_of_service - name of shipping service.
         * @property {string} defaults.shipping_services[].shipping_charge - shipping cost of shipping service.
         *
         * @property {number} defaults.shipping_selected - index of selected shipping service.
         * @default -1.
         *
         * @property {string} defaults.load_shipping_status - status of shipping loading.
         * @default ''.
         *
         * @property {number} defaults.deliveryAddressIndex - index of address used as destination for delivery.
         * @default 0.
         *
         * @property {number} defaults.shippingAddressIndex - index of address used as destination for shipping.
         * @default 1.
         */
        defaults: {
            first_name: "",
            last_name: "",
            phone: "",
            email: "",
            id: null,
            addresses: [],
            shipping_address: -1,
            shipping_services: [],
            shipping_selected: -1,
            load_shipping_status: "",
            deliveryAddressIndex: 0,
            shippingAddressIndex: 1
        },
        /**
         * @constructor
         * Sync with RevelAPI, call setAddressesIndexes() method and set validators for `first_name`, `last_name` attributes.
         */
        initialize: function() {
            this.syncWithRevelAPI();
            this.setAddressesIndexes();
            this.listenTo(this, 'change:first_name', function() {
                var firstName = this.get('first_name');
                (typeof(firstName) == 'string') ?
                    this.set('first_name', Backbone.$.trim(firstName)) :
                    this.set('first_name', this.defaults.first_name);
            }, this);
            this.listenTo(this, 'change:last_name', function() {
                var lastName = this.get('last_name');
                (typeof(lastName) == 'string') ?
                    this.set('last_name', Backbone.$.trim(lastName)) :
                    this.set('last_name', this.defaults.last_name);
            }, this);
        },
        /**
         * @method
         * Get customer name in the format "Smith M.".
         */
        get_customer_name : function() {
            var first_name = this.get('first_name'),
                last_name = this.get('last_name');

            first_name = typeof first_name == 'string' && first_name.length ? first_name : '';
            last_name = typeof last_name == 'string' && last_name.length ? last_name : '';
            last_name = last_name.replace(/(\w).*/, function(m, g) {return ' ' + g + '.';});

            return (first_name + last_name);
        },
        /**
         * @method
         * Save attributes in a storage.
         */
        saveCustomer: function() {
            setData('customer', this);
        },
        /**
         * @method
         * Load attributes from the storage.
         * If a shipping service was selected change `load_shipping_status` on 'restoring' value.
         *
         * @fires change
         * @fires change:<any attribute>
         */
        loadCustomer: function() {
            var data = getData('customer');
            data = data instanceof Object ? data : {};
            this.set(data);
            var shipping_services = this.get("shipping_services");
            if(Array.isArray(shipping_services) && shipping_services.length && this.get("shipping_selected") > -1) {
                this.set("load_shipping_status", "restoring", {silent: true});
            }
        },
        /**
         * @method
         * Save addresses in the storage.
         */
        saveAddresses: function() {
            setData('address', new Backbone.Model({addresses: this.get('addresses')}), true);

        },
        /**
         * @method
         * Load addresses from the storage.
         *
         * @fires change
         * @fires change:addresses
         */
        loadAddresses: function() {
            var data = getData('address', true);
            if (data instanceof Object && Array.isArray(data.addresses) && data.addresses.length == 1 && App.skin != App.Skins.RETAIL) {
                if (data.addresses[0].country != App.Settings.address.country) {
                    //the thread come here e.g. when we navigate from 'Retail' skin with other country payment previously submitted to weborder_mobile skin
                    data = undefined;
                }
            }
            this.set('addresses', data instanceof Object ? (data.addresses || []) : []);
        },
        /**
         * @method
         * Convert address object as full address line.
         *
         * @param {number} index - index of addresses array
         * @default last element.
         * @see {@link http://mediawiki.middlebury.edu/wiki/LIS/Address_Standards} for detail format information.
         * @returns {string} full address line
         */
        address_str: function(index) {
            var addresses = this.get('addresses'),
                settings = App.Settings,
                str = [];

            index = index >= 0 ? index : addresses.length - 1;

            if(Array.isArray(addresses) && addresses.length > 0) {
                addresses = addresses[index];
            } else {
                return '';
            }

            if(!(addresses instanceof Object)) {
                return '';
            }

            addresses.street_1 && str.push(addresses.street_1);
            addresses.street_2 && str.push(addresses.street_2);
            addresses.city && str.push(addresses.city);
            settings.address && settings.address.state && addresses.state && str.push(addresses.state);
            addresses.zipcode && str.push(addresses.zipcode);

            return str.join(', ');
        },
        /**
         * @method
         * Validate address object properties `street_1`, `city`, `state`, `province`, `zipcode` values.
         *
         * @returns {Object[]} empty array if all properties pass validation or array with invalid properties.
         */
        _check_delivery_fields: function() {
            var settings = App.Settings,
                empty = [],
                address = this.get('addresses'),
                req = {
                    street_1: 'Address Line 1',
                    city: 'City',
                    state: 'State',
                    province: 'Province',
                    zipcode: 'Zip Code'
                };

            address = address[address.length -1];

            // if not USA exclude state property
            if(address.country != 'US')
                delete req.state;
            // if not Canada exclude province property
            if(address.country != 'CA')
                delete req.province;

            for(var i in req) {
                !address[i] && empty.push(req[i]);
            }

            return empty;
        },
        /**
         * @method
         * Validate attributes values.
         *
         * @param {string} dining_option - order type selected
         * @returns {Object} {status: "OK"} if all attributes pass validation or {status: "ERROR_EMPTY_FIELDS", errorMsg: <string>, errorList: <array of errors>}.
         */
        check: function(dining_option) {
            var err = [];

            !this.get('first_name') && err.push('First Name');
            !this.get('last_name') && err.push('Last Name');
            !EMAIL_VALIDATION_REGEXP.test(this.get('email')) && err.push('Email');
            !this.get('phone') && err.push('Phone Number');

            if(this.isNewAddressSelected(dining_option)) {
                err = err.concat(this._check_delivery_fields());
            }

            if (err.length) {
                return {
                    status: "ERROR_EMPTY_FIELDS",
                    errorMsg: MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')),
                    errorList: err
                };
            }

            return {
                status: "OK"
            };
        },
        /**
         * @method
         * If `load_shipping_status` attribute is 'restoring' change its value on resolved.
         * Otherwise change `load_shipping_status` on 'pending' and send POST request to "/weborders/shipping_options/" with parameter
         * {
         *     address: <address object>
         *     items: <array of cart items>
         *     establishment: <establishment>
         * }
         * When a response is processed `load_shipping_status` changes on 'resolved'.
         *
         * @fires change:shipping_services
         * @event change:shipping_services
         * @type undefined
         */
        get_shipping_services: function() {
            var self = this,
                data = {},
                address = this.get('addresses'),
                shipping_addr_index = this.isDefaultShippingAddress() ? address.length - 1 : this.get('shipping_address');

            if (!address.length)
                return;

            // restore saved values
            if(this.get("load_shipping_status") == "restoring") {
                return complete();
            }

            data.address = address[shipping_addr_index];
            data.items = [];
            data.establishment = App.Data.settings.get("establishment");
            App.Data.myorder.each(function(model) {
                data.items.push(model.item_submit());
            });

            this.set("shipping_services", [], {silent: true});
            this.set("load_shipping_status", "pending", {silent: true});
            this.trigger("change:shipping_services");

            var data_json = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: App.Data.settings.get("host") + "/weborders/shipping_options/",
                data: data_json,
                dataType: "json",
                success: function(response) {
                    switch (response.status) {
                        case "OK":
                            self.set("shipping_services", response.data, {silent: true});
                            complete();
                            break;
                        default:
                            onError();
                    }
                },
                error: function() {
                    onError();
                },
                complete: function() {
                }
            });

            function onError() {
                setTimeout(complete, 300);
            }

            function complete() {
                self.set("load_shipping_status", "resolved", {silent: true});
                self.trigger("change:shipping_services");
            }
        },
        /**
         * @method
         * Set indexes for delivery and shipping addresses in `addresses` array.
         * If initially addresses is empty array deliveryAddressIndex is 0, shippingAddressIndex is 1
         *
         * @fires change
         * @fires change:deliveryAddressIndex
         * @fires change:shippingAddressIndex
         */
        setAddressesIndexes: function() {
            var addresses = this.get('addresses');
            if(Array.isArray(addresses)) {
                this.set({
                    deliveryAddressIndex: addresses.length,
                    shippingAddressIndex: addresses.length + 1
                });
            }

        },
        /**
         * @method
         * @returns {boolean} true if `shipping_address` is default or false otherwise.
         */
        isDefaultShippingAddress: function() {
            return this.get('shipping_address') === this.defaults.shipping_address;
        },
        /**
         * @method
         * @param {string} dining_option - selected order type.
         * @returns {boolean} true is a new address selected or false if address already exists in DB.
         */
        isNewAddressSelected: function(dining_option) {
            var isDelivery = dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING',
                shipping_address = this.get('shipping_address');
            return (shipping_address == this.get('deliveryAddressIndex') || shipping_address == this.get('shippingAddressIndex')) && isDelivery ? true : false;
        },
        /**
         * @method
         * Fill out RevelAPI.attributes.customer and add listeners for further synchronization with RevelAPI.attributes.customer if RevelAPI.isAvailable() returns true.
         *
         * @member {Object} profileCustomer - value of RevelAPI.get('customer');
         * @member {Object} RevelAPI - value of this.get('RevelAPI');
         *
         * @callback updateProfile
         * Fill out profileCustomer attributes and call RevelAPI.setOriginalProfileData().
         * @listens change:first_name
         * @listens change:last_name
         * @listens change:phone
         * @listens change:email
         *
         * @callback update
         * Set attributes values as profileCustomer attributes values.
         * @listens onProfileSaved [RevelAPI]
         * @listens change [profileCustomer]
         */
        syncWithRevelAPI: function() {
            var RevelAPI = this.get('RevelAPI');

            if(!RevelAPI || !RevelAPI.isAvailable()) {
                return;
            }

            var profileCustomer = RevelAPI.get('customer'),
                profileExists = RevelAPI.get('profileExists'),
                self = this;

            // if profile doesn't exist we should provide autofill out profile page
            !profileExists && RevelAPI.listenTo(this, 'change:first_name change:last_name change:phone change:email', updateProfile);

            // when user saves profile above listener should be unbound and checkout page should be updated
            this.listenTo(RevelAPI, 'onProfileSaved', function() {
                RevelAPI.stopListening(this);
                update();
            }, this);

            // Listen to RevelAPI.attributes.customer changes if user wasn't set any value for one of 'first_name', 'last_name', 'phone', 'email' fields.
            this.listenTo(profileCustomer, 'change', function() {
                if(RevelAPI.get('profileExists') && !this.get('first_name') && !this.get('last_name') && !this.get('phone') && !this.get('email')) {
                    update();
                }
            }, this);

            // fill out current model
            this.set(profileCustomer.toJSON());

            /**
             * @function updateProfile
             * @callback
             * Fill out RevelAPI.attributes.customer and call RevelAPI.setOriginalProfileData().
             *
             * @listens change:first_name
             * @listens change:last_name
             * @listens change:phone
             * @listens change:email
             */
            function updateProfile() {
                profileCustomer.set(getData(self.toJSON()));
                RevelAPI.setOriginalProfileData();
            }

            /**
             * @function update
             * @callback
             * Set {Object} attributes values as RevelAPI.get('customer').attributes values.
             *
             * @listens onProfileSaved [RevelAPI]
             * @listens change
             */
            function update() {
                self.set(getData(profileCustomer.toJSON()));
            };

            function getData(data) {
                return {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    phone:data.phone,
                    addresses: data.addresses
                };
            }
        }
    });
});
