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

    //  ---- Combo / Upsell products model arhitecture -----
    //
    //    App.Data.myorder [* (Collections.Myorder)
    //                      |
    //      Models.Myorder  * -- product { is_combo = true (has_upsell: true),
    //                      |              product_sets [* (Collections.ProductSets) }
    //                      *]                           |
    //                                 Models.ProductSet * -- order_products [* (Collections.ProductSetModels)
    //                                                   |                    |
    //                                                   *]                   * (Models.Myorder) - {  modifiers,
    //                                                                        |                       quantity,
    //                                                                        *]                      product (Models.Product)
    //                                                                                                selected (true/false)
    //                                                                                              }

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
            order_products : null,
            minimum_amount : 1,
            maximum_amount : 1
        },
        /**
         * initialization through a json object, used for restoring from localStorage
         */
        addJSON: function(data) {
            var self = this, ext_data, product;
            var order_products = new App.Collections.ProductSetModels();

            data['order_products'].forEach(function(p_data) {
                var json = _.extend({}, p_data, {
                    product: p_data.product,
                    modifiers: p_data.modifiers
                });
                var order_product = new App.Models.Myorder();
                order_product.addJSON(json);
                order_products.add(order_product);
            });
            ext_data = _.extend({}, data, ext_data);
            ext_data['order_products'] = order_products;
            this.set(ext_data);
        },
        /**
         * initialization through a json object
         */
        addAjaxJSON: function(data) {
            var self = this, ext_data = {}, product;

            ext_data.minimum_amount = data.quantity ? data.quantity : 1;
            ext_data.maximum_amount = data.quantity ? data.quantity : 1;

            var order_products = new App.Collections.ProductSetModels();

            data['products'].forEach(function(p_data) {
                p_data.compositeId = p_data.id + '_' + p_data.id_category;
                var json = {
                    product: p_data,
                    modifiers: p_data.modifier_classes ? p_data.modifier_classes : [],
                }
                delete p_data.modifier_classes;

                var order_product = new App.Models.Myorder();
                order_product.addJSON(json);
                order_product.set({
                    sum: order_product.get_modelsum(), // sum with modifiers
                    initial_price: order_product.get_initial_price(),
                    is_child_product: true
                });
                order_product.update_prices();
                order_products.add(order_product);

            });
            ext_data['order_products'] = order_products;

            ext_data = _.extend({}, data, ext_data);
            delete ext_data['products'];
            this.set(ext_data);
        },
        /*
        *  get selected modifiers quantity
        */
        get_selected_qty: function() {
            var qty = 0;
            var products = this.get("order_products");
            products.where({selected: true}).forEach(function(order_product) {
                qty += order_product.get("quantity");
            });
            return qty;
        },
        /**
         * clonning product set
         */
        clone: function() {
            return this.deepClone();
        },
        /**
         * get json for cart_totals/create_order_and_pay requests
         */
        item_submit: function(for_discount) {
            var json = {
                   id: this.get('id'),
                   name: this.get('name'),
                   products: []
                }
            this.get('order_products').each(function(model) {
                if(model.get('selected')) {
                    json.products.push(model.item_submit(for_discount));
                }
            });
            return json;
        },
        /**
         * get all selected products
         */
        get_selected_products: function() {
            return this.get('order_products').filter(function(model) {
                return model.get('selected') == true;
            });
        }
    });

    App.Collections.ProductSetModels = Backbone.Collection.extend({
        clone: function() {
            return this.deepClone();
        }
    });

    /**
     * @class
     * Represents collection of several product sets.
     */
    App.Collections.ProductSets = Backbone.Collection.extend({
        model: App.Models.ProductSet,
        typeName: "ProductSets",
        /**
         * Get product sets info from server.
         * @param {number} product_id - product id
         * @param {number} combo_type - 'combo' or 'upsell'
         * @returns {$.Deffered} - deferred object that is resolved when the request is processed.
         */
        get_product_sets: function(product_id, combo_type) {
            var self = this,
                fetching = new $.Deferred(); // Pointer that all data loaded

            $.ajax({
                url: App.Data.settings.get("host") + "/weborders/" + (combo_type == 'combo' ? "product_sets/" : "product_upcharge/"),
                data: {
                    product: product_id
                },
                dataType: "json",
                successResp: function(data) {
                    var product_sets = combo_type == 'combo' ? data : data['slots'];
                    product_sets.forEach(function(pset, index) {
                        var prod_set = new App.Models.ProductSet();
                        prod_set.addAjaxJSON(pset);
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
         * initialization through a json object
         */
        addJSON: function(data) {
            var self = this;
            data.forEach(function(pset, index) {
                    var prod_set = new App.Models.ProductSet();
                    prod_set.addJSON(pset);
                    self.add(prod_set);
                });
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
        clone: function() {
            return this.deepClone();
        },
        /**
         * get all selected products and return them as a single collection
         */
        get_selected_products: function() {
            var array = [];
            this.each( function(model){
               array = array.concat(model.get_selected_products());
            });
            return new App.Collections.ProductSetModels(array);
        },
        /**
         * find product in product sets by product id
         */
        find_product: function(id_product) {
            var product;
            this.some( function(model) {
               return (product = model.get('order_products').findWhere({ id_product: parseInt(id_product) }));
            });
            return product;
        },
        /*
        *  check that quantity of product sets items equals to required value
        */
        check_selected: function() {
            return !this.some(function(model) {
                return model.get_selected_qty() > model.get("minimum_amount") || model.get_selected_qty() < model.get("maximum_amount");
            });
        }
    });

    App.Collections.ProductSets.init = function(product_id, combo_type) {
        var load = $.Deferred();

        if (App.Data.productSets[product_id] === undefined ) {
            App.Data.productSets[product_id] = new App.Collections.ProductSets;
            load = App.Data.productSets[product_id].get_product_sets(product_id, combo_type);
        } else {
            load.resolve();
        }

        return load;
    };
});
