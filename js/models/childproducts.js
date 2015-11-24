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
 * Contains {@link App.Models.ChildProduct}, {@link App.Collections.ChildProducts} constructors.
 * @module childproducts
 * @requires module:backbone
 * @requires module:products
 * @requires module:modifiers
 * @see {@link module:config.paths actual path}
 */
define(["backbone", 'products', 'modifiers'], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a child product (Inventory Matrix of Retail).
     * @alias App.Models.ChildProduct
     * @augments Backbone.Model
     * @example
     * // create a child product model
     * require(['childproducts'], function() {
     *     var childProduct = new App.Models.ChildProduct();
     * });
     */
    App.Models.ChildProduct = Backbone.Model.extend(
    /**
     * @lends App.Models.ChildProduct.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum {string}
         */
        defaults: {
            /**
             * Attributes that specify the child product.
             * @type {module:childproducts~Attributes}
             */
            "attributes":
            /**
             * Attributes that specify the child product.
             * @typedef {Object} module:childproducts~Attributes
             * @property {number} attribute_value_1=0 - Attribute 1 value
             * @property {number} attribute_value_1_name="" - Attribute 1 name
             * @property {number} attribute_value_2=0 - Attribute 2 value
             * @property {number} attribute_value_2_name="" - Attribute 2 name
             */
            {
                "attribute_value_1": 0,
                "attribute_value_1_name": "",
                "attribute_value_2": 0,
                "attribute_value_2_name": ""
            },
            /**
             * A product model of the child product.
             * @type {?App.Models.Product}
             */
            "product": null,
            /**
             * A modifiers collection of the child product.
             * @type {?App.Collections.Modifiers}
             */
            "modifiers": null
        },
        /**
         * Sets JSON representation of child product attributes to actual values.
         * This is necessary for convertion object literals to Backbone models and collections.
         * @param {Object} data - object literal containing JSON representation of attributes.
         * @returns {App.Models.ChildProduct} The updated child product.
         */
        addJSON: function(data) {
            this.set(data);
            this.set({
                product: new App.Models.Product().addJSON(data.product),
                modifiers: new App.Collections.ModifierBlocks().addJSON(data.modifiers)
            });
            return this;
        },
        /**
         * Deeply clones the child product. Attribute data type is kept.
         * A cloned child product doesn't have references to the child product.
         * @example
         * require(['childproducts'], function() {
         *     var childProduct = new App.Models.ChildProduct(),
         *         newChildProduct;
         *
         *     childProduct.addJSON({product: {id:4, name: 'Vanilla ice cream'}});
         *     newChildProduct = childProduct.clone();
         *
         *     // false
         *     console.log(childProduct.get('product') === newChildProduct.get('product'));
         * });
         * @returns {App.Models.ChildProduct} A cloned child product.
         */
        clone: function() {
            var cloned = new App.Models.ChildProduct();
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) {
                    value = value.clone();
                } else {
                    value = deepClone(value)
                }
                cloned.set(key, value, {silent: true });
            }
            return cloned;
        },
        /**
         * Deeply updates the child product. Attribute data type is kept.
         * @param {App.Models.ChildProduct} updated - An instance of {@link App.Models.ChildProduct} each attribute value is used to update
         *                                            corresponding attribute of the child product.
         * @returns {App.Models.ChildProduct} The updated child product.
         */
        update: function(updated) {
            for (var key in updated.attributes) {
                var value = updated.get(key);
                if (value && value.update) { this.get(key).update(value); }
                else { this.set(key, deepClone(value), {silent: true}); }
            }
            return this;
        },
        /**
         * Sets JSON representation of child product attributes to actual values.
         * This is necessary for convertion object literals to Backbone models and collections.
         * @param {Object} data - object literal containing JSON representation of attributes.
         * @returns {App.Models.ChildProduct} The updated child product.
         */
        create: function(data) {
            this.set({
                product: new App.Models.Product(data.product),
                modifiers: new App.Collections.ModifierBlocks().addJSON(data.modifiers),
                attributes: deepClone(data.attributes)
            });

            return this;
        },
        /**
         * Checks `active` value of `products` and returns `attributes`.
         * @returns {module:childproducts~Attributes|boolean} Attributes if `product` is active or `false` otherwise.
         */
        get_attributes: function() {
            if (this.is_active()) {
                return this.get('attributes');
            } else {
                return false;
            }
        },
        /**
         * @returns {boolean} `active` attribute value of the product.
         */
        is_active: function() {
            return this.get('product').get('active');
        }
    });

    /**
     * @class
     * @classdesc Represents a child products collection (Inventory Matrix of Retail).
     * @alias App.Collections.ChildProducts
     * @augments Backbone.Collection
     * @example
     * // create a collection of child products
     * require(['childproducts'], function() {
     *     var childProducts = new App.Collections.ChildProducts();
     * });
     */
    App.Collections.ChildProducts = Backbone.Collection.extend(
    /**
     * @lends App.Collections.ChildProducts.prototype
     */
    {
        /**
         * A collection item constructor
         * @default {@link App.Models.ChildProduct}
         */
        model: App.Models.ChildProduct,
        /**
         * Adds items based on `data` parameter.
         * This is necessary for convertion object literals to Backbone models and collections.
         * @param {Array} data - An array each item is JSON representation of App.Models.ChildProduct attributes
         * @returns {App.Collections.ChildProducts} The child products collection.
         */
        addJSON: function(data) {
            var self = this;

            this.length = 0;
            Array.isArray(data) && data.forEach(function(element) {
                var add = new App.Models.ChildProduct();
                add.addJSON(element);
                self.add(add);
            });
            return this;
        },
        /**
         * Deeply clones the child products collection. Attribute data type is kept.
         * Items of cloned child products collection don't have references to the original items
         * (cloned item is not the same as origin item).
         * @example
         * require(['childproducts'], function() {
         *     var childProducts = new App.Collections.ChildProducts(),
         *         newChildProducts;
         *
         *     childProducts.addJSON([{product: {id:4, name: 'Vanilla ice cream'}}]);
         *     newChildProducts = childProducts.clone();
         *
         *     var originItem = childProducts.at(0),
         *         clonedItem = newChildProducts.at(0);
         *
         *     // false at both lines
         *     console.log(originItem === clonedItem);
         *     console.log(originItem.get('product') === clonedItem.get('product'));
         * });
         * @returns {App.Collections.ChildProducts} A cloned child products collection.
         */
        clone: function() {
            var cloned = new App.Collections.ChildProducts();
            this.each(function(element) {
               cloned.add(element.clone());
            });
            return cloned;
        },
        /**
         * Deeply updates the child products collections. Attribute data type is kept.
         * @param {App.Collections.ChildProducts} updated - An instance of {@link App.Collections.ChildProducts}
         *                                                  each attribute value is used to update
         *                                                  corresponding attribute of the child products collection.
         * @returns {App.Collections.ChildProducts} The updated child products collection.
         */
        update: function(updated) {
            var self = this;
            updated.each(function(el) {
                var old = self.get(el);
                if (old) {
                    old.update(el);
                } else {
                    self.add(el.clone());
                }
            });
            return this;
        },
        /**
         * Gets item that matches `filter` param.
         * @param {Object} filter - Object literal
         * @param {boolean} filter.attribute_1_enable - true if Attribute 1 is assigned to child product.
         * @param {?number} filter.attribute_1_selected - attribute 1 value that should be selected.
         * @param {boolean} filter.attribute_2_enable - true if Attribute 2 is assigned to child product.
         * @param {?number} filter.attribute_2_selected - attribute 2 value that should be selected.
         * @returns {App.Models.ChildProduct} A first found item.
         */
        _get_model: function(filter) {
            var resp;
            this.models.some(function(el) {
                var attr = el.get('attributes');
                if ((filter.attribute_1_enable && filter.attribute_1_selected === attr.attribute_value_1 || !filter.attribute_1_enable) &&
                    (filter.attribute_2_enable && filter.attribute_2_selected === attr.attribute_value_2 || !filter.attribute_2_enable)) {
                    resp =  el;
                    return true;
                }
            });
            return resp;
        },
        /**
         * Gets `product` attribute value of item that matches `attr` param.
         * @param {Object} attr - Object literal
         * @param {boolean} attr.attribute_1_enable - true if Attribute 1 is assigned to child product.
         * @param {?number} attr.attribute_1_selected - attribute 1 value that should be selected.
         * @param {boolean} attr.attribute_2_enable - true if Attribute 2 is assigned to child product.
         * @param {?number} attr.attribute_2_selected - attribute 2 value that should be selected.
         * @returns {(App.Models.Product|undefined)} `product` attribute value if item exists or `undefined` otherwise.
         */
        get_product: function(attr) {
            var resp = this._get_model(attr);
            return resp && resp.get('product');
        },
        /**
         * Gets a child product model by id.
         * @params {number} id - A product id.
         * @returns {(App.Models.Product|undefined)} An instance of App.Models.Product or `undefined` otherwise.
         */
        get_product_id: function(id) {
            var res;
            this.each(function(el) {
                var product = el.get('product');
                if (product.get('id') === id) {
                    res = product;
                }
            });
            return res;
        },
        /**
         * Gets `modifiers` attribute value of item that matches `attr` param.
         * @param {Object} attr - Object literal
         * @param {boolean} attr.attribute_1_enable - true if Attribute 1 is assigned to child product.
         * @param {?number} attr.attribute_1_selected - attribute 1 value that should be selected.
         * @param {boolean} attr.attribute_2_enable - true if Attribute 2 is assigned to child product.
         * @param {?number} attr.attribute_2_selected - attribute 2 value that should be selected.
         * @returns {(App.Collections.Modifiers|undefined)} `modifiers` attribute value if item exists or `undefined` otherwise.
         */
        get_modifiers: function(attr) {
            var resp = this._get_model(attr);
            return resp && resp.get('modifiers');
        },
        /**
         * Gets data for all attributes in the collection.
         * @returns {Object} literal object:
         * ```
         * {
         *     attribute_1: {
         *         <unique value of attribute 1>: [], // array of attribute 2 values that can be paired with it
         *         ...
         *     },
         *     attribute_2: {
         *         <unique value of attribute 2>: [], // array of attribute 1 values that can be paired with it
         *         ...
         *     },
         *     attribute_1_all: {
         *         <unique value of attribute 1>: <its name>,
         *         ...
         *     },
         *     attribute_2_all: {{
         *         <unique value of attribute 2>: <its name>,
         *         ...
         *     },
         *     attribute_1_sort: {
         *         <unique value of attribute 1>: <its sort value>,
         *         ...
         *     },
         *     attribute_2_sort: {
         *         <unique value of attribute 2>: <its sort value>,
         *         ...
         *     },
         * }
         * ```
         */
        get_attributes_list: function() {
            var resp = {
                attribute_1: {},
                attribute_2: {},
                attribute_1_all: {},
                attribute_2_all: {},
                attribute_1_sort: {},
                attribute_2_sort: {}
            };
            this.each(function(el) {
                var attr = el.get_attributes();
                if (attr) {
                    if (typeof attr.attribute_value_1 !== 'undefined') {
                        if (!resp.attribute_1[attr.attribute_value_1]) {
                            resp.attribute_1[attr.attribute_value_1] = [];
                        }
                        typeof attr.attribute_value_2 !== 'undefined' && resp.attribute_1[attr.attribute_value_1].push(attr.attribute_value_2);
                        resp.attribute_1_all[attr.attribute_value_1] = attr.attribute_value_1_name;
                        resp.attribute_1_sort[attr.attribute_value_1] = attr.attribute_value_1_sort;
                    }
                    if (typeof attr.attribute_value_2  !== 'undefined') {
                        if (!resp.attribute_2[attr.attribute_value_2]) {
                            resp.attribute_2[attr.attribute_value_2] = [];
                        }
                        typeof attr.attribute_value_1 !== 'undefined' && resp.attribute_2[attr.attribute_value_2].push(attr.attribute_value_1);
                        resp.attribute_2_all[attr.attribute_value_2] = attr.attribute_value_2_name;
                        resp.attribute_2_sort[attr.attribute_value_2] = attr.attribute_value_2_sort;
                    }
                }
            });
            return resp;
        },
        /**
         * Adds item basing on `child` parameter. It converts some attributes to Backbone model or collection.
         * @param {Object} child - JSON representation of {@link App.Models.ChildProduct} attributes.
         * @returns {App.Models.ChildProduct} Added item.
         */
        add_child: function(child) {
            var model = new App.Models.ChildProduct().create(child);
            this.add(model);

            return model;
        },
        /**
         * Check if all child is inactive.
         * @return {boolean} `true` if all item is active.
         */
        check_active: function() {
            return !this.every(function(el) {
                return !el.is_active();
            });
        }
    });
});