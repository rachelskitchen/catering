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
 * Contains {@link App.Models.Promotion}, {@link App.Collections.Promotions} constructors.
 * @module promotions
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(['backbone'], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a promotion model.
     * @alias App.Models.Promotion
     * @augments Backbone.Model
     * @example
     * // create a promotion
     * require(['promotions'], function() {
     *     var promotion = new App.Models.Promotion();
     * });
     */
    App.Models.Promotion = Backbone.Model.extend(
    /**
     * @lends App.Models.Promotion.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Campaign id.
             * @type {?string}
             * @default null
             */
            id: null,
            /**
             * Campaign name.
             * @type {string}
             * @default ''
             */
            name: '',
            /**
             * Campaign code.
             * @type {string}
             * @default ''
             */
            code: '',
            /**
             * Indicates whether the promotion is applicable.
             * @type {boolean}
             * @default false
             */
            is_applicable: false,
            /**
             * Indicates whether the promotion is applied to order.
             * @type {boolean}
             * @default false
             */
            is_applied: false
        }
    });

    /**
     * @class
     * @classdesc Represents a promotions collection.
     * @alias App.Collections.Promotions
     * @augments Backbone.Collection
     * @example
     * require(['promotions'], function() {
     *     var promotions = new App.Collections.Promotions();
     * });
     */
    App.Collections.Promotions = Backbone.Collection.extend(
    /**
     * @lends App.Collections.Promotions.prototype
     */
    {
        /**
         * Item constructor.
         * @type {Function}
         * @default App.Models.Promotion
         */
        model: App.Models.Promotion,
        /**
         * Adds listener to track changes of 'is_applied' attribute.
         */
        initialize: function() {
            this.listenTo(this, 'change:is_applied', this.radioSelection);
        },
        /**
         * When promotion is selected, deselects all other promotions (radio button behavior).
         * @param {App.Models.Promotion} model - Selected/deselected promotion.
         * @param {boolean} is_applied - model.is_applied attribute value.
         */
        radioSelection: function(model, is_applied) {
            if (is_applied) {
                this.where({is_applied: true}).forEach(function(item) {
                    if (item !== model) {
                        item.set('is_applied', false);
                    }
                });
            }
        },
        /**
         * Updates the promotions list.
         * @param {array} items - array of cart items for submitting to server.
         * @param {string} discount_code - code of applied discount.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         * @returns {Object} Deferred object.
         */
        update: function(items, discount_code, authorizationHeader) {
            return this.getPromotions(items, discount_code, authorizationHeader);
        },
        /**
         * Initialization through a json object, used after the server is requested for the promotions list.
         * @param {array} promotions - list of promotions.
         */
        addAjaxJson: function(promotions) {
            if (!Array.isArray(promotions)) return;
            var self = this,
                modelToUpdate,
                modelsToRemove = [],
                ids = [];

            promotions.forEach(function(promotion, index) {
                if (!(promotion instanceof Object)) {
                    return;
                }
                if (promotion instanceof Backbone.Model) {
                    promotion = promotion.toJSON();
                }

                ids.push(promotion.id);
                modelToUpdate = self.get(promotion.id); // update existing campaign ('is_applicable' flag could be changed)

                modelToUpdate ? modelToUpdate.set(promotion) : self.add(promotion);
            });

            // find and remove obsolete campaigns from collection
            modelsToRemove = this.filter(function(model) {
                return ids.indexOf(model.id) === -1;
            });
            this.remove(modelsToRemove);
        },
        /**
         * Loads the promotions list from backend.
         * @param {array} items - array of cart items for submitting to server.
         * @param {string} discount_code - code of applied discount.
         * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
         *
         * Used parameters of the request are:
         * ```
         * {
         *     url: '/weborders/campaigns/',
         *     type: 'POST',
         *     dataType: 'json',
         *     data: {
         *         establishmentId: <establishment id>,
         *         items: <array of cart items>
         *     }
         * }
         * ```
         *
         * @returns {object} jqXHR object, returned by $.ajax().
         */
        getPromotions: function(items, discount_code, authorizationHeader) {
            var self = this;
            items = items || [];

            this.needToUpdate = false;

            return Backbone.$.ajax({
                url: '/weborders/campaigns/',
                type: 'POST',
                dataType: 'json',
                headers: authorizationHeader,
                data: JSON.stringify({
                    establishmentId: App.Data.settings.get('establishment'),
                    items: items
                }),
                success: function(response) {
                    if (response.status === 'OK') {
                        self.addAjaxJson(response.data);
                        // apply a promotion that match the applied discount code
                        discount_code && self.applyByCode(discount_code);
                        self.trigger('promotionsLoaded');
                    }
                }
            });
        },
        /**
         * Applies a promotion that match the applied discount code.
         * @param {string} code - code of applied discount.
         * @param {boolean} [silent=true] - indicates whether to use silent mode.
         */
        applyByCode: function(code, silent) {
            silent !== undefined || (silent = true);
            var model = this.findWhere({code: code, is_applicable: true});
            model && model.set('is_applied', true, {silent: silent});
        }
    });

    /**
     * Loads the promotions list.
     * @static
     * @alias App.Collections.Promotions.init
     * @param {array} items - array of cart items for submitting to server.
     * @param {string} discount_code - code of applied discount.
     * @param {Object} authorizationHeader - result of {@link App.Models.Customer#getAuthorizationHeader App.Data.customer.getAuthorizationHeader()} call
     * @returns {Object} Deferred object.
     */
    App.Collections.Promotions.init = function(items, discount_code, authorizationHeader) {
        var promotions = new App.Collections.Promotions();
        promotions.fetching = promotions.getPromotions(items, discount_code, authorizationHeader);
        return promotions;
    };

});
