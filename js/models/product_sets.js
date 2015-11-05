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

define(["backbone", 'products', 'collection_sort', 'myorder'], function(Backbone) {
    'use strict';

    //  ---- Combo products model arhitecture -----
    //
    //    App.Data.myorder [* (Collections.Myorder)
    //                      |
    //      Models.Myorder  * -- product { is_combo = true,
    //                      |             product_sets [* (Collections.ProductSets) }
    //                      *]                          |
    //                                Models.ProductSet * -- order_products [* (Backbone.Collection)
    //                                                  |                    |
    //                                                  *]                   * (Models.Myorder) - {  modifiers,
    //                                                                       |                       product, (Models.Product)
    //                                                                       *]                      is_selected: true/false,
    //                                                                                               quantity }

    /**
     * @class
     * Represents product set model
     */
    App.Models.ProductSet = Backbone.Model.extend({
        /**
         * @property {object} defaults - literal object containing attributes with default values.
         *
         * @property {string} defaults.name - name of the product set.
         * @default null
         *
        */
        defaults: {
            name: null,
            id: null,
            is_combo_saving : false,
            combo_parent_id : null, //id of the root combo product
            order_products : null,
            minimum_amount : 1,
            maximum_amount : 1
        },
        addJSON: function(data) {
            var self = this, product;

            data.minimum_amount = data.quantity ? data.quantity : 2,
            data.maximum_amount = data.quantity ? data.quantity : 2
            this.set(data);

            var order_products = new Backbone.Collection();

            data['products'].forEach(function(p_data) {
                p_data.attribute_type = 0; // no inventory for combo products now
                p_data.compositeId = p_data.id + '_' + p_data.id_category;
                var json = {
                    product: p_data,
                    modifiers: p_data.modifier_classes ? p_data.modifier_classes : []
                }

                var order_product = new App.Models.Myorder();
                order_product.addJSON(json);
                order_products.add(order_product);
            });
            self.set('order_products', order_products);
        },
        /*
        *
        *  get selected modifiers quantity
        */
        get_selected_qty: function() {
            var qty = 0;
            var products = this.get("order_products");
            products.where({selected: true}).forEach(function(order_product) {
                qty += order_product.get("quantity");
            });
            return qty;
        }
    });

    /**
     * @class
     * Represents collection of several product sets.
     */
    App.Collections.ProductSets = Backbone.Collection.extend({
        model: App.Models.ProductSet,
         /**
         * Find combo products by product_id.
         */
        find_combo_products: function(product_id) {
            return this.find({'combo_parent_id': product_id});
        },
        /**
         * Get combo products from backend.
         */
        get_product_sets: function(product_id) {
            var self = this,
                fetching = new $.Deferred(); // Pointer that all data loaded

            $.ajax({
                url: App.Data.settings.get("host") + "/weborders/product_sets/", //"/weborders/combo_products/",
                data: {
                    product: product_id,
                    establishment: App.Data.settings.get("establishment")
                },
                dataType: "json",
                successResp: function(data) {
                    data.forEach(function(pset, index) {
                        pset.combo_parent_id = product_id;
                        var prod_set = new App.Models.ProductSet();
                        prod_set.addJSON(pset);
                        self.add(prod_set);
                    });

                    fetching.resolve();
                },
                error: function() {
                    self.onProductsError();
                }
            });
            return fetching;
        },
        /**
         * @method
         * Handles failure response of /product_sets request.
         */
        onProductsError: function() {
            App.Data.errors.alert(MSG.ERROR_PRODUCTS_LOAD, true);
        },
        /**
         * clone product sets
         */
        /* clone: function() {
            var newBlock = new App.Collections.ProductSets();
            this.each(function(modifierBlock) {
               newBlock.add(modifierBlock.clone()) ;
            });
            return newBlock;
        }, */
    });

    App.Collections.ProductSets.init = function(product_id) {
        var load = $.Deferred();

        if (App.Data.productSets[product_id] === undefined ) {
            App.Data.productSets[product_id] = new App.Collections.ProductSets;
            load = App.Data.productSets[product_id].get_product_sets(product_id);
        } else {
            load.resolve();
        }

        return load;
    };
});
