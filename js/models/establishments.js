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
    App.Models.ModelForCoreEstablishmentsMainView = Backbone.Model.extend({
        defaults: {
            isMobileVersion: false,
            storeDefined: false,
            showFooter: false,
            clientName: null
        },
    });
    App.Models.Establishment = Backbone.Model.extend({});
    App.Collections.Establishments = App.Collections.CollectionSort.extend({
        model: App.Models.Establishment,
        initialize: function() {
            this._meta = {};
            var modelForView = new App.Models.ModelForCoreEstablishmentsMainView();
            this.meta('modelForView', modelForView); // get or set meta data of collection
            this.listenTo(this, 'changeEstablishment', function(establishmentID) {
                this.meta('establishment', establishmentID * 1); // get or set meta data of collection
            });
            this.checkGETParameters(); // check a GET-parameters
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
        * Check a GET-parameters.
        */
        checkGETParameters: function() {
            var params = parse_get_params(), // get GET-parameters from address line
                self = this;
            if (params.establishment || (!params.establishment && !params.brand)) {
                this.meta('statusCode', 3); // get or set meta data of collection
            } else {
                if (!isNaN(params.brand) && params.brand > 0) {
                    App.Data.settings.set('brand', params.brand);
                    this.meta('statusCode', 1); // get or set meta data of collection
                } else {
                    this.meta('statusCode', 2); // get or set meta data of collection
                }
            }
        },
        /**
        * Get establishments from backend.
        */
        getEstablishments: function() {
            var dfd = Backbone.$.Deferred(),
                self = this;
            App.Data.settings.ajaxSetup(); // AJAX-requests settings
            Backbone.$.ajax({
                url: App.Data.settings.get('host') + '/weborders/locations/',
                data: {
                    brand: App.Data.settings.get('brand')
                },
                dataType: 'json',
                successResp: function(data) {
                    self.meta('brandName', data.brand_name); // get or set meta data of collection
                    var establishments = data.establishments;
                    for (var i = 0; i < establishments.length; i++) {
                        self.add(establishments[i]);
                    }
                    dfd.resolve();
                },
                errorResp: function() {
                    dfd.resolve();
                }
            });
            return dfd;
        },
        /**
        * Get a brand name.
        */
        getBrandName: function() {
            return this.meta('brandName'); // get or set meta data of collection
        },
        /**
        * Get a model for the stores list view.
        */
        getModelForView: function() {
            return this.meta('modelForView'); // get or set meta data of collection
        },
        /**
        * Get a establishment's ID.
        */
        getEstablishmentID: function() {
            return this.meta('establishment'); // get or set meta data of collection
        },
        /**
        * Get a status code of the app load.
        *
        * 1 - app should load view with stores list;
        * 2 - app reported about error;
        * 3 - app was loaded.
        */
        getStatusCode: function() {
            var self = this,
                status = this.meta('statusCode'); // get or set meta data of collection
            if (status === 1 && this.models.length === 0) {
                this.getEstablishments().then(function() {
                    if (self.length > 0) {
                        if (self.length === 1) {
                            self.meta('statusCode', 3); // get or set meta data of collection
                            self.trigger('changeEstablishment', self.models[0].get('id'));
                        } else {
                            self.meta('statusCode', 1); // get or set meta data of collection
                            self.trigger('loadStoresList');
                        }
                    } else {
                        self.meta('statusCode', 2); // get or set meta data of collection
                        self.trigger('showError');
                    }
                });
            }
            return status;
        },
        /**
        * Set a view version (desktop or mobile).
        */
        setViewVersion: function(isMobileVersion) {
            this.getModelForView().set('isMobileVersion', isMobileVersion);
        }
    });
})