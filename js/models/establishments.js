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
            needShowAlert: false,
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
                var est = establishmentID * 1;
                this.meta('establishment', est); // get or set meta data of collection
            });
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
        * Check a GET-parameters. Get a status code of the app load.
        *
        * 1 - app should load view with stores list;
        * 2 - app reported about error;
        * 3 - app was loaded.
        */
        checkGETParameters: function(establishment) {
            var params = parse_get_params(), // get GET-parameters from address line
                self = this,
                savedEst = this.loadEstablishment();

            establishment = savedEst ? savedEst : (establishment || !params.brand && 1);

            if (establishment) {
                return changeEstablishment(establishment); // get or set meta data of collection
            }

            if (params.brand > 0) {
                this.meta('brand', params.brand);
                this.getEstablishments().then(function() {
                    if (self.length > 0) {
                        if (self.length === 1) {
                            changeEstablishment(self.models[0].get('id'));
                        } else {
                            self.meta('statusCode', 1); // get or set meta data of collection
                            self.trigger('loadStoresList');
                        }
                    } else {
                        self.meta('statusCode', 2); // get or set meta data of collection
                        self.trigger('showError');
                    }
                });
            } else {
                this.meta('statusCode', 2); // get or set meta data of collection
            }

            function changeEstablishment(establishment) {
                self.meta('statusCode', 3); // get or set meta data of collection
                self.trigger('changeEstablishment', establishment);
            }
        },
        /**
        * Get establishments from backend.
        */
        getEstablishments: function(is_once) {
            var dfd = Backbone.$.Deferred(),
                self = this;
            if (is_once && this.length > 0) {
                return dfd.resolve();
            }
            Backbone.$.ajax({
                url: '/weborders/locations/',
                data: {
                    brand: this.meta('brand') || 1 // default brand
                },
                dataType: 'json',
                success: function(data) {
                    self.meta('brandName', data.brand_name); // get or set meta data of collection
                    self.add(data.estabs);
                },
                complete: function() {
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
        * Set a view version (desktop or mobile).
        */
        setViewVersion: function(isMobileVersion) {
            this.getModelForView().set('isMobileVersion', isMobileVersion);
        },
        /**
        * Set a property "needShowAlert" of a model for the stores list view.
        */
        needShowAlert: function(needShowAlert) {
            this.getModelForView().set('needShowAlert', needShowAlert);
        },
        /**
         * Save establishment to session storage.
         * Used in cases when user perform payment with derirect to another page
         */
        saveEstablishment: function(establishment) {
            setData('establishments', {establishment: establishment});
        },
        /**
         * Load saved establishment from session storage
         */
        loadEstablishment: function() {
            var data = getData('establishments');
            if(data instanceof Object) {
                return data.establishment;
            }
        },
        /**
         * Remove establishment from session storage.
         * Used in cases when user has performed payment with derirect to another page and return to app
         */
        removeSavedEstablishment: function() {
            removeData('establishments');
        }
    });
})