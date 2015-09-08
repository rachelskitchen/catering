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

    /**
     * @class
     * Represents header model.
     */
    App.Models.HeaderModel = Backbone.Model.extend({
        /**
         * @property {object} defaults - literal object containing attributes with default value
         *
         * @propery {string} defaults.page_title - header title.
         * @default ''.
         *
         * @property {number} defaults.tab - active header tab.
         * @default 0.
         *
         * @property {string} default.link_title - header link button text.
         * @default ''.
         *
         * @property {Function} default.link - header link button action.
         * @default null.
         *
         * @property {Function} default.back - header back button action.
         * @default null.
         *
         * @property {Function} default.cart - header cart button action.
         * @default null.
         *
         * @property {nummber} default.cartItemsQuantity - cart items quantity.
         * @default 0.
         *
         * @property {string} default.search - search string.
         * @default ''.
         *
         * @property {boolean} default.showSearch - show/hide search.
         * @default false.
         *
         * @property {Function} default.addProductCb - callback that is called after a product is added to cart.
         * @default null.
         */
        defaults: {
            page_title: '',
            tab: 0,
            link_title: '',
            link: null,
            back: null,
            cart: null,
            cartItemsQuantity: 0,
            search: '',
            showSearch: false,
            addProductCb: null
        },
        addProduct: function(orderItem) {
            var self = this,
                check = orderItem.check_order(),
                addProductCb = this.get('addProductCb');

            if (check.status === 'OK') {
                orderItem.get_product().check_gift(function() {
                    App.Data.myorder.add(orderItem);
                    self.set({
                        link: self.defaults.link,
                        link_title: self.defaults.link_title,
                        page_title: _loc.PRODUCT_ADDED
                    });
                    window.history.replaceState({}, '', '#modifiers/' + (App.Data.myorder.length - 1));
                    typeof addProductCb == 'function' && addProductCb();
                }, function(errorMsg) {
                    App.Data.errors.alert(errorMsg); // user notification
                });
            } else {
                App.Data.errors.alert(check.errorMsg); // user notification
            }
        },
        updateProduct: function(orderItem, originOrderItem) {
            var self = this,
                check = orderItem.check_order();

            this.set('back', function() {
                orderItem.update(originOrderItem);
                self.set('back', window.history.back.bind(window.history), {silent: true});
                window.history.back();
            });

            if (check.status === 'OK') {
                orderItem.get_product().check_gift(function() {
                    self.set({
                        link: self.defaults.link,
                        link_title: self.defaults.link_title,
                        page_title: _loc.PRODUCT_UPDATED,
                        cartItemsQuantity: App.Data.myorder.get_only_product_quantity()
                    });
                    // App.Data.myorder.remove(orderItem);
                    // App.Data.myorder.add(updatedOrderItem, {at: index});
                }, function(errorMsg) {
                    App.Data.errors.alert(errorMsg); // user notification
                });
            } else {
                App.Data.errors.alert(check.errorMsg); // user notification
            }
        },
        performSearch: function() {
            var search = this.get('search');
            if(search) {
                App.Data.router.navigate('search/' + encodeURIComponent(search), true);
            }
        }
    });
});