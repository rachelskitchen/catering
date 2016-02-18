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

var is_browser_unsupported = false;
var is_minimized_version = false;

requirejs.config({
    baseUrl: "base",
    /**
     * Contains short names for all base modules used in the app.
     * All modules names in the documentation correspond keys of this object.
     *
     * @type {object}
     * @static
     * @enum {string}
     */
    paths: {
        app: "js/app",
        config: "js/config",
        jquery: "js/libs/jquery/jquery",
    },

    deps: ["jquery", "base/js/mainTestAuto.js"],

    callback: function() {
        console.log("require callback =>");
        var self = this;
        $(window).on("StartTesting", function() {
            console.log("All tests loaded!!! starting karma...");
            window.__karma__.start.apply(self, arguments);
        });
    }
});
