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

define(["backbone"], function(Backbone) {
    'use strict';

    var ERROR_TYPE = 'Error',
        ERROR_JS_RUNTIME = 'JS Runtime',
        ERROR_AJAX = 'Ajax Request',
        ERROR_IMAGE = 'Image load';

    App.Models.Log = Backbone.Model.extend({
        defaults: {
            timeout: 2000,
            messages: []
        },
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
        pushJSError: function(message, file, line) {
            this.push(ERROR_TYPE, {
                type: ERROR_JS_RUNTIME,
                message: message,
                file: file,
                line: line
            });
        },
        pushAjaxError: function(url, state, message) {
            this.push(ERROR_TYPE, {
                type: ERROR_AJAX,
                url: url,
                state: state,
                message: message
            });
        },
        pushImageError: function(url) {
            this.push(ERROR_TYPE, {
                type: ERROR_IMAGE,
                url: url
            });
        },
        sendLog: function(messages) {
            var self = this;
            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                var messages = self.get('messages');
                if(messages.length == 0) return;
                console.log(messages);
                var dimensionValue = JSON.stringify(messages);
                ga('send', 'pageview', {'dimension1': dimensionValue});
                self.set('messages', []);
            }, this.get('timeout'));
        },
        getMeta: function() {
            return {
                time: (new Date).toString(),
                link: window.location.href,
                language: window.navigator.language,
                cookieEnabled: window.navigator.cookieEnabled,
                storageEnabled: storage(localStorage),
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