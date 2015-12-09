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
 * Contains {@link App.Models.Product}, {@link App.Collections.Products} constructors.
 * @module products
 * @requires module:backbone
 * @requires module:childproducts
 * @requires module:collection_sort
 * @requires module:product_sets
 * @see {@link module:config.paths actual path}
 */
define(["backbone", 'childproducts', 'collection_sort', 'product_sets'], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a product model.
     * @alias App.Models.Product
     * @augments Backbone.Model
     * @example
     * // create a product
     * require(['products'], function() {
     *     var product = new App.Models.Product({
     *         name: 'Ice Cream',
     *         price: 4.35
     *         id: 1243
     *     });
     * });
     */
    App.Models.Product = Backbone.Model.extend(
    /**
     * @lends App.Models.Product.prototype
     */
    {
        /**
         * Contains attributes with default values.
         * @type {object}
         * @enum
         */
        defaults: {
            /**
             * Product description.
             * @type {?string}
             */
            description: null,
            /**
             * Product id.
             * @type {?number}
             */
            id: null,
            /**
             * Category id.
             * @type {?number}
             */
            id_category : null,
            /**
             * URL of resource with product image.
             * @type {?string}
             */
            image: null,
            /**
             * array of URLs of resources with product image. This is used for product gallery in retail skin.
             * @type {Array}
             */
            images: [],
            /**
             * Product is cold or not.
             * @type {boolean}
             */
            is_cold: false,
            /**
             * Product name.
             * @type {?string}
             */
            name: null,
            /**
             * Product price.
             * @type {?number}
             */
            price: null,
            /**
             * Path for relative URL of product images.
             * @type {?string}
             */
            img: null,
            /**
             * Tax rate assigned to the product.
             * @type {number}
             */
            tax: 0,
            /**
             * Sort number.
             * @type {?number}
             */
            sort: null,
            /**
             * Product course number.
             * @type {?number}
             */
            course_number : null,
            /**
             * Product cost.
             * @type {?number}
             */
            cost : null,
            /**
             * The product is sold by weight or not..
             * @type {boolean}
             */
            sold_by_weight : false,
            /**
             * Units of measures.
             * @type {string}
             */
            uom : "",
            /**
             * Product type (0 - usual product, 1 - parent product, 2 - child product).
             * @type {number}
             */
            attribute_type: 0,
            /**
             * Collection of children products.
             * @type {?App.Collections.ChildProducts}
             */
            child_products: null,
            /**
             * Name of the first product attribute.
             * @type {?string}
             */
            attribute_1_name: null,
            /**
             * Name of the second product attribute.
             * @type {?string}
             */
            attribute_2_name: null,
            /**
             * The first attribute is enabled or disabled.
             * @type {boolean}
             */
            attribute_1_enable: false,
            /**
             * The second attribute is enabled or disabled.
             * @type {boolean}
             */
            attribute_2_enable: false,
            /**
             * The first attribute is selected by user or not.
             * @type {?boolean}
             */
            attribute_1_selected: null,
            /**
             * The second attribute is selected by user or not.
             * @type {?boolean}
             */
            attribute_2_selected: null,
            /**
             * Product is gift or not.
             * @type {boolean}
             */
            is_gift: false,
            /**
             * Gift card number some amount will be added to (`is_gift` has to be `true`).
             * @type {?number}
             */
            gift_card_number: null,
            /**
             * Object literal containing list of gift cards checked.
             * @type {?Object}
             */
            checked_gift_cards: null,
            /**
             * Product amount available in stock.
             * @type {number}
             */
            stock_amount: 999,
            /**
             * Product is active or not.
             * @type {boolean}
             */
            active: true,
            /**
             * Date of product creation.
             * @type {?string}
             */
            created_date: null,
            /**
             * Available time for ordering the product.
             * @type {?string}
             */
            timetables: null,
            /**
             * Unique product id (`id` + '_' + `id_category`). Used for a model identification
             * in {@link App.Collections.Products} collection.
             * @type {?string}
             */
            compositeId: null,
            /**
             * URL of resource with product size chart.
             * @type {string}
             */
            size_chart: '',
            /**
             * Product is combo or not
             * @type {boolean}
             */
            is_combo: false,
            /**
             * Combo product price
             * @type {number}
             */
            combo_price: null,
            /**
             * Combo product price
             * @type {number}
             */
            has_upsell: false
        },
        /**
         * Sets `img` as App.Data.settings.get("img_path") value, `checked_gift_cards` as `{}`,
         * default image (if `image` attribute isn't defined).
         * Converts `created_date` to milliseconds.
         */
        initialize: function() {
            this.set({
                img: App.Data.settings.get("img_path"),
                checked_gift_cards: {}
            });

            if (!this.get('image'))
                this.set('image', App.Data.settings.get_img_default());
            else {
                this.image();
            }

            this.listenTo(this, 'change:image', this.image, this);

            if (App.skin == App.Skins.RETAIL)
                this.listenTo(this, 'change:images change:image', this.images, this);

            this.addJSON(this.toJSON());

            if (App.skin == App.Skins.RETAIL)
                this.images();

            // listen to timetables change
            this.listenTo(this, 'change:timetables', this.convertTimetables);
            this.convertTimetables();
        },
        /**
         * Sets a passed data as own attributes.
         * Handles special cases for the following attributes:
         *  - `image`: if `data.image` is empty changes `image` value on App.Data.settings.get_img_default() result.
         *  - `is_gift`: if `data.is_gift` is `true` changes `sold_by_weight` value on `false`.
         *  - `created_date`: converts `created_date` value to milliseconds.
         * @param {Object} data - JSON representation of {@link App.Models.Product} attributes.
         * @returns {App.Models.Product} The model.
         */
        addJSON: function(data) {
            if (!data.image)
                data.image = App.Data.settings.get_img_default();

            if (data.is_gift)
                data.sold_by_weight = false;

            data.created_date = new Date(data.created_date).valueOf();

            if(isNaN(data.created_date)) {
                data.created_date = 0;
            }

            if ((data.is_combo || data.has_upsell) && Array.isArray(data.product_sets)) {
                var product_sets = new App.Collections.ProductSets;
                product_sets.addJSON(data.product_sets);
                data.product_sets = product_sets;
            }

            this.set(data);
            if (data.attribute_type === 1 && data.child_products) {
                var children = new App.Collections.ChildProducts();
                var children_json = typeof data.child_products.toJSON == 'function' ? data.child_products.toJSON() : data.child_products;
                this.set('child_products', children.addJSON(children_json));
            }

            this.checkStockAmount();
            return this;
        },
        /**
         * Deeply clones the model.
         * @returns {App.Models.Product} Cloned model.
         */
        clone: function() {
            var newProduct = new App.Models.Product();
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) { value = value.clone(); }
                newProduct.set(key, value, {silent: true });
            }
            return newProduct;
        },
        /**
         * Updates the model. Keep in mind it doesn't handle special cases for `is_gift`, `created_date` attributes
         * like in {@link App.Models.Product#addJSON addJSON()} method.
         * @param {App.Models.Product} newProduct - product model.
         * @returns {App.Models.Product} The model.
         */
        update: function(newProduct) {
            for(var key in newProduct.attributes) {
                var value = newProduct.get(key),
                    valueConstructor;
                if (value && value.update) {
                    valueConstructor = Object.getPrototypeOf(value).constructor;
                    if(!(this.get(key) instanceof valueConstructor)) {
                        this.set(key, new valueConstructor(), {silent: true});
                    }
                    this.get(key).update(value);
                }
                else { this.set(key, value, {silent: true}); }
            }
            return this;
        },
        /**
         * Seeks a product. If `id` parameter is passed seeks a product by id (returns itself or child product).
         * Otherwise, if the product isn't parent then returns the product.
         * If the product is parent then returns specified child product.
         * @param {number} [id] - product id.
         * @returns {App.Models.Product} A product model.
         */
        get_product: function(id) {
            var type = this.get('attribute_type'),
                child = this.get('child_products');

            if (id) {
                if (parseInt(this.get('id'), 10) === parseInt(id, 10)) {
                    return this;
                } else {
                    return child && child.get_product_id(id);
                }
            } else if (type === 0 || type === 2 || !child) {
                return this;
            } else  {
                var res = child.get_product({
                    attribute_1_selected: this.get('attribute_1_selected'),
                    attribute_1_enable: this.get('attribute_1_enable'),
                    attribute_2_selected: this.get('attribute_2_selected'),
                    attribute_2_enable: this.get('attribute_2_enable')
                });
                return res || this;
            }
        },
        /**
         * @returns {?App.Collections.ModifierBlocks} `null` of modifiers classes of selected child product.
         */
        get_modifiers: function() {
            var type = this.get('attribute_type'),
                child = this.get('child_products');

            if (type === 0 || type === 2 || !child) {
                return null;
            } else {
                return child.get_modifiers({
                    attribute_1_selected: this.get('attribute_1_selected'),
                    attribute_1_enable: this.get('attribute_1_enable'),
                    attribute_2_selected: this.get('attribute_2_selected'),
                    attribute_2_enable: this.get('attribute_2_enable')
                });
            }
        },
        /**
         * @returns {Object} `{}` for non-parent product
         * and result of {@link App.Collections.ChildProducts#get_attributes_list} method call.
         */
        get_attributes_list: function() {
            var type = this.get('attribute_type'),
                child = this.get('child_products');

            if (type === 0 || type === 2 || !child) {
                return {};
            } else {
                return child.get_attributes_list();
            }
        },
        /**
         * @param {number} [type=1] - attribute type (`1` or `2`).
         * @returns {(Object|undefined)} If attribute type is disabled returns `undefined`. Otherwise, returns the following object:
         * ```
         * {
         *     name: name,          // attribute name
         *     value: value,        // attribute value
         *     selected: selected   // `true` if the attribute is selected
         * }
         * ```
         */
        get_attribute: function(type) {
            if(type != 1 && type != 2)
                type = 1;

            if(!this.get('attribute_' + type + '_enable'))
                return;

            var all_attrs = this.get_attributes_list(),
                name = this.get('attribute_' + type + '_name'),
                selected = this.get('attribute_' + type + '_selected'),
                value = all_attrs['attribute_' + type + '_all'][selected];

            return {
                name: name,
                value: value,
                selected: selected
            };
        },
        /**
         * @returns {Array} Array of selected attributes `[{name: <name>, value: <value>, selected: <id>}, ...]`.
         */
        get_attributes: function() {
            var attr1 = this.get_attribute(1),
                attr2 = this.get_attribute(2),
                attrs = [];
            attr1 && attrs.push(attr1);
            attr2 && attrs.push(attr2);
            if(attrs.length > 0)
                return attrs;
        },
        /**
         * Receives child products. Used parameters of request are:
         * ```
         * {
         *     url: "/weborders/attributes/",
         *     type: 'GET',
         *     data: {
         *         product: <product id>
         *     }
         * }
         * ```
         * @returns {Object} Deferred object.
         */
        get_child_products: function() {
            var type = this.get('attribute_type'),
                settings = App.Data.settings,
                def = Backbone.$.Deferred();

            if (type === 1 && !this.get('child_products')) {
                this.set('child_products', new App.Collections.ChildProducts);
                var child = this.get('child_products'),
                    self = this;

                Backbone.$.ajax({
                    url: "/weborders/attributes/",
                    data: {
                        product: this.get('id')
                    },
                    success: function(data) {
                        var inventory = settings.get("settings_system").cannot_order_with_empty_inventory;
                        switch (data.status) {
                            case 'OK':
                                self.listenTo(child, 'change:active', self.update_active);
                                data.data.forEach(function(el) {
                                    var image = true;

                                    if(!inventory && el.product)
                                        el.product.stock_amount = 999;

                                    // copy image url from parent if it is not present for child product
                                    if(el.product && !el.product.image) {
                                        el.product.image = self.get('image');
                                        image = false;
                                    }

                                    // copy images if they are not present and `image` property is not assigned originally for child product
                                    if(el.product && !image && Array.isArray(el.product.images) && el.product.images.length == 0)
                                        el.product.images = self.get('images').slice();

                                    child.add_child(el);
                                });
                                def.resolve();
                                break;
                            default:
                                App.Data.errors.alert(MSG.ERROR_GET_CHILD_PRODUCTS, true); // user notification
                                def.resolve();
                        }
                    }
                });
            } else {
                def.resolve();
            }

            return def;
        },
        /**
         * Updates parent's `active` attribute. Checks if all children are inactive.
         * @returns {(boolean|App.Models.Product)} The model if any child product is active or `false`.
         */
        update_active: function() {
            var child = this.get('child_products') || false;
            return child && this.set('active', child.check_active());
        },
        /**
         * @returns {boolean} `true` if all enabled attributes are selected (or all attributes are disabled).
         */
        check_selected: function() {
            var attr1 = this.get('attribute_1_selected'),
                attr2 = this.get('attribute_2_selected'),
                attr1enable = this.get('attribute_1_enable'),
                attr2enable = this.get('attribute_2_enable');

            return !!((attr1enable && attr1 || !attr1enable) && (attr2enable && attr2 || !attr2enable));
        },
        /**
         * Sends request to server to check a gift card number.
         * Used parameters for request are:
         * ```
         * {
         *     type: "POST",
         *     url: "/weborders/check_gift/",
         *     dataType: "JSON",
         *     data: {
         *         card: <gift card number>,
         *         establishment: <establishment id>
         *     }
         * }
         * ```
         * @param {Function} success - Сallback for successful result.
         * @param {Function} error - Сallback for failure result.
         */
        check_gift: function(success, error) {
            var is_gift = this.get('is_gift'),
                gift_number = this.get('gift_card_number'),
                checked_gift_cards = this.get('checked_gift_cards'),
                price = this.get('price') * 1,
                err = [];

            if (!is_gift) {
                return success();
            }

            (!gift_number || checked_gift_cards[gift_number] === false) && err.push(_loc.PRODUCTS_GIFT_CARD_NUMBER);
            (!price) && err.push(_loc.PRODUCTS_AMOUNT);

            if (err.length) {
                error(MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')));
            } else if (checked_gift_cards[gift_number] === true) {
                success();
            } else {
                Backbone.$.ajax({
                    type: "POST",
                    url: "/weborders/check_gift/",
                    dataType: 'JSON',
                    data: {
                        card: gift_number,
                        establishment: App.Data.settings.get("establishment")
                    },
                    success: function(data) {
                        switch (data.status) {
                            case 'OK':
                                checked_gift_cards[gift_number] = true;
                                success();
                                break;
                            default:
                                err.push(_loc.PRODUCTS_GIFT_CARD_NUMBER);
                                checked_gift_cards[gift_number] = false;
                                error(MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')));
                        }
                    }
                });
            }
        },
        /**
         * Adds host to `images` links.
         */
        images: function() {
            var img = this.get('image'),
                imgs = this.get('images'),
                settings = App.Data.settings,
                defImg = settings.get('settings_skin').img_default,
                host = settings.get('host'),
                images = [];

            if(Array.isArray(imgs)) {
                images = imgs.map(function(image) {
                    if (Array.isArray(defImg) ? defImg.indexOf(image) == -1 : defImg != image)
                        return addHost(image, host);
                    else
                        return image;
                });
            }
            if(images.length == 0)
                images.push(img);
            else
                img = images[0];

            this.set('images', images, {silent: true});
            this.set('image', img, {silent: true});
        },
        /**
         * Adds host to `image` link.
         */
        image: function() {
            this.set('image', addHost(this.get('image'), App.Data.settings.get('host')));
        },
        /**
         * @returns {boolean} `true` if product is parent.
         */
        isParent: function() {
            return this.get('attribute_type') === 1;
        },
        /**
         * Changes a `stock_amount` value on `999` if 'cannot_order_with_empty_inventory' is turned off in backend.
         */
        checkStockAmount: function() {
            var inventory = App.Data.settings.get("settings_system").cannot_order_with_empty_inventory;
            if (!inventory)
                this.set('stock_amount', 999);
        },
        /**
         * Converts array with timetables to string. Originally server returns timetables as array of custom menus assigned to.
         * Need to convert the array to user friendly string.
         */
        convertTimetables: function() {
            var timetables = this.get('timetables');
            if(Array.isArray(timetables)) {
                this.set('timetables', format_timetables(timetables));
            }
        },
        /**
         * @returns {boolean} `true` if the product is root Combo or Upsell product.
         */
        isComboBased: function() {
            return this.get("is_combo") === true || this.get("has_upsell") === true;
        }
    });

    /**
     * @class
     * @classdesc Represents a collection of products.
     * @alias App.Collections.Products
     * @augments App.Collections.CollectionSort
     * @example
     * // create products
     * require(['products'], function() {
     *     var products = new App.Collections.Products([{
     *         name: 'Ice Cream',
     *         price: 4.35
     *         id: 1243
     *     }, {
     *         name: 'Coffee',
     *         price: 2.35
     *         id: 112
     *     }]);
     * });
     */
    App.Collections.Products =  App.Collections.CollectionSort.extend(
    /**
     * @lends App.Collections.Products.prototype
     */
    {
        /**
         * Sort strategy.
         * @type {string}
         * @default "sortNumbers"
         */
        sortStrategy: "sortNumbers",
        /**
         * Attribute which value is used as a sort comparator.
         * @type {string}
         * @default "sort"
         */
        sortKey: "sort",
        /**
         * Sort order ("asc", "desc").
         * @type {string}
         * @default "asc"
         */
        sortOrder: "asc", //or "desc"
        /**
         * Comparator function.
         * @type {Function}
         * @default App.Collections.CollectionSort.prototype.strategies.sortNumbers
         */
        comparator: App.Collections.CollectionSort.prototype.strategies.sortNumbers,
        /**
         * Item constructor.
         * @type {Function}
         * @default App.Models.Product
         */
        model: App.Models.Product,
        /**
         * Sets `compositeId` attribute as unique id of model. `id` attribute cannot be used
         * due to products with the same `id` may be in the collection (has multiple categories).
         * @params {Object} attrs - Object literal containing {@link App.Models.Product} attributes.
         * @returns {string} Unique id of model.
         */
        modelId: function(attrs) {
            return attrs['compositeId'] || App.Collections.CollectionSort.prototype.modelId.apply(this, arguments);
        },
        /**
         * Adds listener to check products activity. If all products are inactive category gets inactive.
         */
        initialize: function() {
            this.listenTo(this, 'change:active', this.check_active);
        },
        /**
         * Seeks product by id.
         * Please use this method instead of get(), because models are identified in collection via 'compositeId' attribute.
         * @param {number} id - product id.
         * @returns {App.Models.Product} A found product model if id is valid.
         */
        get_product: function(id) {
            var res;
            this.each(function(el) {
                if (el.get_product(id)) {
                    res = el;
                }
            });
            return res;
        },
        /**
         * Receives products. Used parameters of request are:
         * ```
         * {
         *     type: "GET",
         *     url: "/weborders/products/",
         *     dataType: "json",
         *     data: {
         *         category: <category id>,
         *         establishment: <establishment id>,
         *         search: <lookup string>
         *     }
         * }
         * ```
         * @param {number} id_category - category id.
         * @param {string} search - search pattern (used in retail skin).
         * @returns {Object} Deferred object.
         */
        get_products: function(id_category, search) {
            var self = this,
                settings = App.Data.settings,
                fetching = Backbone.$.Deferred(); // deferred for check if all product load;

            if (id_category == undefined && (search == null || search == undefined)) {
                fetching.resolve();//this is the search request with an undefined pattern
                return fetching;
            }

            Backbone.$.ajax({
                type: "GET",
                url: "/weborders/products/",
                data: {
                    category: id_category,
                    establishment: settings.get("establishment"),
                    search: search
                },
                traditional: true, // it removes "[]" from "category" get parameter name
                dataType: "json",
                successResp: function(data) {
                    for (var i = 0; i < data.length; i++) {
                        if(data[i].is_gift && settings.get('skin') === 'mlb') continue; // mlb skin does not support gift cards (bug #9395)
                        data[i].compositeId = data[i].id + '_' + data[i].id_category;
                        self.add(data[i]);
                    }
                    fetching.resolve();
                },
                error: function() {
                    self.onProductsError();
                }
            });

            return fetching;
        },
        /**
         * Handles failure response of products request.
         */
        onProductsError: function() {
            App.Data.errors.alert(MSG.ERROR_PRODUCTS_LOAD, true); // user notification
        },
        /**
         * Checks if all models are inactive. If it's `true` makes category inactive.
         * @param {App.Models.Product} model - product model.
         */
        check_active: function(model) {
            var id_category = model.get('id_category'),
                inactive = this.where({id_category: id_category}).every(function(el) {
                    return !el.get('active');
                });

            if (inactive) {
                App.Data.categories.set_inactive(id_category);
            }
        },
        /**
         * @param {number} type - attribute type (may be `1` or `2`).
         * @returns {Object} Object containing unique attribute values grouped by attribute name.
         * ```
         * {
         *     <attribute name>: [<attribute value 1>, <attribute value 2>, ...],
         *     ...
         * }
         * ```
         */
        getAttributeValues: function(type) {
            var attrs = {},
                key, name;

            if(type != 1 && type != 2)
                type = 1;

            key = 'attribute_' + type + '_values';
            name = 'attribute_' + type + '_name';

            // get attribute values grouped by name
            this.length && this.toJSON().forEach(function(product) {
                var values = product[key],
                    _name = product[name];
                if (!_name) {
                    return;
                }
                if (!(_name in attrs)) {
                    attrs[_name] = [];
                }
                attrs[_name].push.apply(attrs[_name], values);
            });

            for(name in attrs) {
                attrs[name] = _.uniq(attrs[name]).sort();
            }

            return attrs;
        }
    });

    /**
     * Loads products for category.
     * @static
     * @alias App.Collections.Products.init
     * @param {number} id_category - category id.
     * @returns {Object} Deferred object.
     */
    App.Collections.Products.init = function(id_category) {
        var product_load = $.Deferred();

        if (App.Data.products[id_category] === undefined) {
            App.Data.products[id_category] = new App.Collections.Products();
            product_load = App.Data.products[id_category].get_products(id_category);
        } else {
            product_load.resolve();
        }

        return product_load;
    };

    /**
     * Loads products for several categories in one request.
     * @static
     * @alias App.Collections.Products.get_slice_products
     * @param {Array} ids - array containing categories ids.
     * @returns {Object} Deferred object.
     */
    App.Collections.Products.get_slice_products = function(ids) {
        var c_id,
            product_load = $.Deferred(),
            tmp_model = new App.Collections.Products();

        c_id = ids.filter(function(id_category) {
            return App.Data.products[id_category] === undefined;
        });

        if (c_id.length) {
            tmp_model.get_products(c_id).then(function() {
                c_id.forEach(function(id_category) {
                    var products = new App.Collections.Products();
                    products.add(tmp_model.where({id_category: id_category}));
                    App.Data.products[id_category] = products;
                });
                product_load.resolve();
            });
        } else {
            product_load.resolve();
        }

        return product_load;
    };

    function addHost(image, host) {
        return /^https?:\/\//.test(image) ? image : host + image.replace(/^([^\/])/, '/$1');
    }
});
