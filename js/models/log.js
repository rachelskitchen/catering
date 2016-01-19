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
 * Contains {@link App.Models.Log} constructor.
 * @module log
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    var ERROR_TYPE = 'Error',
        ERROR_JS_RUNTIME = 'JS Runtime',
        ERROR_AJAX = 'Ajax Request',
        ERROR_IMAGE = 'Image load';

    /**
     * @class
     * @classdesc Represents a model for logging.
     * @alias App.Models.Log
     * @augments Backbone.Model
     * @example
     * // create a logger model
     * require(['log'], function() {
     *     var log = new App.Models.Log();
     * });
     */
    App.Models.Log = Backbone.Model.extend(
    /**
     * @lends App.Models.Log.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * Delay for logging. It allows to collect multiple events for this period.
             * @type {number}
             */
            timeout: 2000,
            /**
             * Messages to log.
             * @typ {Array}
             */
            messages: []
        },
        /**
         * Logs messages after initialization.
         * @param {Object} opts - options
         * @param {Array} opts.init - array of messages that should be logged after initialization.
         */
        initialize: function(opts) {
            if(opts && Object.prototype.toString.call(opts.init) === '[object Array]') {
                for(var i = 0, j = opts.init.length; i < j; i++) {
                    var message = opts.init[i];
                    if(!(message instanceof Object)) return;

                    switch(message.logType) {
                        case ERROR_TYPE:
                            this.pushJSError(message.message, message.file, message.line);
                            break;
                    }

                }
                this.sendLog();
            }
            this.unset('init');
        },
        /**
         * Adds a new message to `messages`.
         * @param {string} type - message type ('Error', 'JS Runtime', 'Ajax Request', 'Image load')
         * @param {Object} data - message data.
         */
        push: function(type, data) {
            var messages = this.get('messages');
            try {
                messages.push(JSON.stringify({
                    type: type,
                    data: data,
                    meta: this.getMeta()
                }));
            }
            catch(error) {
                var msgData = "",
                    msg = data.message;

                if (msg instanceof Event){
                    var target = msg.target ? msg.target : msg.srcElement ? msg.srcElement : undefined;
                    if (target) {
                       msgData += "outerHTML=" + target.outerHTML + ", ";
                    }
                }
                for (var prop in msg) {
                    msgData += prop + "=" + msg[prop] + ", ";
                }
                messages.push(JSON.stringify({
                    type: type,
                    data: msgData,
                    meta: this.getMeta()
                }));
            }
            this.sendLog();
        },
        /**
         * Adds javascript error to `messages`.
         * @param {string} message - error message
         * @param {string} file - name of source in which an error occurred
         * @param {number} line - line on which an error occurred
         */
        pushJSError: function(message, file, line) {
            this.push(ERROR_TYPE, {
                type: ERROR_JS_RUNTIME,
                message: message,
                file: file,
                line: line
            });
        },
        /**
         * Adds XMLHTTRequest error to `messages`.
         * @param {string} url - request url
         * @param {string} state - request state
         * @param {string} message - error message
         */
        pushAjaxError: function(url, state, message) {
            this.push(ERROR_TYPE, {
                type: ERROR_AJAX,
                url: url,
                state: state,
                message: message
            });
        },
        /**
         * Adds image loading error to `messages`.
         * @param {string} url - image url
         */
        pushImageError: function(url) {
            this.push(ERROR_TYPE, {
                type: ERROR_IMAGE,
                url: url
            });
        },
        /**
         * Outputs messages in console. Sends logs to google analytics. Performs these actions with `timeout` delay.
         */
        sendLog: function() {
            var self = this;
            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                var messages = self.get('messages');
                if(messages.length == 0) return;
                console.log(messages);
                var dimensionValue = JSON.stringify(messages);
                (typeof ga == 'function') && ga('send', 'pageview', {'dimension1': dimensionValue});
                self.set('messages', []);
            }, this.get('timeout'));
        },
        /**
         * Collects the app state data.
         * @returns {Object} Object literal containing following properties:
         * - `time` - time when an error occurred.
         * - `link` - the app url.
         * - `language` - browser language.
         * - `cookieEnabled` - cookies is enabled or disabled.
         * - `storageEnabled` - LocalStorage API is enabled of disabled.
         * - `userAgent` - user agent.
         * - `vendor` - browser vendor.
         * - `screen` - screen dimensions
         */
        getMeta: function() {
            var storageEnabled = false;
            // Chrome 41.0.2272.118 throws DOMException when user uses localStorage identificator.
            // Due to it need to define storageEnabled catching exceptions.
            try {
                storageEnabled = storage(localStorage);
            } catch(e) {}
            return {
                time: (new Date).toString(),
                link: window.location.href,
                language: window.navigator.language,
                cookieEnabled: window.navigator.cookieEnabled,
                storageEnabled: storageEnabled,
                userAgent: window.navigator.userAgent,
                vendor: window.navigator.vendor,
                screen: window.screen
            }
        }
    });

    function storage(s) {
        try{
            s.setItem('test', 1);
            s.removeItem('test');
            return true;
        } catch(e) {
            return false;
        }
    }
});