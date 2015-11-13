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

define(["backbone", 'childproducts', 'collection_sort'], function(Backbone) {
    'use strict';

    /**
     * @class
     * Represents product model
     */
    App.Models.Product = Backbone.Model.extend({
        /**
         * @property {object} defaults - literal object containing attributes with default values.
         *
         * @property {string} defaults.description - product description.
         * @default null
         *
         * @property {number} defaults.id - product id.
         * @default null
         *
         * @property {number} defaults.category_id - category id which product is assigned to.
         * @default null
         *
         * @property {string} defaults.image - link on resource with product image.
         * @default null
         *
         * @property {array} defaults.images - array of links on resources with product image (this is used for product gallary in retail skin).
         * @default []
         *
         * @property {boolean} defaults.is_cold - corresponds to product 'Is Cold' property.
         * @default false
         *
         * @property {string} defaults.name - product name.
         * @default null
         *
         * @property {number} defaults.number - product price.
         * @default null
         *
         * @property {string} defaults.img - link on resource with product image.
         * @default null
         *
         * @property {number} defaults.tax - product tax rate (not used, App.Models.Tax is used instead of it).
         * @default 0
         *
         * @property {number} defaults.sort - product sort number.
         * @default null
         *
         * @property {number} defaults.course_number - product course number (not used).
         * @default null
         *
         * @property {number} defaults.cost - product cost (not used).
         * @default null
         *
         * @property {boolean} defaults.sold_by_weight - flag which means product is sold by weight or not.
         * @default false
         *
         * @property {string} defaults.uom - units of measures (it presents if product is sold by weight).
         * @default ""
         *
         * @property {number} defaults.attribute_type - product type (0 - usual product, 1 - parent product, 2 - child product).
         * @default 0
         *
         * @property {App.Collections.ChildProducts} defaults.child_products - collection of children products.
         * @default null
         *
         * @property {string} defaults.attribute_1_name - name of first product attribute.
         * @default null
         *
         * @property {string} defaults.attribute_2_name - name of second product attribute.
         * @default null
         *
         * @property {boolean} defaults.attribute_1_enable - flag which means first product attribute is enabled or not.
         * @default false
         *
         * @property {boolean} defaults.attribute_2_enable - flag which means second product attribute is enabled or not.
         * @default false
         *
         * @property {boolean} defaults.attribute_1_selected - flag which means first product attribute is selected by user or not.
         * @default false
         *
         * @property {boolean} defaults.attribute_2_selected - flag which means second product attribute is selected by user or not.
         * @default false
         *
         * @property {boolean} defaults.is_gift - flag which means product is gift or not.
         * @default false
         *
         * @property {string} defaults.gift_card_number - gift card number which rewards points will be enrolled to (`is_gift` has to be true).
         * @default null
         *
         * @property {object} defaults.checked_gift_cards - literal object containing list of gift cards checked.
         * @default null
         *
         * @property {number} defaults.stock_amount - product amount available in stock.
         * @default stock_amount
         *
         * @property {boolean} defaults.active - product is active or not.
         * @default true
         *
         * @property {string} defaults.created_date - date of product creation.
         * @default null
         *
         * @property {number} defaults.original_tax - original tax of product (used to save origin tax rate to restore in Retail mode).
         * @defaults null
         *
         * @property {} defaults.timetables - a string with available to order time (originally server returns array of assigned customer menus)
         * @default null
         *
         * @property {string} defaults.compositeId - the unique product id (used for a model identification in App.Collections.Products)
         * @default null
         */
        defaults: {
            description: null,
            id: null,
            id_category : null,
            image: null,
            images: [],
            is_cold: false,
            name: null,
            price: null,
            img : null,
            tax : 0, // App.Models.Tax // not used. Know download with product
            sort: null,
            course_number : null,
            cost : null,
            sold_by_weight : false,
            uom : "",
            attribute_type: 0, // matrix inventory. 0 - none, 1 - parent, 2 - child
            child_products: null,
            attribute_1_name: null,
            attribute_2_name: null,
            attribute_1_enable: false,
            attribute_2_enable: false,
            attribute_1_selected: null,
            attribute_2_selected: null,
            is_gift: false,
            gift_card_number: null,
            checked_gift_cards: null,
            stock_amount: 999,
            active: true,
            created_date: null,
            original_tax: null, // used to save origin tax rate to restore in Retail mode
            timetables: null,
            compositeId: null,
            size_chart: '', // URL of product Size Chart image\
            combo_uuid: null,
            combo_selected: false,
            is_combo: false
        },
        /**
         * @method
         * Sets `img` as App.Data.settings.get("img_path"), `checked_gift_cards` as {}, default image (if `image` attribute is empty), `original_tax`.
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
         * @method
         * Sets a passed data as own attributes.
         * Handles special cases for the following attributes:
         *  - `image`: if data.image is empty changes `image` value on App.Data.settings.get_img_default() result.
         *  - `is_gift`: if data.is_gift is true changes `sold_by_weight` value on false.
         *  - `original_tax`: if data.original_tax cannot be converted to integer changes `original_tax` value on data.tax.
         *  - `created_date`: converts `created_date` value to milliseconds.
         *
         * @param {object} data - literal object containing product data.
         *
         * @returns the model.
         */
        addJSON: function(data) {
            if (!data.image)
                data.image = App.Data.settings.get_img_default();

            if (data.is_gift)
                data.sold_by_weight = false;

            if(isNaN(parseInt(data.original_tax, 10)))
                data.original_tax = data.tax;

            data.created_date = new Date(data.created_date).valueOf();

            if(isNaN(data.created_date)) {
                data.created_date = 0;
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
         * @method
         * Deeply clones the model.
         *
         * @returns a new model.
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
         * @method
         * Updates the model. Keep in mind it doesn't handle special cases for `is_gift`, `original_tax`, `created_date` attributes like addJSON() method.
         *
         * @param {App.Models.Product} newProduct - product model.
         *
         * @returns the model.
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
         * @method
         * Returns product by id. If id is undefined returns this model or child product using attributes data.
         *
         * @param {number} id - product id.
         * @returns a product model.
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
         * @method
         * @returns null if product doesn't have children products or modifiers of selected child product.
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
         * @method
         * @returns empty object if product doesn't have children or list of available attributes.
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
         * @method
         * @param {number} type - attribute type (1 or 2).
         * @returns {name: <name>, value: <value>, selected: <id>}.
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
         * @method
         * @returns array of selected attributes [{name: <name>, value: <value>, selected: <id>}, ...].
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
         * @method
         * Sends request to "/weborders/attributes/" to get children products.
         *
         * @return deferred object.
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
         * @method
         * Updates parent active attribute. Check if all children are inactive.
         *
         * @returns the model if any child product is active or false.
         */
        update_active: function() {
            var child = this.get('child_products') || false;
            return child && this.set('active', child.check_active());
        },
        /**
         * @method
         * @returns true if all enabled attributes are selected (or all attributes are disabled), false otherwise.
         */
        check_selected: function() {
            var attr1 = this.get('attribute_1_selected'),
                attr2 = this.get('attribute_2_selected'),
                attr1enable = this.get('attribute_1_enable'),
                attr2enable = this.get('attribute_2_enable');

            return !!((attr1enable && attr1 || !attr1enable) && (attr2enable && attr2 || !attr2enable));
        },
        /**
         * @method
         * Sends request to "/weborders/check_gift/" to check gift card number.
         *
         * @callback success - callback for successful result.
         * @callback error - callback for failure result.
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
         * @method
         * Adds host to images links.
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
         * @method
         * Adds host to image link.
         */
        image: function() {
            this.set('image', addHost(this.get('image'), App.Data.settings.get('host')));
        },
        /**
         * @method
         * @returns true if product is parent, false otherwise.
         */
        isParent: function() {
            return this.get('attribute_type') === 1;
        },
        /**
         * @method
         * Sets a `stock_amount` value to 999 if `cannot_order_with_empty_inventory` is turned off.
         */
        checkStockAmount: function() {
            var inventory = App.Data.settings.get("settings_system").cannot_order_with_empty_inventory;
            if (!inventory)
                this.set('stock_amount', 999);
        },
        /**
         * @method
         * Restores tax rate.
         */
        restoreTax: function() {
            this.set('tax', this.get('original_tax'));
        },
        /**
         * @method
         * Converts array with timetables to string. Originally server returns timetables as array of custom menus assigned to.
         * Need to convert the array to user friendly string.
         */
        convertTimetables: function() {
            var timetables = this.get('timetables');
            if(Array.isArray(timetables)) {
                this.set('timetables', format_timetables(timetables));
            }
        }
    });

    /**
     * @class
     * Represents collection of products.
     */
    App.Collections.Products =  App.Collections.CollectionSort.extend({
        /**
         * @property {string} sortStrategy - sort strategy.
         * @default "sortNumbers"
         */
        sortStrategy: "sortNumbers",
        /**
         * @property {string} sortKey - attribute which value is used as a sort comparator.
         * @default "sort"
         */
        sortKey: "sort",
        /**
         * @property {string} sortOrder - sort order ("asc", "desc")
         * @default "asc"
         */
        sortOrder: "asc", //or "desc"
        /**
         * @property {Function} comparator - comparator function.
         * @default App.Collections.CollectionSort.prototype.strategies.sortNumbers
         */
        comparator: App.Collections.CollectionSort.prototype.strategies.sortNumbers,
        /**
         * @property {App.Models.Product} model - items constructor.
         * @default App.Models.Product
         */
        model: App.Models.Product,
        /**
         * @method
         * Sets `compositeId` as unique id of model. `id` attribute cannot be used due to a product with the same `id` may be in one collection (has multiple categories).
         *
         * @params {object} attrs - literal object containing model attributes.
         * @returns unique id of model.
         */
        modelId: function(attrs) {
            return attrs['compositeId'] || App.Collections.CollectionSort.prototype.modelId.apply(this, arguments);
        },
        /**
         * @method
         * Adds listener for checking product activity. If all products are inactive category gets inactive.
         */
        initialize: function() {
            this.listenTo(this, 'change:active', this.check_active);
        },
        /**
         * @method
         * Finds product by id.
         * Please use this method instead of get(), because models are identified in collection via 'compositeId' attribute.
         *
         * @param {string} id - product id.
         * @returns product model if id is valid.
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
         * @method
         * Sends request to "/weborders/products/" to get products for category. If response is successful add response data as own items.
         *
         * @param {number} id_category - category id.
         * @param {string} search - search pattern (used in retail skin).
         *
         * @returns deferred object.
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
         * @method
         * Handles failure response of products request.
         */
        onProductsError: function() {
            App.Data.errors.alert(MSG.ERROR_PRODUCTS_LOAD, true); // user notification
        },
        /**
         * @method
         * Checks if all models is inactive. If it's true makes category inactive.
         *
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
         * @method
         * @param {number} type - attribute type (may be 1 or 2).
         * @returns object containing unique attribute values grouped by attribute name.
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
     * @static
     * Loads products for category
     *
     * @param {number} id_category - category id.
     * @returns deferred object.
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
     * @method
     * Loads products for several categories in one request
     *
     * @param {array} ids - array containing categories ids.
     * @returns deferred object.
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
