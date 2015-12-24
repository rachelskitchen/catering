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

    App.Models.HeaderModel = Backbone.Model.extend({
        defaults: {
            page_title: "",
            img: App.Data.settings.get("img_path"),
            logo: "/_blank.png", // if server returns 'logo: null' need set fake image src that doens't exist (Bug #14189)
            business_name: "",
            menu_index: 0,
            isShowPromoMessage: false
        },
        initialize: function() {
            var settings = App.Data.settings.toJSON(),
                settings_system = settings.settings_system;

            if(settings_system instanceof Object) {
                typeof settings_system.logo_img == 'string' && this.set('logo', addHost(settings_system.logo_img, settings.host));
                typeof settings_system.business_name == 'string' && this.set('business_name', settings_system.business_name);
            }
        }
    });
});