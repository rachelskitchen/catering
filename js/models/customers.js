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

    var SERVER_URL = "https://identity-dev.revelup.com";

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
             * Index of address used for "Catering" dining option.
             * @type {number}
             * @default 2
             */
            cateringAddressIndex: 2,
            /**
             * Index of primary address used in "Profile".
             * @type {?number}
             * @default null
             */
            profileAddressIndex: 3,
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
         * If initially addresses is empty array deliveryAddressIndex is 0, shippingAddressIndex is 1, cateringAddressIndex is 2
         */
        setAddressesIndexes: function() {
            var addresses = this.get('addresses');
            if(Array.isArray(addresses)) {
                this.set({
                    deliveryAddressIndex: addresses.length,
                    shippingAddressIndex: addresses.length + 1,
                    cateringAddressIndex: addresses.length + 2,
                    profileAddressIndex: addresses.length + 3
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
            var isDelivery = dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING' || dining_option === 'DINING_OPTION_CATERING',
                shipping_address = this.get('shipping_address');
            return (shipping_address == this.get('deliveryAddressIndex') || shipping_address == this.get('shippingAddressIndex') || shipping_address == this.get('cateringAddressIndex')) && isDelivery ? true : false;
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
         *     url: "https://identity-dev.revelup.com/customers-auth/v1/authorization/token/",
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
         *     "token": {
         *         "username": "johndoe@foobar.com",                                    // username
         *         "user_id": 1,                                                        // user id
         *         "access_token": "2YotnFZFEjr1zCsicMWpAA",                            // access token
         *         "token_type": "Bearer",                                              // token type
         *         "expires_in": 3600,                                                  // expiration time
         *         "scope": "CUSTOMERS:customers.customer CUSTOMERS:customers.address"  // access scope
         *     },
         *     customer: {
         *         "email": "johndoe@foobar.com",                                       // email
         *         "first_name": "John",                                                // first name
         *         "last_name": "Doe",                                                  // last name
         *         "id": 1,                                                             // user id
         *         "phone_number": "+123456789"                                         // phone
         *         "addresses": [...]                                                   // array of addresses
         *     }
         * ```
         * - Username or password is invalid:
         * ```
         * Status: 400
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
         * Status: 400
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
                url: SERVER_URL + "/customers-auth/v1/authorization/token-customer/",
                method: "POST",
                context: this,
                data: {
                    username: attrs.email,
                    scope: "CUSTOMERS:customers.customer CUSTOMERS:customers.address",
                    password: attrs.password,
                    grant_type: "password"
                },
                success: function(data) {
                    if(!_.isObject(data.customer) || !_.isObject(data.token)) {
                        console.error('Incorrect response data format');
                        return
                    }

                    // set profile address
                    var address = data.customer.addresses[0] || this.getEmptyAddress();
                    this.setProfileAddress(this.convertAddressFromAPIFormat(address));

                    // need to reset password and set `email` attribute as username
                    this.set({
                        email: data.customer.email,
                        first_name: data.customer.first_name,
                        last_name: data.customer.last_name,
                        phone: data.customer.phone_number,
                        user_id: data.token.user_id,
                        access_token: data.token.access_token,
                        token_type: data.token.token_type,
                        expires_in: data.token.expires_in,
                        scope: data.token.scope,
                        password: this.defaults.password
                    });
                },
                error: function(jqXHR) {
                    switch(jqXHR.status) {
                        case 423:
                            this.trigger('onNotActivatedUser', getResponse());
                            break;
                        default:
                            emitDefaultEvent.call(this);
                    }

                    function emitDefaultEvent() {
                        var resp = getResponse();
                        if (resp.error == "invalid_scope" || resp.error == "invalid_grant") {
                            this.trigger('onInvalidUser', resp);
                        } else {
                            this.trigger('onLoginError', resp);
                        }
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
         *     url: "https://identity-dev.revelup.com/customers-auth/v1/customers/register-customer/",
         *     method: "POST",
         *     contentType: "application/json",
         *     data: {
         *         email: <email>,             // email
         *         password: <password>,       // password
         *         first_name: <first_name>,   // first name
         *         last_name: <last_name>,     // last name
         *         phone_number: <phone>       // phone
         *         address: <address object>   // address
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
         * Status: 400
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
         * @param {Object} address - an object containing address data
         *
         * @returns {Object} jqXHR object.
         */
        signup: function(address) {
            var attrs = this.toJSON();

            address = this.convertAddressToAPIFormat(address);

            return Backbone.$.ajax({
                url: SERVER_URL + "/customers-auth/v1/customers/register-customer/",
                method: "POST",
                context: this,
                contentType: "application/json",
                data: JSON.stringify({
                    email: attrs.email,
                    password: attrs.password,
                    first_name: attrs.first_name,
                    last_name: attrs.last_name,
                    phone_number: attrs.phone,
                    address: _.isObject(address) ? address : undefined
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
                    var resp = getResponse();

                    switch(jqXHR.status) {
                        case 400:
                            this.trigger('onUserValidationError', resp);
                            break;
                        default:
                            emitDefaultEvent.call(this);
                    }

                    function emitDefaultEvent() {
                        if (resp.email == "This field must be unique.") {
                            this.trigger('onUserExists', resp);
                        } else {
                            this.trigger('onUserCreateError', resp);
                        }
                    }

                    function getResponse() {
                        return _.isObject(jqXHR.responseJSON) ? jqXHR.responseJSON : {};
                    }
                }
            });
        },
        /**
         * Creates an object containing empty address data (address object template).
         * @returns {Object}
         * ```
         * {
         *     country: '',
         *     state: '',
         *     province: '',
         *     street_1: '',
         *     street_2: '',
         *     city: '',
         *     zipcode: ''
         * }
         * ```
         */
        getEmptyAddress: function() {
            return {
                country: '',
                state: '', //null,
                province: '', //null,
                street_1: '',
                street_2: '',
                city: '',
                zipcode: ''
            };
        },
        /**
         * @returns {Object} An object with Authorization HTTP header if the customer has access token.
         */
        getAuthorizationHeader: function() {
            var header = {},
                token_type = this.get('token_type'),
                access_token = this.get('access_token');

            if(token_type && access_token) {
                header.Authorization = token_type + ' ' + access_token;
            }

            return header;
        },
        /**
         * Sets profile address.
         *
         * @param {Object} address - address data.
         */
        setProfileAddress: function(address) {
            if(!_.isObject(address)) {
                return;
            }

            _.defaults(address, {
                state: address
            })

            var addresses = this.get('addresses'),
                profileAddressIndex = this.get('profileAddressIndex');

            addresses[profileAddressIndex] = address;
        },
        /**
         * @returns {Object} profile address object.
         */
        getProfileAddress: function() {
            var addresses = this.get('addresses'),
                profileAddressIndex = this.get('profileAddressIndex');
            return addresses[profileAddressIndex];
        },
        /**
         * Updates the customer. Sends request with following parameters:
         * ```
         * {
         *     url: "https://identity-dev.revelup.com/customers-auth/v1/customers/customers/<id>/",
         *     method: "PATCH",
         *     contentType: "application/json",
         *     data: {
         *         email: <email>,             // email
         *         first_name: <first_name>,   // first name
         *         last_name: <last_name>,     // last name
         *         phone_number: <phone>       // phone
         *     }
         * }
         * ```
         * Server may return the following response:
         * - Successful update:
         * ```
         * Status: 200
         * {
         *     "email": "johndoe@foobar.com",  // username
         *     "first_name": "John",           // first name
         *     "last_name": "Doe",             // last name
         *     "phone_number": "+123456789",   // phone
         * }
         * ```
         * The model emits `onUserUpdate` event in this case.
         *
         * - Session is already expired or invalid token is used:
         * ```
         * Status: 403
         * {
         *     "detail":"Authentication credentials were not provided."
         * }
         * ```
         * The model emits `onUserSessionExpired` event in this case. Method `.logout()` is automatically called in this case.
         *
         * - The customer isn't found:
         * ```
         * Status: 404
         * {
         *     "detail":"Not found."
         * }
         * ```
         * The model emits `onUserNotFound` event in this case.
         *
         * - New data is invalid:
         * ```
         * Status: 400
         * {
         *     <field name>: <validation error>
         * }
         * ```
         * The model emits `onUserUpdateError` event in this case.
         *
         * @returns {Object} jqXHR object.
         */
        updateCustomer: function() {
            var attrs = this.toJSON();

            return Backbone.$.ajax({
                url: SERVER_URL + "/customers-auth/v1/customers/customers/" + attrs.user_id + "/",
                method: "PATCH",
                context: this,
                contentType: "application/json",
                headers: this.getAuthorizationHeader(),
                data: JSON.stringify({
                    email: attrs.email,
                    first_name: attrs.first_name,
                    last_name: attrs.last_name,
                    phone_number: attrs.phone
                }),
                success: this.trigger.bind(this, 'onUserUpdate'),
                error: function(jqXHR) {
                    switch(jqXHR.status) {
                        case 403:
                            this.trigger('onUserSessionExpired');
                            this.logout(); // need to reset current account to allow to re-log in
                            break;
                        case 404:
                            this.trigger('onUserNotFound');
                            break;
                        case 400:
                            this.trigger('onUserValidationError', getResponse());
                            break;
                        default:
                            this.trigger('onUserAPIError', getResponse());

                        function getResponse() {
                            return _.isObject(jqXHR.responseJSON) ? jqXHR.responseJSON : {};
                        }
                    }
                }
            });
        },
        /**
         * Creates a new address. Sends request with following parameters:
         * ```
         * {
         *     url: "https://identity-dev.revelup.com/customers-auth/v1/customers/addresses/",
         *     method: "POST",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {
         *         "is_primary": true,
         *         "street_1": "170 Columbus Ave",
         *         "street_2": null,
         *         "postal_code": "94133",
         *         "country_code": "US",
         *         "city": null,
         *         "region": null
         *     }
         * }
         * ```
         * Server may return the following response:
         * - Address is successfully created:
         * ```
         * Status: 200
         * {
         *     "id":1,
         *     "customer":1,
         *     "is_primary": true,
         *     "street_1": "170 Columbus Ave",
         *     "street_2": null,
         *     "postal_code": "94133",
         *     "country_code": "US",
         *     "city": null,
         *     "region": null
         * }
         * ```
         * The model emits `onUserAddressCreated` event in this case.
         *
         * - Session is already expired or invalid token is used:
         * ```
         * Status: 403
         * {
         *     "detail":"Authentication credentials were not provided."
         * }
         * ```
         * The model emits `onUserSessionExpired` event in this case. Method `.logout()` is automatically called in this case.
         *
         * - Address field is invalid:
         * ```
         * Status: 400
         * {
         *     <field name>: <validation error>
         * }
         * ```
         * The model emits `onUserValidationError` event in this case.
         *
         * @param {Object} address - an object containing address data
         *
         * @returns {Object} jqXHR object.
         */
        createAddress: function(address) {
            if (!_.isObject(address)) {
                return;
            }

            address = this.convertAddressToAPIFormat(address);

            return Backbone.$.ajax({
                url: SERVER_URL + "/customers-auth/v1/customers/addresses/",
                method: "POST",
                context: this,
                contentType: "application/json",
                headers: this.getAuthorizationHeader(),
                data: JSON.stringify(address),
                success: this.trigger.bind(this, 'onUserAddressCreated'),
                error: function(jqXHR) {
                    switch(jqXHR.status) {
                        case 403:
                            this.trigger('onUserSessionExpired');
                            this.logout(); // need to reset current account to allow to re-log in
                            break;
                        case 400:
                            this.trigger('onUserValidationError', getResponse());
                            break;
                        default:
                            this.trigger('onUserAPIError', getResponse());

                        function getResponse() {
                            return _.isObject(jqXHR.responseJSON) ? jqXHR.responseJSON : {};
                        }
                    }
                }
            });
        },
        /**
         * Updates customer's address. Sends request with following parameters:
         * ```
         * {
         *     url: "https://identity-dev.revelup.com/customers-auth/v1/customers/addresses/<id>/",
         *     method: "PATCH",
         *     contentType: "application/json",
         *     headers: {Authorization: "Bearer XXXXXXXXXXXXX"},
         *     data: {
         *         "is_primary": true,
         *         "street_1": "170 Columbus Ave",
         *         "street_2": null,
         *         "postal_code": "94133",
         *         "country_code": "US",
         *         "city": null,
         *         "region": null
         *     }
         * }
         * ```
         * Server may return the following response:
         * - Address is successfully created:
         * ```
         * Status: 200
         * {
         *     "id":1,
         *     "customer":1,
         *     "is_primary": true,
         *     "street_1": "170 Columbus Ave",
         *     "street_2": null,
         *     "postal_code": "94133",
         *     "country_code": "US",
         *     "city": null,
         *     "region": null
         * }
         * ```
         * The model emits `onUserAddressUpdate` event in this case.
         *
         * - Session is already expired or invalid token is used:
         * ```
         * Status: 403
         * {
         *     "detail":"Authentication credentials were not provided."
         * }
         * ```
         * The model emits `onUserSessionExpired` event in this case. Method `.logout()` is automatically called in this case.
         *
         * - The address isn't found:
         * ```
         * Status: 404
         * {
         *     "detail":"Not found."
         * }
         * ```
         * The model emits `onUserAddressNotFound` event in this case.
         *
         * - New data is invalid:
         * ```
         * Status: 400
         * {
         *     <field name>: <validation error>
         * }
         * ```
         * The model emits `onUserValidationError` event in this case.
         *
         * @param {Object} address - an object containing address data
         *
         * @returns {Object} jqXHR object.
         */
        updateAddress: function(address) {
            if (!_.isObject(address)) {
                return;
            }

            address = this.convertAddressToAPIFormat(address);

            return Backbone.$.ajax({
                url: SERVER_URL + "/customers-auth/v1/customers/addresses/" + address.id + "/",
                method: "PATCH",
                context: this,
                contentType: "application/json",
                headers: this.getAuthorizationHeader(),
                data: JSON.stringify(address),
                success: this.trigger.bind(this, 'onUserAddressUpdate'),
                error: function(jqXHR) {
                    switch(jqXHR.status) {
                        case 403:
                            this.trigger('onUserSessionExpired');
                            this.logout(); // need to reset current account to allow to re-log in
                            break;
                        case 404:
                            this.trigger('onUserAddressNotFound');
                            break;
                        case 400:
                            this.trigger('onUserValidationError', getResponse());
                            break;
                        default:
                            this.trigger('onUserAPIError', getResponse());

                        function getResponse() {
                            return _.isObject(jqXHR.responseJSON) ? jqXHR.responseJSON : {};
                        }
                    }
                }
            });
        },
        /**
         * Converts address to 'customers/addresses/' API format. Changes `zipcode` property to `postal_code`,
         * `country` -> `country_code`, `state`/`province` -> `region`.
         *
         * @param {Object} address - an object containing address data
         * @returns {Object} Modified address object.
         */
        convertAddressToAPIFormat: function(address) {
            if(!_.isObject(address)) {
                return address;
            }

            address.postal_code = address.zipcode;
            address.country_code = address.country;
            address.region = address.country == 'US' ? address.state
                           : address.country == 'CA' ? address.province
                           : null;

            return address;
        },
        /**
         * Converts address from 'customers/addresses/' API format. Changes `postal_code` property to `zipcode`,
         * `country_code` -> `country`, `region` -> `state`/`province`.
         *
         * @param {Object} address - an object containing address data
         * @returns {Object} Modified address object.
         */
        convertAddressFromAPIFormat: function(address) {
            if(!_.isObject(address)) {
                return address;
            }

            address.zipcode = address.postal_code;
            address.country = address.country_code;
            address.state = address.country == 'US' ? address.region : '';
            address.province = address.country == 'CA' ? address.region : '';

            return address;
        },
        /**
         * @param {Object} address - an object containing address data
         * @returns {boolean} `true` if the address has `id`, `customer` properties and `false` otherwise.
         */
        isProfileAddress: function(address) {
            return _.isObject(address) && typeof address.id != 'undefined' && typeof address.customer != 'undefined';
        }
    });
});
