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
        SESSION_EXPIRED: 2,
        USER_ALREADY_EXISTS: 3,
        INTERNAL_ERROR: 4,
        MAX_NUM_AUTH_ATTEMPTS_EXCEDEED: 5
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
            appName: 'Revel Directory',
            gObj: 'App.Data.RevelAPI',
        },
        initialize: function() {
            this.listenTo(this, 'change:firstTime', this.onFirstTime, this);
            this.listenTo(this, 'change:token', this.saveToken, this);
            this.listenTo(this, 'change:profileExists', this.saveProfileExists, this);

            this.set('card', new App.Models.Card());
            this.set('customer', new App.Models.Customer());

            // Queue of requests. Used if middleware action is required.
            // For instance, if `getData` request responds the error 'Session expired' need automatically get a new token and continue `getData` performing.
            this.pendingRequests = [];

            // restore token and profileExists
            this.getToken();
            this.getProfileExists();

            //TODO appName from interface
            App.Settings.RevelAPI = this.isAvailable();
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

            // add request to queue
            this.pendingRequests.unshift(arguments);
            console.log('Perform request "%s"', arguments[0]);

            // if any request is being processed need defer a request performing
            if(this.pendingRequests.length > 1) {
                return;
            }

            this.performRequest.apply(this, arguments);
        },
        performRequest: function() {
            var args = Array.prototype.slice.call(arguments, 1, -1),
                method = arguments[0];

            try {
                if(cssua.ua.android) {
                    var obj = window[REVEL_INTERFACE_NAME];
                    this.handleResponse(obj[method].apply(obj, args));
                } else if(cssua.ua.ios) {
                    args.push(this.get('gObj') + '.handleResponse');
                    args.unshift(method);
                    window.location.href = '/' + args.join('/');
                } else {
                    setTimeout(this.handleResponse.bind(this, {message: 'result string', errorCode: 0, data: arguments[0]}), 10000 - arguments[0] * 1000);
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
            var args = this.pendingRequests.shift();

            // if any request is not being processed currently need abord function performing
            if(!args) {
                return;
            }

            try {
                // convert response to object if it isn't
                if(!(response instanceof Object)) {
                    response = JSON.parse(response);
                }

                // set response errorCode
                this.set('errorCode', response.errorCode);

                if(!response.errorCode) {
                    args[args.length - 1](response.data);
                    this.pendingRequests.length > 0 && this.performRequest.apply(this, this.pendingRequests[0]);
                    console.log('Request "%s" performed', args[0]);
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
                case REVEL_API_ERROR_CODES.SESSION_EXPIRED:
                    this.trigger('onAuthenticate');
                    break;

                case REVEL_API_ERROR_CODES.USER_ALREADY_EXISTS:
                    clearPendingRequests();
                    App.Data.errors.alert(MSG.ERROR_REVEL_USER_EXISTS.replace('%s', this.getUsername() || ''));
                    break;

                case REVEL_API_ERROR_CODES.INTERNAL_ERROR:
                    App.Data.errors.alert(MSG.ERROR_REVEL_UNABLE_TO_PERFORM);
                    clearPendingRequests();
                    break;

                case REVEL_API_ERROR_CODES.MAX_NUM_AUTH_ATTEMPTS_EXCEDEED:
                    App.Data.errors.alert(MSG.ERROR_REVEL_ATTEMPTS_EXCEEDED);
                    this.set('profileExists', null);
                    clearPendingRequests();
                    break;

                default:
                    break;
            }

            function clearPendingRequests() {
                this.pendingRequests.length = 0;
            }
        },
        getToken: function() {
            var obj = getData('token');
            obj instanceof Object && this.set('token', obj.token);
        },
        saveToken: function() {
            setData('token', {token: this.get('token')});
        },
        getProfileExists: function() {
            var obj = getData('profileExists');
            obj instanceof Object && this.set('profileExists', obj.profileExists);
        },
        saveProfileExists: function() {
            setData('profileExists', {profileExists: this.get('profileExists')});
        },
        authenticate: function(user, pwd, cb) {
            this.request('authenticate', String(user), String(pwd), this.set.bind(this, 'token'));
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
            if(newPwd && newPwd == oldPwd && email) {
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
                oldPassword = this.get('oldPassword');

            // save without password changing
            if(newPassword == oldPassword && !newPassword) {
                return saveData();
            }

            // save with password changing
            if((!profileExists && newPassword) || (newPassword == oldPassword && newPassword)) {
                return this.change_password(newPassword, oldPassword, saveData);
            }

            // alerts regarding to password validation
            if((!profileExists && !newPassword) || (!newPassword && oldPassword)) {
                App.Data.errors.alert(MSG.ERROR_REVEL_EMPTY_NEW_PASSWORD);
            } else if(newPassword && !oldPassword) {
                App.Data.errors.alert(MSG.ERROR_REVEL_EMPTY_OLD_PASSWORD);
            } else {
                App.Data.errors.alert(MSG.ERROR_REVEL_MISMATCHED_PASSWORDS);
            }

            function saveData() {
                try {
                    var data = {
                        customer: this.get('customer').toJSON(),
                        card: this.get('card').toJSON()
                    }
                    this.request('setData', 'profile', JSON.stringify(data), String(this.get('token')), cb);
                } catch(e) {
                    this.set('errorCode', REVEL_API_ERROR_CODES.INTERNAL_ERROR);
                    console.log('Unable to save user\'s profile', '\n', e);
                }
            }

        },
        getProfile: function(cb) {
            var self = this;
            this.request('getData', 'profile', String(this.get('token')), function(data) {
                try {
                    data = JSON.parse(data);
                    self.get('customer').set(data.customer);
                    self.get('card').set(data.card);
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
        processPaymentInfo: function(cb) {
            var card = this.get('card'),
                needCheck, result;

            // CardView listens to this event to set data
            card.trigger('add_card');
            needCheck = card.get('cardNumber');

            if(needCheck) {
                result = card.check({ignorePersonal: true, ignoreExpDate: true, ignoreSecurityCode: true});
            }

            if(!needCheck || /ok/i.test(result.status)) {
                typeof cb == 'function' && cb();
            } else {
                App.Data.errors.alert(result.errorMsg);
            }
        },
        getUsername: function() {
            var customer = this.get('customer');
            return customer ? customer.get('email') : null;
        }
    });
});