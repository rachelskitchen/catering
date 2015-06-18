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

define(["backbone", 'products', 'modifiers'], function(Backbone) {
    'use strict';

    App.Models.ChildProduct = Backbone.Model.extend({
        defaults: {
            "attributes": {
                "attribute_value_1": 0,
                "attribute_value_1_name": "",
                "attribute_value_2": 0,
                "attribute_value_2_name": ""
            },
            "product": null,
            "modifiers": null
        },
        addJSON: function(data) {
            this.set(data);
            this.set({
                product: new App.Models.Product().addJSON(data.product),
                modifiers: new App.Collections.ModifierBlocks().addJSON(data.modifiers)
            });
            return this;
        },
        clone: function() {
            var cloned = new App.Models.ChildProduct();
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) {
                    value = value.clone();
                } else {
                    value = deepClone(value)
                }
                cloned.set(key, value,{silent : true });
            }
            return cloned;
        },
        update: function(updated) {
            for (var key in updated.attributes) {
                var value = updated.get(key);
                if (value && value.update) { this.get(key).update(value); }
                else { this.set(key, deepClone(value),{silent : true}); }
            }
            return this;
        },
        create: function(data) {
            this.set({
                product: new App.Models.Product(data.product),
                modifiers: new App.Collections.ModifierBlocks().addJSON(data.modifiers),
                attributes: deepClone(data.attributes)
            });

            return this;
        },
        get_attributes: function() {
            if (this.get('product').get('active')) {
                return this.get('attributes');
            } else {
                return false;
            }
        },
        is_active: function() {
            return this.get('product').get('active');
        }
    });

    App.Collections.ChildProducts = Backbone.Collection.extend({
        model: App.Models.ChildProduct,
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
        clone: function() {
            var cloned = new App.Collections.ChildProducts();
            this.each(function(element) {
               cloned.add(element.clone());
            });
            return cloned;
        },
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
         * get ChildProduct model with selected attributes
            "attribute_1_selected": Number or null
            "attribute_1_enable": Bool,
            "attribute_2_selected":  Number or null
            "attribute_2_enable": Bool
         */
        get_product: function(attr) {
            var resp = this._get_model(attr);
            return resp && resp.get('product');
        },
        /**
         *
         * get product by id
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
        get_modifiers: function(attr) {
            var resp = this._get_model(attr);
            return resp && resp.get('modifiers');
        },
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
        add_child: function(child) {
            var model = new App.Models.ChildProduct().create(child);
            this.add(model);

            return model;
        },
        /**
         * check if all child is inactive
         */
        check_active: function() {
            return !this.every(function(el) {
                return !el.is_active();
            });
        }
    });
});