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

    App.Models.Product = Backbone.Model.extend({
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
            stock_amount: 10,
            active: true,
            isDeliveryItem: false,
            created_date: null,
            original_tax: null, // used to save origin tax rate to restore in Retail mode
            timetables: null
        },
        initialize: function() {
            this.set({
                img: App.Data.settings.get("img_path"),
                checked_gift_cards: {}
            });

            if (!this.get('image'))
                this.set('image', App.Data.settings.get_img_default());

            if (App.skin == App.Skins.RETAIL)
                this.listenTo(this, 'change:images change:image', this.images, this);

            this.addJSON(this.toJSON());

            if (App.skin == App.Skins.RETAIL)
                this.images();
        },
        addJSON: function(data) {
            if (!data.image)
                data.image = App.Data.settings.get_img_default();

            if (data.is_gift)
                data.sold_by_weight = false;

            if(isNaN(parseInt(data.original_tax, 10)))
                data.original_tax = data.tax;

            data.created_date = new Date(data.created_date).valueOf();
            this.set(data);
            if (data.attribute_type === 1 && data.child_products) {
                var children = new App.Collections.ChildProducts();
                var children_json = typeof data.child_products.toJSON == 'function' ? data.child_products.toJSON() : data.child_products;
                this.set('child_products', children.addJSON(children_json));
            }

            this.checkStockAmount();
            return this;
        },
        clone: function() {
            var newProduct = new App.Models.Product();
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) { value = value.clone(); }
                newProduct.set(key, value, {silent: true });
            }
            return newProduct;
        },
        update: function(newProduct) {
            for(var key in newProduct.attributes) {
                var value = newProduct.get(key);
                if (value && value.update) { this.get(key).update(value); }
                else { this.set(key, value, {silent: true}); }
            }
            return this;
        },
        /**
         * get product by id or by attributes
         *
         */
        get_product: function(id) {
            var type = this.get('attribute_type'),
                child = this.get('child_products');

            if (id) {
                if (this.get('id') === id) {
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
        get_attributes_list: function() {
            var type = this.get('attribute_type'),
                child = this.get('child_products');

            if (type === 0 || type === 2 || !child) {
                return {};
            } else {
                return child.get_attributes_list();
            }
        },
        /*
         * returns {name: <name>, value: <value>, selected: <id>}
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
        /*
         * returns array of selected attributes [{name: <name>, value: <value>, selected: <id>}, ...]
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
        get_child_products: function() {
            var type = this.get('attribute_type'),
                settings = App.Data.settings,
                def = $.Deferred();

            if (type === 1 && !this.get('child_products')) {
                this.set('child_products', new App.Collections.ChildProducts);
                var child = this.get('child_products'),
                    self = this;

                $.ajax({
                    url: settings.get("host") + "/weborders/attributes/",
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
                                        el.product.stock_amount = 10;

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
                                App.Data.errors.alert(MSG.ERROR_GET_CHILD_PRODUCTS, true);
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
         * Update parent active attribue. Check if all children are inactive
         */
        update_active: function() {
            var child = this.get('child_products') || false;
            return child && this.set('active', child.check_active());
        },
        check_selected: function() {
            var attr1 = this.get('attribute_1_selected'),
                attr2 = this.get('attribute_2_selected'),
                attr1enable = this.get('attribute_1_enable'),
                attr2enable = this.get('attribute_2_enable');

            return !!((attr1enable && attr1 || !attr1enable) && (attr2enable && attr2 || !attr2enable));
        },
        /**
         * check gift card number
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

            (!gift_number || checked_gift_cards[gift_number] === false) && err.push('Gift Card Number');
            !price && err.push('Price');

            if (err.length) {
                error(MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')));
            } else if (checked_gift_cards[gift_number] === true) {
                success();
            } else {
                $.ajax({
                    type: "POST",
                    url: App.Data.settings.get("host") + "/weborders/check_gift/",
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
                                err.push('Gift Card Number');
                                checked_gift_cards[gift_number] = false;
                                error(MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')));
                        }
                    }
                });
            }
        },
        images: function(model, imgs) {
            var img = this.get('image'),
                imgs = this.get('images'),
                settings = App.Data.settings,
                defImg = settings.get('settings_skin').img_default,
                host = settings.get('host'),
                images = [];

            if(Array.isArray(imgs)) {
                images = imgs.map(function(image) {
                    if (Array.isArray(defImg) ? defImg.indexOf(image) == -1 : defImg != image)
                        return /^https?:\/\//.test(image) ? image : host + image.replace(/^([^\/])/, '/$1');
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
        isParent: function() {
            return this.get('attribute_type') === 1;
        },
        checkStockAmount: function() {
            var inventory = App.Data.settings.get("settings_system").cannot_order_with_empty_inventory;
            if (!inventory)
                this.set('stock_amount', 10);
        },
        restoreTax: function() {
            this.set('tax', this.get('original_tax'));
        }
    });

    App.Collections.Products =  App.Collections.CollectionSort.extend({
        sortStrategy: "sortNumbers",
        sortKey: "sort",
        sortOrder: "asc", //or "desc"
        model: App.Models.Product,
        initialize: function() {
            this.listenTo(this, 'change:active', this.check_active);
        },
        /**
         * get product by id
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
         * Get products from backend.
         */
        get_products: function(id_category, search) {
            var self = this,
                settings = App.Data.settings,
                fetching = $.Deferred(); // deferred for check if all product load;
            $.ajax({
                type: "GET",
                url: settings.get("host") + "/weborders/products/",
                data: {
                    category: id_category,
                    establishment: settings.get("establishment"),
                    search: search
                },
                dataType: "json",
                successResp: function(data) {
                    for (var i = 0; i < data.length; i++) {
                        if(data[i].is_gift && settings.get('skin') === 'mlb') continue; // mlb skin does not support gift cards (bug #9395)
                        data[i].timetables = format_timetables(data[i].timetables);
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
        onProductsError: function() {
            App.Data.errors.alert(MSG.ERROR_PRODUCTS_LOAD, true); // user notification
        },
        /**
         * Check if all models is inactive
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
        getAttributeValues: function(type) {
            var attrs = [],
                key;

            if(type != 1 && type != 2)
                type = 1;

            key = 'attribute_' + type + '_values';

            // attrs should have only unique values
            attrs.push = function() {
                Array.prototype.forEach.call(arguments, function(arg) {
                    this.indexOf(arg) == -1 && Array.prototype.push.call(this, arg);
                }, this);
                return this.length;
            };

            // get unique attribute values
            this.length && this.toJSON().reduce(function(attrs, product) {
                var values = product[key];
                if(product.attribute_type == 1 && Array.isArray(values))
                    attrs.push.apply(attrs, values);
                return attrs;
            }, attrs);

            return attrs.sort();
        }
    });

    // load products for category
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

    // load products for several categories in one request
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
});
