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
    App.Models.Establishment = Backbone.Model.extend({
        defaults: {
            id: null,
            name: '',
            city: '',
            address: ''
        }
    });
    App.Collections.Establishments = App.Collections.CollectionSort.extend({
        model: App.Models.Establishment,
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
                successResp: function(data) {
                    console.log(data);
                    dfd.resolve();
                },
                error: function() {
                    console.log('ERROR');
                }
            });
            return dfd;
        }
    });
})