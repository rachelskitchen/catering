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

define(["backbone", "card", "customers"], function(Backbone) {
    'use strict';

    var REVEL_INTERFACE_NAME = 'RevelAPI',
        REVEL_API_ERROR_CODES, RevelAPI;

    REVEL_API_ERROR_CODES = {
        SUCCESS: 0,
        AUTHENTICATION_FAILED: 1,
        USER_ALREADY_EXISTS: 2,
        SESSION_EXPIRED: 3,
        INTERNAL_ERROR: 4,
        MAX_NUM_AUTH_ATTEMPTS_EXCEDEED: 5,
        PASSWORD_UPDATE_FAILED: 6
    };

    App.Models.RevelAPI = Backbone.Model.extend({
        defaults: {
            firstTime: null,
            errorCode: null,
            token: null,
            customer: null,
            card: null,
            profileExists: null,
            oldPassword: null,
            newPassword: null,
            useAsDefaultCard: null,
            useAsDefaultCardSession: null,
            points: 0,
            appName: 'Revel Directory',
            gObj: 'App.Data.RevelAPI'
        },
        initialize: function() {
            this.listenTo(this, 'change:firstTime', this.onFirstTime, this);
            this.listenTo(this, 'change:token', this.saveToken, this);
            this.listenTo(this, 'change:profileExists', this.saveProfileExists, this);
            this.listenTo(this, 'change:errorCode', this.listenToErrorCode, this);
            this.listenTo(this, 'change:useAsDefaultCard change:useAsDefaultCardSession', this.saveUseAsDefaultCardSession, this);
            this.listenTo(this, 'onAuthenticationCancel', this.clearRequests, this);
            this.listenTo(this, 'onProfileCancel', this.restoreOriginalProfileData, this);

            this.set('card', new App.Models.Card());
            this.set('customer', new App.Models.Customer({shipping_address: -1}));

            // Queue of requests. Used if middleware action is required.
            // For instance, if `getData` request responds the error 'Session expired' need automatically get a new token and continue `getData` performing.
            this.pendingRequests = [];

            // restore token, useAsDefaultCardSession and profileExists
            this.getToken();
            this.getProfileExists();
            this.getUseAsDefaultCardSession();

            //TODO appName from interface
            App.Settings.RevelAPI = this.isAvailable();

            // save original data
            this.setOriginalProfileData();
        },
        run: function() {
            this.initFirstTime();
        },
        isAvailable: function() {
            return cssua.ua.revelsystemswebview;
        },
        request: function() {
            // should have at least two params: first - API method, last - callback
            if(arguments.length < 2) {
                return;
            }

            var errorCode = this.get('errorCode'),
                isAuthentication = errorCode == REVEL_API_ERROR_CODES.AUTHENTICATION_FAILED || errorCode == REVEL_API_ERROR_CODES.SESSION_EXPIRED;
            console.log('Perform request "%s"', arguments[0]);

            // add request to queue
            if(isAuthentication) {
                this.pendingRequests.unshift(arguments);
            } else {
                this.pendingRequests.push(arguments);
            }

            // If request is the first in pendingRequest queue need perform it.
            // Otherwise it will be performed automatically after successful first request performing.
            if(isAuthentication || this.pendingRequests.length == 1) {
                this.performRequest.apply(this, arguments);
            }
        },
        performRequest: function() {
            var args = Array.prototype.slice.call(arguments, 1, -1),
                method = arguments[0];

            // if any argument is function need override it by its result. Used for token.
            args = args.map(function(arg) {
                arg = typeof arg == 'function' ? arg() : arg;
                return encodeURIComponent(arg);
            });

            try {
                if(cssua.ua.android) {
                    var obj = window[REVEL_INTERFACE_NAME];
                    this.handleResponse(obj[method].apply(obj, args));
                } else if(cssua.ua.ios) {
                    args.push(this.get('gObj') + '.handleResponse');
                    args.unshift(method);
                    window.location.href = '/' + args.join('/');
                } else {
                    this.handleResponse({message: 'result string', errorCode: REVEL_API_ERROR_CODES.INTERNAL_ERROR, data: arguments[0]});
                }
            } catch(e) {
                this.set('errorCode', REVEL_API_ERROR_CODES.INTERNAL_ERROR);
                console.error(e);
            }
        },
        handleResponse: function(response) {
            // response is object which has following format:
            // {"message": "<result string>", "errorCode”: <error code>, “data”: "<result string>"}.
            // If errorCode > 0 there is an error occurred
            var args = this.pendingRequests[0];

            // if any request is not being processed currently need abord function performing
            if(!args) {
                return;
            }

            // to provide broadcast listeners about any errorCode change
            this.set('errorCode', null, {silent: true});

            try {
                // convert response to object if it isn't
                if(!(response instanceof Object)) {
                    response = JSON.parse(decodeURIComponent(response.replace(/(%22)/g, '\\$1'))); // %22 is symbol " encoded
                }

                // set response errorCode
                this.set('errorCode', response.errorCode);

                if(!response.errorCode) {
                    args[args.length - 1](response.data);
                    console.log('Request "%s" performed', args[0]);
                    this.pendingRequests.shift();
                    this.pendingRequests.length > 0 && this.performRequest.apply(this, this.pendingRequests[0]);
                } else {
                    console.log('Request "%s" failed. %s', args[0], response.message);
                }
            } catch(e) {
                this.set('errorCode', REVEL_API_ERROR_CODES.INTERNAL_ERROR);
                console.log('Unable to handle a response', response, 'for request', args, '\n', e);
            }
        },
        listenToErrorCode: function() {
            var errorCode = this.get('errorCode');

            switch(this.get('errorCode')) {
                case REVEL_API_ERROR_CODES.AUTHENTICATION_FAILED:
                    App.Data.errors.alert(MSG.ERROR_REVEL_AUTHENTICATION_FAILED);
                    this.pendingRequests.shift(); // remove authentication request from pending
                    this.trigger('onAuthenticate');
                    break;

                case REVEL_API_ERROR_CODES.SESSION_EXPIRED:
                    this.trigger('onAuthenticate');
                    break;

                case REVEL_API_ERROR_CODES.USER_ALREADY_EXISTS:
                    this.clearRequests();
                    App.Data.errors.alert(MSG.ERROR_REVEL_USER_EXISTS.replace('%s', this.getUsername() || ''));
                    break;

                case REVEL_API_ERROR_CODES.INTERNAL_ERROR:
                    App.Data.errors.alert(MSG.ERROR_REVEL_UNABLE_TO_PERFORM);
                    this.clearRequests();
                    break;

                case REVEL_API_ERROR_CODES.MAX_NUM_AUTH_ATTEMPTS_EXCEDEED:
                    this.set('profileExists', null);
                    this.trigger('onAuthenticationCancel');
                    App.Data.errors.alert(MSG.ERROR_REVEL_ATTEMPTS_EXCEEDED);
                    break;

                case REVEL_API_ERROR_CODES.PASSWORD_UPDATE_FAILED:
                    App.Data.errors.alert(MSG.ERROR_REVEL_PASSWORD_UPDATE_FAILED);
                    this.clearRequests();
                    break;

                default:
                    break;
            }
        },
        clearRequests: function() {
            this.pendingRequests.length = 0;
        },
        getToken: function() {
            var obj = getData('token');
            obj instanceof Object && this.set('token', obj.token);
        },
        saveToken: function() {
            setData('token', {token: this.get('token')});
        },
        getUseAsDefaultCardSession: function() {
            var obj = getData('useAsDefaultCardSession');
            obj instanceof Object && this.set('useAsDefaultCardSession', obj.useAsDefaultCardSession);
        },
        saveUseAsDefaultCardSession: function() {
            this.set('useAsDefaultCardSession', this.get('useAsDefaultCard'));
            setData('useAsDefaultCardSession', {useAsDefaultCardSession: this.get('useAsDefaultCardSession')});
        },
        getProfileExists: function() {
            var obj = getData('profileExists', true);
            obj instanceof Object && this.set('profileExists', obj.profileExists);
        },
        saveProfileExists: function() {
            setData('profileExists', {profileExists: this.get('profileExists')}, true);
        },
        authenticate: function(user, pwd, cb) {
            var self = this;
            this.request('authenticate', String(user), String(pwd), saveToken);
            function saveToken(data) {
                self.set('token', data);
                self.trigger('onAuthenticated');
                typeof cb == 'function' && cb();
            }
        },
        change_password: function(newPwd, oldPwd, cb) {
            var profileExists = this.get('profileExists'),
                email = this.getUsername(),
                self = this;

            // if profile doesn't exist need create credentials
            if(!profileExists && newPwd && email) {
                return this.request('createCredentials', email, String(newPwd), updateToken);
            }

            // if profile exists need update credentials
            if(newPwd && oldPwd && email) {
                return this.request('updatePassword', email, String(oldPwd), String(newPwd), updateToken);
            }

            function updateToken(data) {
                self.set('token', data);
                !profileExists && self.set('profileExists', true);
                typeof cb == 'function' && cb();
            }
        },
        saveProfile: function(cb) {
            var profileExists = this.get('profileExists'),
                newPassword = this.get('newPassword'),
                oldPassword = this.get('oldPassword'),
                self = this;

            // save without password changing
            if(!newPassword && !oldPassword && profileExists) {
                return saveData();
            }

            // save with password changing
            if((!profileExists && newPassword) || (oldPassword && newPassword && profileExists)) {
                return this.change_password(newPassword, oldPassword, saveData);
            }

            // alerts regarding to password validation
            if((!profileExists && !newPassword) || (!newPassword && oldPassword && profileExists)) {
                App.Data.errors.alert(MSG.ERROR_REVEL_EMPTY_NEW_PASSWORD);
            } else if(newPassword && !oldPassword && profileExists) {
                App.Data.errors.alert(MSG.ERROR_REVEL_EMPTY_OLD_PASSWORD);
            }

            function saveData() {
                try {
                    var data = {
                        customer: self.get('customer').toJSON(),
                        card: self.get('card').toJSON(),
                        useAsDefaultCard: self.get('useAsDefaultCard')
                    }
                    self.request('setData', 'profile', JSON.stringify(data), self.getTokenString.bind(self), cb);
                } catch(e) {
                    self.set('errorCode', REVEL_API_ERROR_CODES.INTERNAL_ERROR);
                    console.log('Unable to save user\'s profile', '\n', e);
                }
            }

        },
        getProfile: function(cb) {
            var self = this;
            this.request('getData', 'profile', this.getTokenString.bind(this), function(data) {
                try {
                    data = JSON.parse(data);
                    self.get('customer').set(data.customer);
                    self.get('card').set(data.card);
                    self.set('useAsDefaultCard', data.useAsDefaultCard);
                    self.setOriginalProfileData();
                    typeof cb == 'function' && cb();
                } catch(e) {
                    this.set('errorCode', REVEL_API_ERROR_CODES.INTERNAL_ERROR);
                    console.log('Unable to receive user\'s profile', '\n', e);
                }
            });
        },
        checkProfile: function(cb) {
            if(this.get('profileExists')) {
                this.getProfile(cb);
            } else {
                this.trigger('onProfileCreate', cb);
            }
        },
        initFirstTime: function() {
            var firstTime = getData('firstTime', true);
            if(firstTime) {
                this.set(firstTime);
            } else {
                this.set('firstTime', true);
            }
        },
        onFirstTime: function() {
            var firstTime = this.get('firstTime');
            if(firstTime) {
                this.trigger('onWelcomeShow');
            } else {
                this.trigger('onWelcomeReviewed');
            }
            setData('firstTime', {firstTime: Boolean(firstTime)}, true);
        },
        processPersonalInfo: function(cb) {
            var customer = this.get('customer'),
                result = customer && customer.check();
            if(result && /ok/i.test(result.status)) {
                typeof cb == 'function' && cb();
            } else {
                App.Data.errors.alert(result.errorMsg);
            }
        },
        processPaymentInfo: function(success, fail) {
            var card = this.get('card'),
                useAsDefaultCard = this.get('useAsDefaultCard'),
                result;

            // CardView listens to this event to set data
            card.trigger('add_card');

            if(useAsDefaultCard) {
                result = card.check();
            }

            if(!useAsDefaultCard || /ok/i.test(result.status)) {
                typeof success == 'function' && success(result);
            } else {
                typeof fail == 'function' && fail(result);
            }
        },
        getUsername: function() {
            var customer = this.get('customer');
            return customer ? customer.get('email') : null;
        },
        getTokenString: function() {
            return String(this.get('token'));
        },
        getQRCode: function() {
            var customer = this.get('customer').toJSON(),
                data = [];

            data.push('number=' + encodeURIComponent(customer.phone));
            data.push('firstName=' + encodeURIComponent(customer.first_name));
            data.push('lastName=' + encodeURIComponent(customer.last_name));
            data.push('phone_number=' + encodeURIComponent(customer.phone));
            data.push('email=' + encodeURIComponent(customer.email));
            data.push('address=' + encodeURIComponent(JSON.stringify(customer.addresses[0])));

            return App.Data.settings.get("host") + "/weborders/qrcode/?" + data.join('&');
        },
        checkCreditCard: function() {
            var useAsDefaultCardSession = this.get('useAsDefaultCardSession'),
                self = this;
            if(useAsDefaultCardSession === null) {
                this.trigger('onCreditCardNotificationShow');
            } else if(useAsDefaultCardSession === false) {
                this.trigger('onPayWithCustomCreditCard');
            } else {
                this.getProfile(function() {
                    if(self.get('useAsDefaultCard')) {
                        self.trigger('onPayWithSavedCreditCard');
                    } else {
                        self.trigger('onPayWithCustomCreditCard');
                    }
                });
            }
        },
        setOriginalProfileData: function() {
            this.originalProfileData = {
                customer: _.clone(this.get('customer').toJSON()),
                card: _.clone(this.get('card').toJSON()),
                oldPassword: this.get('oldPassword'),
                newPassword: this.get('newPassword'),
                useAsDefaultCard: this.get('useAsDefaultCard'),
            }

            var address = this.get('customer').get('addresses')[0];
            if(address) {
                this.originalProfileData.customer.addresses = [_.clone(address)];
            } else {
                this.originalProfileData.customer.addresses = [];
            }
        },
        restoreOriginalProfileData: function() {
            var data = this.originalProfileData;
            if(data) {
                this.set({
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                    useAsDefaultCard: data.useAsDefaultCard
                });
                this.get('customer').set(data.customer);
                this.get('card').set(data.card);
            }
        },
        getLoyaltyPoints: function() {
            var request = Backbone.$.Deferred(),
                self = this;
            $.ajax({
                url: App.Data.settings.get("host") + "/weborders/reward_cards/",
                data: {
                    number: this.get('customer').get('phone')
                },
                success: function(data) {
                    if(data.status && Array.isArray(data.data) && data.data.length && typeof data.data[0].total_points == 'number') {
                        self.set('points', data.data[0].total_points);
                    }
                },
                complete: function() {
                    request.resolve();
                }
            });
            return request;
        }
    });
});