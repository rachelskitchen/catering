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
 * Contains {@link App.Models.Promotion}, {@link App.Models.Promotions} constructors.
 * @module promotions
 * @requires module:backbone
 * @requires module:collection_sort
 * @see {@link module:config.paths actual path}
 */
define(['backbone', 'collection_sort'], function(Backbone) {
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
             * Campaign name.
             * @type {?string}
             */
            name: '',
            /**
             * Campaign code.
             * @type {?string}
             */
            code: '',
            /**
             * Campaign barcode.
             * @type {?string}
             */
            barcode: '',
            /**
             * Indicates whether the promotion is applicable.
             * @type {boolean}
             */
            is_applicable: false,
            /**
             * Indicates whether the promotion is applied to order.
             * @type {boolean}
             */
            is_applied: false
        },
        /**
         * Adds listener to track `is_applied` change and trigger `onApplyPromotion` event on {@link App.Models.Promotions.avaiable}.
         */
        initialize: function() {
            var self = this,
                myorder = App.Data.myorder,
                checkout = myorder.checkout;

            this.listenTo(this, 'change:is_applied', function() {
                // promotion is seleted
                if (this.get('is_applied')) {
                    this.collection.trigger('onPromotionApply', this);

                    if (!/^[\d\w]{1,200}$/.test(this.get('code')) ) {
                        App.Data.errors.alert(MSG.ERROR_INCORRECT_DISCOUNT_CODE);
                        return;
                    }
                    checkout.set('discount_code', this.get('code'));
                    myorder.get_cart_totals({apply_discount: true});
                }
                // promotion is unselected
                else {
                    checkout.set({
                        last_discount_code: '',
                        discount_code: ''
                    });
                    myorder.get_cart_totals();
                }
            });
        }
    });

    var promotionsCollection = Backbone.Collection.extend({
        model: App.Models.Promotion,
    });

    /**
     * @class
     * @classdesc Represents a promotions collection.
     * @alias App.Collections.Promotions
     * @augments Backbone.Collection
     * @example
     * require(['promotions'], function() {
     *     var promotions = new App.collections.Promotions();
     * });
     */
    App.Collections.Promotions = Backbone.Collection.extend(
    /**
     * @lends App.Models.Promotion.prototype
     */
    {
        /**
         * Item constructor.
         * @type {Function}
         * @default App.Models.Promotion
         */
        model: App.Models.Promotion,
        /**
         * Loads the promotions list.
         */
        initialize: function() {
            this.listenTo(this, 'onPromotionApply', function(appliedPromotion) {
                // unselect previously selected promotion
                var applied = this.filter(function(promotion) {
                    return promotion.cid != appliedPromotion.cid && promotion.get('is_applied');
                });
                applied.length && _.invoke(applied, 'set', 'is_applied', false);
            });

            this.getPromotions();
        },
        getPromotions: function() {
            var self = this,
                fetching = Backbone.$.Deferred(); // pointer that all data is loaded

            Backbone.$.ajax({
                url: '/weborders/campaigns/',
                type: 'POST',
                data: JSON.stringify({
                    establishmentId: App.Data.settings.get('establishment')
                }),
                dataType: 'json',
                success: function(response) {
                    if (response.status === 'OK') {
                        response.data.forEach(function(promotion, index) {
                            self.add(promotion);
                        });
                        fetching.resolve();
                        self.trigger('promotionsLoaded');
                    }
                },
                error: function() {
                    return App.Data.errors.alert(MSG.ERROR_PROMOTIONS_LOAD, true);
                }
            });
            return fetching;
        }
    });

});