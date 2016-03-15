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

/**
 * Contains {@link App.Models.ModelForCoreEstablishmentsMainView}, {@link App.Models.Establishment},
 * {@link App.Collections.Establishments} constructors.
 * @module establishments
 * @requires module:backbone
 * @requires module:collection_sort
 * @see {@link module:config.paths actual path}
 */
define(['backbone', 'collection_sort'], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a model for establishment selection.
     * @alias App.Models.ModelForCoreEstablishmentsMainView
     * @augments Backbone.Model
     * @example
     * // create an establishment selection model
     * require(['establishments'], function() {
     *     var establishmentSelection = new App.Models.ModelForCoreEstablishmentsMainView();
     * });
     */
    App.Models.ModelForCoreEstablishmentsMainView = Backbone.Model.extend(
    /**
     * @lends App.Models.ModelForCoreEstablishmentsMainView.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * Mobile version or not
             * @type {boolean}
             */
            isMobileVersion: false,
            /**
             * Store is defined or not.
             * @type {boolean}
             */
            storeDefined: false,
            /**
             * Need to show footer.
             * @type {boolean}
             */
            showFooter: false,
            /**
             * Need to show an alert.
             * @type {boolean}
             */
            needShowAlert: false,
            /**
             * Client name.
             * @type {?string}
             */
            clientName: null
        },
    });

    /**
     * @class
     * @classdesc Represents an establishment.
     * @alias App.Models.Establishment
     * @augments Backbone.Model
     * @example
     * // create an establishment model
     * require(['establishments'], function() {
     *     var establishment = new App.Models.Establishment();
     * });
     */
    App.Models.Establishment = Backbone.Model.extend({});

    /**
     * @class
     * @classdesc Represents a collection of establishments.
     * @alias App.Collections.Establishments
     * @augments App.Collections.CollectionSort
     * @example
     * // create an establishments
     * require(['establishments'], function() {
     *     var establishments = new App.Collections.Establishments();
     * });
     */
    App.Collections.Establishments = App.Collections.CollectionSort.extend(
    /**
     * @lends App.Collections.Establishments.prototype
     */
    {
        /**
         * Item constructor
         * @type {Function}
         * @default {@link App.Models.Establishment}
         */
        model: App.Models.Establishment,
        /**
         * Sets 'modelForView' meta data
         * and adds listener on 'changeEstablishment' event that updates 'establishment' meta data.
         */
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
         * Gets meta data or sets a new value if `value` parameter is present.
         * @param {string} prop - meta data name.
         * @param {*} [value] - value of meta data.
         * @return {(undefined|*)} A value if `value` parameter is undefined.
         */
        meta: function(prop, value) {
            if (value === undefined) {
                return this._meta[prop];
            } else {
                this._meta[prop] = value;
            }
        },
        /**
         * Checks GET parameters:
         * - If `brand` GET parameter exists need to get establishments list to allow an user select an establishment.
         * - If `brand` GET parameter doesn't exist need to specify an establishment (`establishment` GET parameter or `1` by default).
         *
         * As a result, 'statusCode' meta value should be changed on:
         * - `1` - the app has to show a view with stores list;
         * - `2` - the app has to notify about an error;
         * - `3` - the app has specified an establishment (it should restart the app without page reload).
         *
         * @param {number} [establishment]=1 - establishment id
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
         * Gets establishments. Request parameters:
         * ```
         * url: '/weborders/locations/',
         * data: {
         *     brand: this.meta('brand') || 1 // default brand
         * },
         * dataType: 'json'
         * ```
         * @param {boolean} [is_once=false] - need to perform only at first time (further calls shouldn't send requests).
         * @returns {Object} Deferred object.
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
                    data = data[0]; // weborder/locations/ returns array (Bug 38889)
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
        * Get a brand name from meta data. 'brandName' meta data is used.
        * @returns  {string} Brand name.
        */
        getBrandName: function() {
            return this.meta('brandName');
        },
        /**
         * Get a model for the stores list view. 'modelForView' meta data is used.
         * @returns {App.Models.ModelForCoreEstablishmentsMainView} Establishment selection model.
         */
        getModelForView: function() {
            return this.meta('modelForView');
        },
        /**
         * Gets an establishment ID. 'establishment' meta data is used.
         * @returns {number} Establishment ID specified in the app.
         */
        getEstablishmentID: function() {
            return this.meta('establishment');
        },
        /**
         * Sets a view version (desktop or mobile).
         * @param {boolean} isMobileVersion - `true` if it's mobile version.
         */
        setViewVersion: function(isMobileVersion) {
            this.getModelForView().set('isMobileVersion', isMobileVersion);
        },
        /**
         * Sets `needShowAlert` attribute of a model for the stores list view.
         * @param {boolean} needShowAlert - `true` if need to show an alert.
         */
        needShowAlert: function(needShowAlert) {
            this.getModelForView().set('needShowAlert', needShowAlert);
        },
        /**
         * Saves an establishment to session storage. 'establishments' key is used.
         * Used in cases when user perform payment with redirect to another page.
         */
        saveEstablishment: function(establishment) {
            setData('establishments', {establishment: establishment});
        },
        /**
         * Restores saved establishment from session storage.
         * @returns {number} Establishment ID if 'establishments' entry exists in session storage.
         */
        loadEstablishment: function() {
            var data = getData('establishments');
            if(data instanceof Object) {
                return data.establishment;
            }
        },
        /**
         * Removes establishment in session storage. 'establishments' key is used.
         * Used in cases when user performed a payment with redirect to another page then returned to the app.
         */
        removeSavedEstablishment: function() {
            removeData('establishments');
        }
    });
})