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

/**
 * Contains {@link App.Models.Customer} constructors.
 * @module customers
 * @requires module:backbone
 * @requires module:geopoint
 * @see {@link module:config.paths actual path}
 */
define(["backbone", "geopoint"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a customer model.
     * @alias App.Models.Customer
     * @augments Backbone.Model
     * @example
     * // create a customer model
     * require(['customers'], function() {
     *     var customer = new App.Models.Customer();
     * });
     */
    App.Models.Customer = Backbone.Model.extend(
    /**
     * @lends App.Models.Customer.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * Customer's first name.
             * @type {string}
             * @default ""
             */
            first_name: "",
            /**
             * Customer's last name.
             * @type {string}
             * @default ""
             */
            last_name: "",
            /**
             * Customer's phone.
             * @type {string}
             * @default ""
             */
            phone: "",
            /**
             * Customer's email.
             * @type {string}
             * @default ""
             */
            email: "",
            /**
             * Customer ID.
             * @type {?(number|string)}
             * @default null
             */
            id: null,
            /**
             * Array of addresses assigned to the customer.
             * @type {Array}
             * @default []
             */
            addresses: [],
            /**
             * Index of address selected for shipping. -1 means no address selected.
             * @type {number}
             * @default -1
             */
            shipping_address: -1,
            /**
             * Array of available shipping services. This array depends on order items.
             * @type {Array}
             * @default []
             */
            shipping_services: [],
            /**
             * Index of selected shipping service. -1 means no shipping service selected.
             * @type {number}
             * @default -1
             */
            shipping_selected: -1,
            /**
             * Status of shipping services loading. Can be one of "", "resolved", "restoring", "pending".
             * @type {string}
             * @default ""
             */
            load_shipping_status: "",
            /**
             * Index of address used for "Delivery" dining option.
             * @type {number}
             * @default 0
             */
            deliveryAddressIndex: 0,
            /**
             * Index of address used for "Shipping" dining option.
             * @type {number}
             * @default 1
             */
            shippingAddressIndex: 1,
            /**
             * User's password
             * @type {string}
             * @default ""
             */
            password: "",
            /**
             * User's confirm password
             * @type {string}
             * @default ""
             */
            confirm_password: "",
            /**
             * Customer's id.
             * @type {?number}
             * @default null
             */
            user_id: null,
            /**
             * Session expires in.
             * @type {?number}
             * @default null
             */
            expires_in: null,
            /**
             * Token type. It's used in 'Authorization' HTTP header.
             * @type {string}
             * @default ""
             */
            token_type: "",
            /**
             * Access token.
             * @type {string}
             * @default ""
             */
            access_token: "",
            /**
             * Space separated list of scopes granted to the customer.
             * @type {string}
             * @default ""
             */
            scope: ""
        },
        /**
         * Adds validation listeners for `first_name`, `last_name` attributes changes.
         * Sets indexes of addresses used for "Delivery" and "Shipping" dinign options.
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
         * Gets customer name in the format "John M.".
         * @returns {string} Concatenation of `first_name` attribute value, `last_name` first letter and '.' sign.
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
         * Saves attributes values of the customer in a storage.
         */
        saveCustomer: function() {
            setData('customer', this);
        },
        /**
         * Loads attributes from the storage.
         * If a shipping service was selected changes `load_shipping_status` on 'restoring' value.
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
         * Saves addresses in a storage.
         */
        saveAddresses: function() {
            setData('address', new Backbone.Model({addresses: this.get('addresses')}), true);
        },
        /**
         * Loads addresses from a storage.
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
         * Converts address object literal to full address line.
         * @param {number} index=index of last element - index of addresses array
         * @see {@link http://mediawiki.middlebury.edu/wiki/LIS/Address_Standards} for detail format information.
         * @returns {string} full address line
         */
        address_str: function(index) {
            var addresses = this.get('addresses'),
                settings = App.Settings,
                str = [];

            if (!Array.isArray(addresses) || addresses.length <= 0) {
                return '';
            }

            index = index >= 0 ? index : addresses.length - 1;

            addresses = addresses[index];

            if (!(addresses instanceof Object)) {
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
         * Validates values of address object properties `street_1`, `city`, `state`, `province`, `zipcode`.
         * @returns {Array} empty array if all properties pass validation or array with invalid properties.
         */
        _check_delivery_fields: function() {
            var settings = App.Settings,
                empty = [],
                address = this.get('addresses'),
                req = {
                    street_1: _loc.CHECKOUT_ADDRESS_LINE1,
                    city: _loc.CHECKOUT_CITY,
                    state: _loc.CARD_STATE,
                    province: _loc.CHECKOUT_PROVINCE,
                    zipcode: _loc.CHECKOUT_ZIP_CODE
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
         * Validates `first_name`, `last_name`, `email`, `phone` attributes values for checkout.
         * @param {string} dining_option - order type selected
         * @returns {Object} One of the following object literals:
         * - If all fine:
         * ```
         * {
         *     status: "OK"
         * }
         * ```
         * - If validation failed:
         * ```
         * {
         *     status: "ERROR_EMPTY_FIELDS",
         *     errorMsg: <error message>,
         *     errorList: [] // Array of invalid properties
         * }
         * ```
         */
        check: function(dining_option) {
            var err = [];

            !this.get('first_name') && err.push(_loc.CHECKOUT_FIRST_NAME);
            !this.get('last_name') && err.push(_loc.CHECKOUT_LAST_NAME);
            !EMAIL_VALIDATION_REGEXP.test(this.get('email')) && err.push(_loc.CHECKOUT_EMAIL);
            !this.get('phone') && err.push(_loc.CHECKOUT_PHONE);

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
         * Receives shipping_services.
         * If `load_shipping_status` attribute value is 'restoring' changes its value on 'resolved'.
         * Otherwise, changes `load_shipping_status` on 'pending' and sends `POST` request to `/weborders/shipping_options/` with parameter
         * ```
         * {
         *     address: <address object>
         *     items: <array of cart items>
         *     establishment: <establishment>
         * }
         * ```
         * When a response is processed `load_shipping_status` changes on 'resolved'.
         *
         * @param {Object} [jqXHR=create ajax request] - the jqXHR Object.
         * @param {Function} [getShippingOptions=return raw data] - A function returning shipping options (expects a response-object as parameter).
         *                                          May be used for raw data mapping.
         */
        get_shipping_services: function(jqXHR, getShippingOptions) {
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

            // reset shipping services
            this.resetShippingServices('pending');

            var data_json = JSON.stringify(data);

            // define getShippingOptions function if it isn't a function
            getShippingOptions = typeof getShippingOptions == 'function' ? getShippingOptions : function(response) {
                return response.data;
            };

            jqXHR = jqXHR || $.ajax({
                type: "POST",
                url: App.Data.settings.get("host") + "/weborders/shipping_options/",
                data: data_json,
                dataType: "json"
            });
            // process successful response
            jqXHR.done(function(response) {
                var shipping_options;
                switch (response.status) {
                    case "OK":
                        self.set("shipping_services", getShippingOptions(response), {silent: true});
                        self.set("shipping_selected", getIndex(response));
                        complete();
                        break;
                    default:
                        onError(jqXHR);
                }
            });
            // process failure response
            jqXHR.error(onError);

            function onError(xhr) {
                if (xhr.statusText != "abort") {
                    setTimeout(complete, 300);
                }
            }

            function complete() {
                self.set("load_shipping_status", "resolved", {silent: true});
                self.trigger("change:shipping_services");
            }

            function getIndex(response) {
                var shipping = _.isObject(response) && _.isObject(response.data) && response.data.shipping;
                return _.isObject(shipping) && Array.isArray(shipping.options)
                    ? _.pluck(shipping.options, 'service_code').indexOf(shipping.service_code)
                    : -1;
            }
        },
        /**
         * Clears `shipping_services` attribute, changes `load_shipping_status`.
         * @param {string} [status=""] - value of `load_shipping_status` need to be changed on.
         */
        resetShippingServices: function(status) {
            this.set({
                shipping_services: [],
                load_shipping_status: typeof status == 'string' ? status : '',
                shipping_selected: -1
            }, {silent: true});
            this.trigger('change:shipping_services');
        },
        /**
         * Sets indexes for delivery and shipping addresses in `addresses` array.
         * If initially addresses is empty array deliveryAddressIndex is 0, shippingAddressIndex is 1
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
         * Checks `shipping_address` attribute has default value or not.
         * @returns {boolean} `true` if `shipping_address` is default or `false` otherwise.
         */
        isDefaultShippingAddress: function() {
            return this.get('shipping_address') === this.defaults.shipping_address;
        },
        /**
         * Checks `shipping_selected` attribute has default value or not.
         * @returns {boolean} `true` if `shipping_selected` is default or `false` otherwise.
         */
        isDefaultShippingSelected: function() {
            return this.get('shipping_selected') === this.defaults.shipping_selected;
        },
        /**
         * Checks `shipping_address` attribute value is new.
         * @param {string} dining_option - selected order type.
         * @returns {boolean} true is a new address selected or false if address already exists in DB.
         */
        isNewAddressSelected: function(dining_option) {
            var isDelivery = dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING',
                shipping_address = this.get('shipping_address');
            return (shipping_address == this.get('deliveryAddressIndex') || shipping_address == this.get('shippingAddressIndex')) && isDelivery ? true : false;
        },
        /**
         * Validates `first_name`, `last_name`, `email` and `password` attributes for Sign Up.
         * @returns {Object} One of the following object literals:
         * - If all fine:
         * ```
         * {
         *     status: "OK"
         * }
         * ```
         * - If validation failed:
         * ```
         * {
         *     status: "ERROR_EMPTY_FIELDS",
         *     errorMsg: <error message>,
         *     errorList: [] // Array of invalid properties
         * }
         * ```
         */
        checkSignUpData: function() {
            var err = [];

            !this.get('first_name') && err.push(_loc.PROFILE_FIRST_NAME);
            !this.get('last_name') && err.push(_loc.PROFILE_LAST_NAME);
            !EMAIL_VALIDATION_REGEXP.test(this.get('email')) && err.push(_loc.PROFILE_EMAIL_ADDRESS);
            !this.get('phone') && err.push(_loc.PROFILE_PHONE);
            !this.get('password') && err.push(_loc.PROFILE_PASSWORD);

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
         * Compares `password`, `confirm_password` attributes.
         * @returns {Object} One of the following object literals:
         * - If all fine:
         * ```
         * {
         *     status: "OK"
         * }
         * ```
         * - If validation failed:
         * ```
         * {
         *     status: "ERROR_PASSWORDS_MISMATCH",
         *     errorMsg: <error message>
         * }
         * ```
         */
        comparePasswords: function() {
            var err = {
                status: "ERROR_PASSWORDS_MISMATCH",
                errorMsg: _loc.PROFILE_PASSWORDS_MISMATCH,
            }, ok = {
                status: "OK"
            };
            return this.get('password') != this.get('confirm_password') ? err : ok;
        },
        /**
         * Gets authorization token of the customer. Sends request with following parameters:
         * ```
         * {
         *     url: "https://identity-dev.revelup.com/customers-auth/authorization/token/",
         *     method: "POST",
         *     data: {
         *         username: <username>,                                              // username (email)
         *         scope: "CUSTOMERS:customers.customer CUSTOMERS:customers.address", // constant value
         *         password: <password>,                                              // password
         *         grant_type: "password"                                             // constant value
         *     }
         * }
         * ```
         * Server may return following response:
         * - Successful authorization:
         * ```
         * Status: 200
         * {
         *     "username": "johndoe@foobar.com",                                    // username
         *     "user_id": 1,                                                        // user id
         *     "access_token": "2YotnFZFEjr1zCsicMWpAA",                            // access token
         *     "token_type": "Bearer",                                              // token type
         *     "expires_in": 3600,                                                  // expiration time
         *     "scope": "CUSTOMERS:customers.customer CUSTOMERS:customers.address"  // access scope
         * }
         * ```
         * - Username or password is invalid:
         * ```
         * Status: 401
         * {
         *     "error_description": "Invalid credentials given.",
         *     "error": "invalid_grant"
         * }
         * ```
         * The model emits `onInvalidUser` event in this case.
         *
         * - User is not activated:
         * ```
         * Status: 423
         * {
         *     "error": "user_is_not_activated"
         * }
         * ```
         * The model emits `onNotActivatedUser` event in this case.
         *
         * - Invalid scope (incorrect scope value):
         * ```
         * Status: 401
         * {
         *     "error": "invalid_scope"
         * }
         * ```
         * The model emits `onInvalidUser` event in this case.
         *
         * - Unsupported grant type:
         * Status: 400
         * {
         *     "error": "unsupported_grant_type"
         * }
         * The model emits `onLoginError` event in this case.
         *
         * - `grant_type` parameter is missed:
         * ```
         * Status: 400
         * {
         *     "error_description": "Request is missing grant_type parameter.",
         *     "error": "invalid_request"
         * }
         * ```
         * The model emits `onLoginError` event in this case.
         *
         * - `password` parameter is missed:
         * ```
         * Status: 400
         * {
         *     "error_description": "Request is missing password parameter.",
         *     "error": "invalid_request"
         * }
         * ```
         * The model emits `onLoginError` event in this case.
         *
         * - `username` parameter is missed:
         * ```
         * Status: 400
         * {
         *     "error_description": "Request is missing username parameter.",
         *     "error": "invalid_request"
         * }
         * ```
         * The model emits `onLoginError` event in this case.
         *
         * @returns {Object} jqXHR object.
         */
        login: function() {
            var attrs = this.toJSON();
            return Backbone.$.ajax({
                url: "https://identity-dev.revelup.com/customers-auth/v1/authorization/token/",
                method: "POST",
                context: this,
                data: {
                    username: attrs.email,
                    scope: "CUSTOMERS:customers.customer CUSTOMERS:customers.address",
                    password: attrs.password,
                    grant_type: "password"
                },
                success: function(data) {
                    // need to reset password and set `email` attribute as username
                    this.set({
                        email: data.username,
                        user_id: data.user_id,
                        access_token: data.access_token,
                        token_type: data.token_type,
                        expires_in: data.expires_in,
                        scope: data.scope,
                        password: this.defaults.password
                    });
                },
                error: function(jqXHR) {
                    switch(jqXHR.status) {
                        case 401:
                            this.trigger('onInvalidUser', getResponse());
                            break;
                        case 423:
                            this.trigger('onNotActivatedUser', getResponse());
                            break;
                        default:
                            this.trigger('onLoginError', getResponse());
                    }

                    function getResponse() {
                        return _.isObject(jqXHR.responseJSON) ? jqXHR.responseJSON : {};
                    }
                }
            });
        },
        /**
         * Changes attributes values on default values.
         */
        logout: function() {
            for(var attr in this.defaults) {
                this.set(attr, this.defaults[attr]);
            }
        },
        /**
         * Registers a new customer. Sends request with following parameters:
         * ```
         * {
         *     url: "https://identity-dev.revelup.com/customers-auth/customers/register-customer/",
         *     method: "POST",
         *     contentType: "application/json",
         *     data: {
         *         email: <email>,             // email
         *         password: <password>,       // password
         *         first_name: <first_name>,   // first name
         *         last_name: <last_name>,     // last name
         *         phone_number: <phone>       // phone
         *     }
         * }
         * ```
         * Server may return following response:
         * - Successful registration:
         * ```
         * Status: 201
         * {
         *     "id": 1,                        // customer id
         *     "email": "johndoe@foobar.com",  // username
         *     "first_name": "John",           // first name
         *     "last_name": "Doe",             // last name
         *     "phone_number": "+123456789",   // phone
         *     "addresses":[]                  // addresses
         * }
         * ```
         * The model emits `onUserCreated` event in this case.
         *
         * - Username already exists:
         * ```
         * Status: 422
         * {
         *     "email": ["This field must be unique."]
         * }
         * ```
         * The model emits `onUserExists` event in this case.
         *
         * - 'password' parameter is missed:
         * ```
         * Status: 400
         * {
         *     "password": ["This field is required."]
         * }
         * ```
         * The model emits `onUserCreateError` event in this case.
         *
         * - Invalid scope (incorrect scope value):
         * ```
         * Status: 400
         * {
         *     "email": ["This field is required."]
         * }
         * ```
         * The model emits `onUserCreateError` event in this case.
         *
         * @returns {Object} jqXHR object.
         */
        signup: function() {
            var attrs = this.toJSON();
            return Backbone.$.ajax({
                url: "https://identity-dev.revelup.com/customers-auth/v1/customers/register-customer/",
                method: "POST",
                context: this,
                contentType: "application/json",
                data: JSON.stringify({
                    email: attrs.email,
                    password: attrs.password,
                    first_name: attrs.first_name,
                    last_name: attrs.last_name,
                    phone_number: attrs.phone
                }),
                success: function(data) {
                    this.set({
                        password: this.defaults.password,
                        confirm_password: this.defaults.confirm_password
                    });
                    this.logout();
                    this.trigger('onUserCreated');
                },
                error: function(jqXHR) {
                    switch(jqXHR.status) {
                        case 422:
                            this.trigger('onUserExists', getResponse());
                            break;
                        default:
                            this.trigger('onUserCreateError', getResponse());
                    }

                    function getResponse() {
                        return _.isObject(jqXHR.responseJSON) ? jqXHR.responseJSON : {};
                    }
                }
            });
        },
        /**
         * Fill out RevelAPI.attributes.customer and add listeners for further synchronization with RevelAPI.attributes.customer if RevelAPI.isAvailable() returns true.
         * @ignore
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

            // Fill out RevelAPI.attributes.customer and call RevelAPI.setOriginalProfileData().
            function updateProfile() {
                profileCustomer.set(getData(self.toJSON()));
                RevelAPI.setOriginalProfileData();
            }

            // Set attributes values as RevelAPI.get('customer').attributes values.
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
