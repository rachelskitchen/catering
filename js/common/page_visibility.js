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

 define([], function() {
    'use strict';

    // Set the name of the hidden property and the change event for visibility
    var hidden,
        visibilityChange;

    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    /**
     * A module representing Page Visibility API.
     * @exports page_visibility
     * @see {@link module:config.paths actual path}
     */
    return {
        /**
         * Adds a new listener.
         * @param {Function} cb - callback function
         */
        on: function(cb) {
            if (typeof document.addEventListener == "undefined" || typeof document[hidden] == "undefined") {
              return console.log("the Page Visibility API is not supported");
            }
            typeof cb == 'function' && document.addEventListener(visibilityChange, cb, false);
        },
        /**
         * Removes the listener.
         * @param {Function} cb - callback function
         */
        off: function(cb) {
            if (typeof document.removeEventListener == "undefined" || typeof document[hidden] == "undefined") {
              return console.log("the Page Visibility API is not supported");
            }
            typeof cb == 'function' && document.removeEventListener(visibilityChange, cb, false);
        }
    };
});