/**
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
 * Contains {@link App.Models.Geolocation} constructor.
 * @module geolocation
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a Geolocation model.
     * @alias App.Models.Geolocation
     * @augments Backbone.Model
     * @example
     * // create a geolocation model
     * require(['geolocation'], function() {
     *     var geolocation = new App.Models.Geolocation();
     * });
     */
    App.Models.Geolocation = Backbone.Model.extend(
    /**
     * @lends Backbone.Model.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * State of geolocation model. The model may be in the following states:
             *     - 'init': the model is initiated, {@link App.Models.Geolocation#detect_current_location detect_current_location} isn't called.
             *     - 'error-noapi': a browser doesn't support {@link https://www.w3.org/TR/geolocation-API/ GeoLocation API}.
             *     - 'complete-success': a browser successfully defined a current user location.
             *     - 'complete-error': a browser was unable to define a current user location.
             * @type {string}
             * @default 'init'
             */
            state: "init",
            /**
             * Status text.
             * @type {string}
             * @default 'Obtaining current location...'
             */
            statusText: "Obtaining current location...",
            /**
             * Current location. Format of object is
             * ```
             * {
             *     latitude: <latitude>,
             *     longitude: <longitude>
             * }
             * ```
             *
             * @type {?Object}
             * @default null
             */
            current_loc: null,
            /**
             * Timeout of current location detecting.
             * @type {number}
             * @default 60000
             */
            timeout: 60000
        },
        /**
         * @returns {?Object} Value of `current_loc` attribute.
         */
        get_current_loc: function() {
            return this.get("current_loc");
        },
        /**
         * Detects current location. {@link https://www.w3.org/TR/geolocation-API/ GeoLocation API} is used.
         * @returns {Object} Deferred object.
         */
        detect_current_location: function() {
            var self = this;
            var dfd = Backbone.$.Deferred();

            //Firefox: if the user clicks 'Not Now' the geoloc does not returns an error. Resolve dfd with timeout.
            setTimeout(function() {
                if (cssua.userAgent.firefox && dfd.state() == 'pending') {
                    self.unableDefineCurLocation({code: 1});
                    dfd.resolve();
                }
            }, this.get('timeout'));

            if (this.isGeolocationAPIAvailable()) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        var lat = position.coords.latitude,
                            lon = position.coords.longitude;

                        self.setCurLocation(lat, lon);
                        dfd.resolve();
                    },
                    function(error) {
                        self.unableDefineCurLocation(error);
                        dfd.resolve();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: this.get("timeout")
                    }
                );
            } else {
                this.set({
                    "state": "error-noapi",
                    "statusText": MSG.ERROR_GEOLOCATION_NOAPI
                });
                dfd.resolve();
            }

            return dfd;
        },
        /**
         * Sets current location to `current_loc` attribute and changes `state` to 'complete-success'
         */
        setCurLocation: function(lat, lon) {
            this.set({
                current_loc: { //SF coords: 37.77330126, -122.4194155
                    latitude: lat,
                    longitude: lon
                },
                state : "complete-success"
            });
        },
        /**
         * Changes `state`, `statusText` attributes.
         * - error.code == 1
         * ```
         * {
         *     state: "complete-success",
         *     statusText: <message>
         * }
         * ```
         * - error.code != 1
         * ```
         * {
         *     state: "complete-error",
         *     statusText: <message>
         * }
         * ```
         *
         * @param {Object} error - object described in {@link https://www.w3.org/TR/geolocation-API/#position_error_interface}
         */
        unableDefineCurLocation: function(error) {
            var message = (MSG.ERROR_GEOLOCATION[error.code]) ? MSG.ERROR_GEOLOCATION[error.code] : MSG.ERROR_GEOLOCATION[0];
            if (error.code == 1) {
                this.set({
                    "state": "complete-success",
                    "statusText": message
                });
            } else {
                this.set({
                    "state": "complete-error",
                    "statusText": message
                });
            }
        },
        /**
         * @returns {Object} Default coordinates specified in Directory settings:
         * ```
         * {
         *     latitude: <default latitude>,
         *     longitude: <default longitude>
         * }
         * ```
         */
        getDefaultCurrentLoc: function() {
            var lat, lon,
                dir_set = App.SettingsDirectory;

            return {
                latitude: dir_set.default_location.lat,
                longitude: dir_set.default_location.lon
            }
        },
        /**
         * @returns {boolean} `true` if `window.navigator.geolocation` exists and `false` otherwise.
         */
        isGeolocationAPIAvailable: function() {
            return 'geolocation' in window.navigator;
        }
    });
});