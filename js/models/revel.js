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

    var REVEL_INTERFACE_NAME = 'RevelAPI',
        RevelAPI;

    App.Models.RevelAPI = Backbone.Model.extend({
        initialize: function() {
            App.Settings.RevelAPI = this.isAvailable();
        },
        isAvailable: function() {
            return (cssua.ua.android && REVEL_INTERFACE_NAME in window) || (cssua.ua.ios && cssua.ua.webview);
        },
        performRequest: function() {
            if(arguments.length < 2) {
                return;
            }
            try {
                if(cssua.ua.android) {
                    var cb = arguments[arguments.length - 1],
                        method = arguments[0],
                        obj = window[REVEL_INTERFACE_NAME],
                        args = Array.prototype.slice.call(arguments, 1, -1);
                    cb(obj[method].apply(obj, args));
                } else if(cssua.ua.ios) {
                    window.location = Array.prototype.join.call(arguments, '/');
                }
            } catch(e) {
                console.error(e);
            }
        }
    });

});