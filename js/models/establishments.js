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

define(['backbone', 'collection_sort'], function(Backbone) {
    'use strict';
    App.Models.Establishment = Backbone.Model.extend({});
    App.Collections.Establishments = App.Collections.CollectionSort.extend({
        model: App.Models.Establishment,
        initialize: function() {
            this._meta = {};
        },
        /**
        * Get or set meta data of collection.
        */
        meta: function(prop, value) {
            if (value === undefined) {
                return this._meta[prop];
            } else {
                this._meta[prop] = value;
            }
        },
        /**
        * Get establishments from backend.
        */
        getEstablishments: function() {
            var self = this;
            var dfd = $.Deferred();
            $.ajax({
                url: App.Data.settings.get('host')+'/weborders/locations/',
                data: {
                    brand: App.Data.settings.get('brand')
                },
                dataType: 'json',
                /*
                successResp: function(data) {
                    self.meta('brandName', data.brand_name);
                    var establishments = data.establishments;
                    for (var i = 0; i < establishments.length; i++) {
                        self.add(establishments[i]);
                    }
                    dfd.resolve();
                },
                */
                // temp code (begin)
                success: function(data) {
                    if (data.length > 0) {
                        data.brand_name = 'MLB';
                        self.meta('brandName', data.brand_name);
                        var establishments = data[0].estabs;
                        for (var i = 0; i < establishments.length; i++) {
                            self.add(establishments[i]);
                        }
                    }
                    dfd.resolve();
                },
                // temp code (end)
                error: function() {
                    App.Data.errors.alert(MSG.ERROR_ESTABLISHMENTS_LOAD, true); // user notification
                }
            });
            return dfd;
        },
        /**
        * Get a brand name.
        */
        getBrandName: function() {
            return this.meta('brandName'); // get or set meta data of collection
        }
    });
})