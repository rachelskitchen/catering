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
         * Adds listener to track when some promotion gets applied and unselect previously selected promotion
         * (assume that only 1 promotion can be applied).
         */
        initialize: function() {
            this.listenTo(this, 'change:is_applied', function(appliedPromotion) {
                if (appliedPromotion.get('is_applied')) {
                    var applied = this.filter(function(promotion) {
                        return promotion.cid != appliedPromotion.cid && promotion.get('is_applied');
                    });
                    applied.length && _.invoke(applied, 'set', 'is_applied', false);
                }
            });
        },
        /**
         * Updates the promotions list.
         * @param {array} items - list of order items for submitting to server.
         * @returns {Object} Deferred object.
         */
        update: function(items) {
            return this.getPromotions(items);
        },
        /**
         * Initialization through a json object, used after the server is requested for promotions list.
         * @param {array} promotions - list of promotions.
         */
        addAjaxJson: function(promotions) {
            if (!Array.isArray(promotions)) return;
            var self = this,
                modelToUpdate;

            promotions.forEach(function(promotion, index) {
                if (!(promotion instanceof Object)) {
                    return;
                }
                if (promotion instanceof Backbone.Model) {
                    promotion = promotion.toJSON();
                }

                // wrong code format
                if (!/^[\d\w]{1,200}$/.test(promotion.code)) {
                    return;
                }

                modelToUpdate = self.find(function(model) {
                    return promotion.id === model.get('id') && !_.isEqual(model.toJSON(), promotion);
                });

                modelToUpdate ? modelToUpdate.set(promotion) : self.add(promotion);
            });
        },
        /**
         * Loads the promotions list from backend.
         * @param {array} items - list of order items for submitting to server.
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
        getPromotions: function(items) {
            var self = this;
            items = items || [];

            this.needToUpdate = false;

            return Backbone.$.ajax({
                url: '/weborders/campaigns/',
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify({
                    establishmentId: App.Data.settings.get('establishment'),
                    items: items
                }),
                success: function(response) {
                    if (response.status === 'OK') {
                        self.addAjaxJson(response.data);
                        self.trigger('promotionsLoaded');
                    }
                }
            });
        }
    });

    /**
     * Loads the promotions list.
     * @static
     * @alias App.Collections.Promotions.init
     * @returns {Object} Deferred object.
     */
    App.Collections.Promotions.init = function(items) {
        var fetching = Backbone.$.Deferred();

        if (App.Data.promotions === undefined) {
            App.Data.promotions = new App.Collections.Promotions;
            fetching = App.Data.promotions.getPromotions(items);
        } else {
            fetching.resolve();
        }

        return fetching;
    };

});
