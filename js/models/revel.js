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
        USER_EXISTS: 3,
        CRASH: 1000
    };

    App.Models.RevelAPI = Backbone.Model.extend({
        defaults: {
            firstTime: null,
            errorCode: null,
            token: null,
            customer: null,
            card: null,
            profileExists: null,
            appName: 'Revel Directory',
            gObj: 'App.Data.RevelAPI',
        },
        initialize: function() {
            this.listenTo(this, 'change:firstTime', this.onFirstTime, this);
            this.listenTo(this, 'change:token', this.saveToken, this);

            this.set('card', new App.Models.Card());
            this.set('customer', new App.Models.Customer());

            // queue of requests
            this.pendingRequests = [];

            // restore token
            this.getToken();

            //TODO appName from interface
            App.Settings.RevelAPI = this.isAvailable();
        },
        run: function() {
            this.initFirstTime();
        },
        isAvailable: function() {
            return (cssua.ua.android && REVEL_INTERFACE_NAME in window) || (cssua.ua.ios && cssua.ua.webview);
        },
        request: function() {
            // should have at least two params: first - API method, last - callback
            if(arguments.length < 2) {
                return;
            }

            // add request to queue
            this.pendingRequests.push(arguments);
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
                this.set('errorCode', REVEL_API_ERROR_CODES.CRASH);
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
                this.set('errorCode', REVEL_API_ERROR_CODES.CRASH);
                console.log('Unable handle a response', response, 'for request', args, '\n', e);
            }
        },
        listenToErrorCode: function() {
            var errorCode = this.get('errorCode');

            switch(this.get('errorCode')) {
                case REVEL_API_ERROR_CODES.AUTHENTICATION_FAILED:
                case REVEL_API_ERROR_CODES.SESSION_EXPIRED:
                    this.trigger('onAuthenticate');
                    break;

                case REVEL_API_ERROR_CODES.USER_EXISTS:
                    break;

                case REVEL_API_ERROR_CODES.CRASH:
                    break;

                default:
                    break;
            }
        },
        getToken: function() {
            var obj = getData('token');
            obj instanceof Object && this.set('token', obj.token);
        },
        saveToken: function() {
            setData('token', {token: this.get('token')});
        },
        authenticate: function(user, pwd, cb) {
            this.request('authenticate', String(user), String(pwd), this.set.bind(this, 'token'));
        },
        saveProfile: function() {
            try {
                this.request('setData', 'profile', JSON.stringify(this.get('profile')), String(this.get('token')), this.trigger.bind(this, 'onProfileSaved'));
            } catch(e) {
                this.set('errorCode', REVEL_API_ERROR_CODES.CRASH);
                console.log('Unable save user profile', '\n', e);
            }
        },
        getProfile: function(cb) {
            cb = typeof cb == 'function' ? cb : new Function();
            this.request('getData', 'profile', String(this.get('token')), function(data) {
                try {
                    this.set('profile', JSON.parse(data));
                    cb();
                } catch(e) {
                    this.set('errorCode', REVEL_API_ERROR_CODES.CRASH);
                    console.log('Unable receive user\'s profile', '\n', e);
                }
            });
        },
        checkProfile: function(cb) {
            cb = typeof cb == 'function' ? cb : new Function();
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
        }
    });
});