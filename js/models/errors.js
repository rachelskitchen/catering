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

define(['backbone'], function(Backbone) {
    'use strict';

    App.Models.Errors = Backbone.Model.extend({
        defaults: {
            message: '',
            random_number: 0,
            reload_page: false
        },
        initialize: function() {
            this.on('change:random_number', function(model) {
                model.trigger('alertMessage', model.toJSON());
            }, this);
        },
        /**
         * Generate a random number.
         *
         * @return {number} a random number from 1 to 1000000.
         */
        random: function() {
            return generate_random_number(1, 1000000); // generate the random number
        },
        /**
         * User notification.
         *
         * @param {string} message Alert message.
         * @param {boolean} reload_page If TRUE - reload page after pressing button.
         * @return {object} This model.
         */
        alert: function(message, reload_page, defaultView) {
            message = message && message.toString() || '';
            reload_page = !!reload_page || false;
            defaultView = !!defaultView || false;
            this.set({
                defaultView: defaultView,
                message: message,
                random_number: this.random(), // generate a random number
                reload_page: reload_page
            });
            return this;
        },
        /**
         * User notification. Server return HTTP status 200, but data.status is error.
         *
         * @param {string} message Alert message.
         * @param {boolean} reload_page If TRUE - reload page after pressing button.
         * @return {object} This model.
         */
        alert_red: function(message, reload_page) {
            reload_page = !!reload_page || false;
            message = message && message.toString() || '';
            this.set({
                message: '<span style="color: red;"> <b>' + message + '</b> </span> <br />',
                random_number: this.random(), // generate a random number
                reload_page: reload_page,
                type: 'warning'
            });
            return this;
        },
        /**
         * Hide custom alert message.
         */
        hide: function() {
            this.view instanceof Backbone.$ && this.view.removeClass('ui-visible');
        }
    });
});