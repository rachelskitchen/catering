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

    App.Models.Delivery = Backbone.Model.extend({
        defaults: {
            charge: 0, // delivery cost
            enable: false, // enable delivery for online ordering apps
            max_distance: 0, // delivery max distance
            min_amount: 0 // min total amount for delivery enable. Only sum of products and modifiers
        },
        initialize: function(opts) {
            var settings = App.Data.settings.get('settings_system'),
                set = {
                    charge: settings.delivery_charge,
                    enable: settings.delivery_for_online_orders,
                    delivery_post_code_lookup_enabled: settings.delivery_post_code_lookup[0],
                    delivery_post_codes: settings.delivery_post_code_lookup[1],
                    delivery_geojson_enabled: settings.delivery_geojson[0],
                    max_distance: settings.max_delivery_distance,
                    min_amount: settings.min_delivery_amount
                };

            opts = opts instanceof Object ? opts : {};
            this.set($.extend({}, this.defaults, set, opts));
        }
    });
});
