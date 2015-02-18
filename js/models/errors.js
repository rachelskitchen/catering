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

    App.Models.Errors = Backbone.Model.extend({
        defaults: {
            message: "",
            random_number: 0,
            reload_page: false
        },
        /**
         * User notification.
         */
        alert: function(message, reload_page) {
            reload_page = !!reload_page || false;
            message = message && message.toString() || '';
            this.set({
                message: message,
                random_number: this.random(), // generate a random number
                reload_page: reload_page
            });
            return this;
        },
        /**
         * User notification. Server return HTTP status 200, but data.status is error
         */
        alert_red: function(message, reload_page) {
            reload_page = !!reload_page || false;
            message = message && message.toString() || '';
            this.set({
                message: '<span style="color: red;"> <b>' + message + '</b> </span> <br />',
                random_number: this.random(), // generate a random number
                reload_page: reload_page,
                type: "warning"
            });
            return this;
        },
        initialize: function() {
            this.on("change", function(model) {
                // user notification
                this.view = alert_message({
                    message: model.get("message"),
                    reload_page: model.get("reload_page"),
                    type: model.get("type")
                });
            }, this);
        },
        hide: function() {
            this.view instanceof Backbone.$ && this.view.removeClass('ui-visible');
        },
        /**
         * Generate a random number.
         *
         * @return {number} a random number from 1 to 1000000.
         */
        random: function() {
            return generate_random_number(1, 1000000); // generate the random number
        }
    });
});