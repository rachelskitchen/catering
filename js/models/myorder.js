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

define(["backbone", 'total', 'checkout', 'products', 'rewards'], function(Backbone) {
    'use strict';

    App.Models.Myorder = Backbone.Model.extend({
        defaults: {
            product: null, //App.Models.Product,
            modifiers: null,
            id_product: null, // id_product
            sum : 0, // total myorder sum (initial_price + modifiers price)
            quantity : 1,
            weight : 0,
            quantity_prev : 1,
            special : '',
            initial_price: null, // product price including modifier "size",
            discount: null
        },
        product_listener: false, // check if listeners for product is present
        modifier_listener: false, // check if listeners for modifiers is preset
        current_modifiers_model: false, // current modifiers model
        initialize: function() {
            this.set("discount", new App.Models.DiscountItem());
            this.listenTo(this, 'change', this.change);
        },
        get_product: function() {
            return this.get('product').get_product();
        },
        get_modifiers: function() {
            return this.get('product').get_modifiers() || this.get('modifiers');
        },
        get_initial_price: function() {
            var modifiers = this.get_modifiers(),
               size = modifiers && modifiers.getSizeModel();

            if(size) {
               return size.get('price');
            } else {
               return this.get_product().get('price');
            }
        },
        change_special: function(opts) { // logic when modifier special changed
            var settings = App.Data.settings.get('settings_system');
            if(settings && !settings.special_requests_online)
                return;

            var modifiers = this.get_modifiers(),
                spec = this.get('special'),
                specText = $.trim(spec + (modifiers ? '\n' + modifiers.get_special_text() : "")).slice(0, 255);

            if (specText !== "") {
                this.set({special: specText});
                if (opts && opts.ignore_uncheck) {
                    return;
                }
                modifiers.uncheck_special();
            }
        },
        change: function() {
            if (this.get('product') && !this.product_listener) {
                this.product_listener = true;
                this.listenTo(this.get('product'), 'change', function() { // bubble change event
                    this.trigger('change',this);
                });
                this.listenTo(this.get('product'), 'change:attribute_1_selected change:attribute_2_selected', function() { // listen to change product attributes
                    this.modifier_listener = false;
                    this.set({
                        id_product: this.get_product().get('id'),
                        sum: this.get_modelsum(), // depend on quantity
                        initial_price: this.get_initial_price()
                    });
                    this.trigger('change',this);
                });
                this.listenTo(this.get('product'), 'change:price', function() {
                    this.set('initial_price', this.get_initial_price());
                });
            }

            var modifiers = this.get_modifiers();
            if (modifiers && !this.modifier_listener) {
                this.modifier_listener = true;
                this.current_modifiers_model && this.stopListening(this.current_modifiers_model); // save current modifiers model, after change product attributes, modifiers models and listeners changed
                this.current_modifiers_model = modifiers;
                !this.get('special') && this.change_special({ignore_uncheck: true});
                this.listenTo(modifiers, 'modifiers_special', this.change_special);
                this.listenTo(modifiers, 'modifiers_size', function(price) {
                    this.set('initial_price', price);
                });
                this.listenTo(modifiers, 'modifiers_changed', function() {
                    this.update_prices();
                    this.trigger('change', this); // need to notify a collection about modifier change to ensure cart totals update
                });
            }
        },
        /**
         * update modifiers price due to max feature
         */
        update_prices: function() {
            var max_price = this.get_product().get('max_price'),
                initial_price = this.get_initial_price();
            if (max_price) {
                this.get_modifiers().update_prices(max_price > initial_price ? max_price - initial_price : 0);
            }
        },
        /**
         * initiate order without product and modifiers
         */
        add_empty: function (id_product, id_category) {
            var self = this,
                product_load = App.Collections.Products.init(id_category), // load product
                quick_modifier_load = App.Collections.ModifierBlocks.init_quick_modifiers(),
                modifier_load = $.Deferred(),
                product_child_load = $.Deferred(), // load child products
                loadOrder = $.Deferred(),
                product;

            product_load.then(function() {
                product = App.Data.products[id_category].get_product(id_product);
                product.get_child_products().then(product_child_load.resolve);
            });

            quick_modifier_load.then(function() {
                App.Collections.ModifierBlocks.init(id_product).then(modifier_load.resolve); // load product modifiers
            });

            $.when(product_child_load, modifier_load).then(function() {
                self.set({
                    product: product,
                    id_product: id_product,
                    modifiers: App.Data.modifiers[id_product]
                });
                self.set({
                    sum: self.get_modelsum(), // sum with modifiers
                    initial_price: self.get_initial_price()
                });
                self.update_prices();
                loadOrder.resolve();
            });

            return loadOrder;
        },
        /**
         *  create order from JSON. Used in paypal skin, when repeat order
         */
        addJSON: function(data) {
            this.set({
                discount: new App.Models.DiscountItem(data.discount),
                product: new App.Models.Product().addJSON(data.product),
                modifiers: new App.Collections.ModifierBlocks().addJSON(data.modifiers),
                id_product: data.id_product,
                quantity: data.product.sold_by_weight ? 1 : data.quantity,
                weight: data.weight ? data.weight : 0
            });
            data.special && this.set('special', data.special, {silent: true});
            if (!this.get('product').get('gift_card_number') && data.gift_card_number) {
                this.get('product').set('gift_card_number', data.gift_card_number);
            }
            if (!data.id_product) {
                this.set('id_product', data.product.id);
            }

            return this;
        },
        get_modelsum: function() {
            var sold_by_weight = this.get("product") ?  this.get("product").get('sold_by_weight') : false,
                weight = this.get('weight'),
                productSum = this.get_initial_price(),
                product = this.get_product(),
                max_price = product && product.get('max_price'),
                totalItem;

                if (sold_by_weight && weight) {
                    productSum *= weight;
                }

            var modifiers = this.get_modifiers(),
                modifiersSum = modifiers ? modifiers.get_sum() : 0,
                hasModifiers = !!modifiers && modifiers.get_modifierList().some(function(modifier) {
                    return modifier.get('selected');
                });

            totalItem = productSum + modifiersSum;

            // subtotal should be less or equal max_price if any no admin modifier is attached to product
            // Test Case 7047
            return (hasModifiers && typeof max_price == 'number' && max_price < totalItem ? max_price : totalItem) * this.get('quantity');
        },
        get_special: function() {
            var settings = App.Data.settings.get('settings_system');
            if(settings && !settings.special_requests_online) {
                return '';
            } else if (this.get('special')) {
                return this.get('special');
            } else if (this.get_modifiers())
                return this.get_modifiers().get_special_text();
            else return "";
        },
        clone: function() {
            var order = new App.Models.Myorder();
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) { value = value.clone(); }
                order.set(key, value, {silent: true });
            }
            order.trigger('change', order, {clone: true});
            return order;
        },
        update: function(newModel) {
            for (var key in newModel.attributes) {
                var value = newModel.get(key);
                if (value && value.update) { this.get(key).update(value); }
                else { this.set(key, value, {silent: true}); }
            }
            this.trigger('change',this);
            return this;
        },
        /**
         * check if we could add this order to cart
         * not check_gift here, due to async
         */
        check_order: function() {
            var product = this.get_product(),
                modifiers = this.get_modifiers(),
                size = modifiers.getSizeModel(),
                dining_option = this.collection ? this.collection.checkout.get('dining_option') : '',
                isDelivery = dining_option == 'DINING_OPTION_DELIVERY',

                forced = modifiers.checkForced(),
                exceeded = modifiers.checkForcedMax();

            if (product.get("sold_by_weight") && !this.get("weight")) {
                return {
                    status: 'ERROR',
                    errorMsg: ERROR.BLOCK_WEIGHT_IS_NOT_VALID
                };
            }

            if (!App.Data.timetables.check_order_enable(isDelivery)) {
                return {
                    status: 'ERROR',
                    errorMsg: ERROR.BLOCK_STORE_IS_CLOSED
                };
            }

            if (!product.check_selected()) {
                return {
                    status: 'ERROR',
                    errorMsg: ERROR.SELECT_PRODUCT_ATTRIBUTES
                };
            }

            if (size || size === undefined) {
                if(Array.isArray(forced)) {
                    return format_error(forced, 'min');
                }
                if(Array.isArray(exceeded)) {
                    return format_error(exceeded, 'max');
                }
            } else if (size === null) {
                    return {
                        status: 'ERROR',
                        errorMsg: ERROR.SELECT_SIZE_MODIFIER
                    };
            }

            function format_error (error_mdfs, min_max) {
                return {
                    status: 'ERROR',
                    errorMsg: function() {
                        var tmpl = min_max == 'min' ? ERROR.FORCED_MODIFIER : ERROR.FORCED_MODIFIER_MAX;
                            tmpl = tmpl.split('|');
                        return tmpl[0].trim() + ' ' + error_mdfs.map(function(modifier) {
                            var Amount = modifier.get(min_max == 'min' ?  'minimum_amount' : 'maximum_amount'),
                                modifierClass = modifier.get('name'),
                                msg = tmpl[1].replace('%d', Amount).replace('%s', '&lsquo;' + modifierClass + '&rsquo;');
                            return msg;
                        }).join(', ')
                    }()
                };
            }

            return {
                status: 'OK'
            };
        },
        /**
         * get product attribute type
         */
        get_attribute_type: function() {
            return this.get('product').get('attribute_type');
        },
        /**
         * get attributes in list
         */
        get_attributes_list: function() {
            return this.get('product').get_attributes_list();
        },
        /**
         * get selected attributes
         * returns array with selected attributes
         *      or `undefined` if there is not any selected attributes
         */
        get_attributes: function() {
            var product = this.get('product');
            return product ? product.get_attributes() : undefined;
        },
        /**
         * check if order is gift
         */
        is_gift: function() {
            return this.get_product().get('is_gift');
        },
        /**
         * information about item for submit
         */
        item_submit: function(for_discounts) {
            var modifiers = [],
                special = this.get_special(),
                modifiersModel = this.get_modifiers();

            if (modifiersModel) {
                modifiers = modifiersModel.modifiers_submit();
            }

            var currency_symbol = App.Data.settings.get('settings_system').currency_symbol,
                uom = App.Data.settings.get("settings_system").scales.default_weighing_unit,
                product = this.get_product().toJSON(),
                price = Number(this.get('initial_price')) >= 0 ? this.get('initial_price') : product.price,
                item_obj = {
                    modifieritems: modifiers,
                    special_request: special,
                    price: price,
                    product: product.id,
                    product_name_override: this.overrideProductName(product),
                    quantity: this.get('quantity'),
                    product_sub_id: for_discounts ? this.get('product_sub_id') : undefined,
                };

            if (product.sold_by_weight) {
                var num_digits = App.Data.settings.get("settings_system").scales.number_of_digits_to_right_of_decimal,
                    label_for_manual_weights = App.Data.settings.get("settings_system").scales.label_for_manual_weights;

                item_obj.weight = this.get('weight');

                var str_label_for_manual_weights = label_for_manual_weights ? " " + label_for_manual_weights : "",
                    str_uom = uom ? "/" + uom : "";

                //constuct product_name_override as it's done by POS:
                item_obj.product_name_override = product.name + "\n " + item_obj.weight.toFixed(num_digits) + str_label_for_manual_weights + " @ "
                    + currency_symbol + round_monetary_currency(item_obj.initial_price) + str_uom;
            }


            if (product.gift_card_number) {
                item_obj.gift_card_number = product.gift_card_number;
            }

            return item_obj;
        },
        overrideProductName: function(product) {
            if (product.id == null) {
                switch (product.name) {
                    case MSG.BAG_CHARGE_ITEM:
                        return 'Bag Charge';
                    case MSG.DELIVERY_ITEM:
                        return 'Delivery Charge';
                    case MSG.AUTOAPPLY_FEE_ITEM:
                        return 'AutoApply Fee';
                    default:
                        trace("Product name '" + product.name + "' should be overridden");
                }
            }
            return product.name;
        },
        removeFreeModifiers: function() {
            var modifiers = this.get_modifiers();
            modifiers && modifiers.removeFreeModifiers();
        },
        restoreTax: function() {
            var product = this.get_product();
            product && product.restoreTax();
        },
        isServiceFee: function() {
            return this.get("isServiceFee") === true;
        },
        isDeliveryItem: function() {
            return this.get("isDeliveryItem") === true && this.collection.checkout.get('dining_option') == 'DINING_OPTION_DELIVERY';
        },
        isShippingItem: function() {
            return this.get("isDeliveryItem") === true && this.collection.checkout.get('dining_option') == 'DINING_OPTION_SHIPPING';
        },
        isRealProduct: function() {
            return this.get("id_product") !== null;
        },
        /**
         * @method
         * @returns true if product's `point_value` is number. Otherwise returns false.
         */
        hasPointValue: function() {
            var point_value = this.isRealProduct() && this.get_product().get('point_value');
            return typeof point_value == 'number' && !isNaN(point_value);
        }
    });

    App.Models.DeliveryChargeItem = App.Models.Myorder.extend({
        initialize: function() {
            var self = this,
                charge = this.get('total').get_delivery_charge() * 1;
            App.Models.Myorder.prototype.initialize.apply(this, arguments);
            this.set({
                product: new App.Models.Product({
                    name: MSG.DELIVERY_ITEM,
                    price: charge,
                    service_code: 0,
                    tax: this.get('total').get('prevailing_tax')
                }),
                isDeliveryItem: true,
                initial_price: charge,
                sum: charge
            });

            this.listenTo(this.get("product"), "change:price", function() {
                if (self.get('total')) {
                    self.get('total').set_delivery_charge(self.get("product").get("price"));
                }
            });
        }
    });

    App.Models.BagChargeItem = App.Models.Myorder.extend({
        initialize: function() {
            var charge = this.get('total').get_bag_charge() * 1;
            this.set({
                product: new App.Models.Product({
                    name: MSG.BAG_CHARGE_ITEM,
                    price: charge,
                    tax: 0
                }),
                initial_price: charge,
                sum: charge
            });
            App.Models.Myorder.prototype.initialize.apply(this, arguments);
        }
    });


    App.Models.DiscountItem = Backbone.Model.extend({
        defaults: {
            id: null,
            name: 'default',
            sum: 0,
            taxed: false,
            type: null
        },
        /**
         * get discount format string
         */
        toString: function() {
            return round_monetary_currency(this.get('sum'));
        },
        saveDiscount: function(key) {
            var data = this.toJSON();
            if (!key)
                key = 'orderLevelDiscount';
            setData(key, data);
        },
        loadDiscount: function(key) {
            if (!key)
                key = 'orderLevelDiscount';
            var data = getData(key);
            this.set(data);
        },
        zero_discount: function() {
            this.set({  name: "No discount",
                        sum: 0,
                        taxed: false,
                        id: null,
                        type: 1
                    });
        }
    });

    App.Models.ServiceFeeItem = App.Models.Myorder.extend({
        initialize: function() {
            App.Models.Myorder.prototype.initialize.apply(this, arguments);
            this.set({
                product: new App.Models.Product({
                    name: "default fee"
                }),
                isServiceFee: true
            });
        }
    });

    App.Collections.Myorders = Backbone.Collection.extend({
        model: App.Models.Myorder,
        quantity: 0,
        total: null, // total model
        discount: null, // discount for the order
        paymentResponse: null, // contains payment response
        initialize: function( ) {
            this.rewardsCard = new App.Models.RewardsCard();
            this.discount = new App.Models.DiscountItem({"discount_rate": 0});
            this.total = new App.Models.Total();
            this.checkout = new App.Models.Checkout();
            this.checkout.set('dining_option', App.Settings.default_dining_option);

            this.listenTo(this.checkout, 'change:dining_option', this.setShippingAddress, this);
            this.listenTo(this.checkout, 'change:dining_option', this.change_dining_option, this);

            this.listenTo(this, 'add', this.onModelAdded);
            this.listenTo(this, 'remove', this.onModelRemoved);
            this.listenTo(this, 'change', this.onModelChange);
        },
        change_dining_option: function(model, value, opts) {
            var obj, bag_charge = this.total.get_bag_charge() * 1,
                delivery_charge = this.total.get_delivery_charge() * 1,
                isShipping = value === 'DINING_OPTION_SHIPPING',
                customer = App.Data.customer;

            if(typeof opts !== 'object'  || !opts.avoid_delivery) {
//                if (value === 'DINING_OPTION_DELIVERY' && delivery_charge !== 0) {
//                    if (!this.deliveryItem) {
//                        this.deliveryItem = new App.Models.DeliveryChargeItem({total: this.total});
//                    }
//                    obj = this.find(function(model) {
//                        return model.get('product').id == null &&
//                               model.isDeliveryItem() === true;
//                    });
//                    if (obj == undefined)
//                       this.add(this.deliveryItem);
//
//                } else {
//                    this.remove(this.deliveryItem);
//                }

                // reset shipping
                if(!isShipping) {
                    this.total.set('shipping', null);
                }

                if (this.isBagChargeAvailable() && bag_charge !== 0) {
                    if (!this.bagChargeItem) {
                        this.bagChargeItem = new App.Models.BagChargeItem({total: this.total});
                    }
                    obj = this.find(function(model) {
                        return model.get('product').id == null &&
                               model.get('product').get('name') == MSG.BAG_CHARGE_ITEM;
                    });
                    if (obj == undefined)
                       this.add(this.bagChargeItem);

                } else {
                    this.remove(this.bagChargeItem);
                }
            }

            // if RETAIl mode and dining option was 'Shipping' need restore original taxes for products
            if(App.Skins.RETAIL == App.skin && model.previousAttributes().dining_option == 'DINING_OPTION_DELIVERY'
                && model.previousAttributes().dining_option != value)
                this.restoreTaxes();

            if(!this.paymentInProgress) {
                // need pass `update_shipping_options` flag if 'Shipping' order type is choosen at first time (shipping_selected === -1).
                this.update_cart_totals(isShipping && customer && customer.isDefaultShippingSelected() ? {update_shipping_options: true} : undefined);
            }
        },
        // check if user get maintenance after payment
        check_maintenance: function() {
            if (getData('orders')) {
                App.Data.settings.loadSettings();
                var mess = [],
                    index = 0;
                App.Settings.email && mess.push(App.Settings.email);
                App.Settings.phone && mess.push(App.Settings.phone);
                var errors = App.Data.errors;
                if (mess.length) {
                    errors.alert(MSG.ERROR_HAS_OCCURRED_WITH_CONTACT.replace(/%([^%]*)%/g, function(match, group) {
                        var data = mess[index];
                        index ++;
                        return data ? '<br>' + group + data + ',' : '';
                    }).replace(/,$/, '')); // user notification
                } else {
                    errors.alert(MSG.ERROR_HAS_OCCURRED); // user notification
                }
            }
        },
        get_remaining_delivery_amount: function() {
            if (this.checkout.get('dining_option') === 'DINING_OPTION_DELIVERY') {
                return this.total.get_remaining_delivery_amount();
            }
            return null;
        },
        get_delivery_charge: function() {
            if (this.checkout.get('dining_option') === 'DINING_OPTION_DELIVERY') {
                return this.total.get_delivery_charge();
            }
            return null;
        },
        get_bag_charge: function() {
            if (this.isBagChargeAvailable()) {
                return this.total.get_bag_charge();
            }
            return null;
        },
        /**
         * get quantity without delivery charge and bag charge items
         */
        get_only_product_quantity: function() {
            return _.reduce(this.models, function(qty, model) {
                    return model.get("id_product") != null ? qty + model.get('quantity') : qty;
                }, 0);
        },
        /**
         *  create orders from JSON.
         */
        addJSON: function(data) {
            var self = this, obj;
            data && data.forEach(function(element) {
                if (element.product.id) { // not add delivery and bag charge items here
                    var myorder = new App.Models.Myorder();
                    myorder.addJSON(element);
                    self.add(myorder);
                    myorder.set('initial_price', myorder.get_initial_price());
                } else {
                    //just update discounts for BagCharge and DeliveryCharge items:
                    if (element.product.name == MSG.BAG_CHARGE_ITEM) {
                        obj = self.findBagChargeItem();
                        obj && obj.get("discount").set(element.discount);
                    }
                    if (element.product.name == MSG.DELIVERY_ITEM) {
                        obj = self.findDeliveryItem();
                        obj && obj.get("discount").set(element.discount);
                    }
                }
            });
        },
        clone: function() {
            var orders = new App.Collections.Myorders();
            this.each(function(order) {
                orders.add(order.clone()) ;
            });
            orders.checkout.set('dining_option', this.checkout.get('dining_option'));
            orders.total = this.total.clone();
            return orders;
        },
        /**
         * if products in cart are only gift products, change dining option to DINING_OPTION_ONLINE
         */
        change_only_gift_dining_option: function() {
            var counter = 0;
            this.each(function(el) {
                el.is_gift() && counter++;
            });

            if (counter && counter === this.get_only_product_quantity()) {
                this.checkout.set('dining_option', 'DINING_OPTION_ONLINE');
                return true;
            } else if (this.checkout.get('dining_option') === 'DINING_OPTION_ONLINE') {
                this.checkout.revert_dining_option();
            }
            return false;
        },
        /**
         * get quantity without delivery charge and bag charge and gift items
         */
        not_gift_product_quantity: function() {
            var quantity = this.get_only_product_quantity();

            this.each(function(el) {
                el.is_gift() && quantity--;
            });

            return quantity;
        },
        /**
         *  Recalculate total when model add
         */
        onModelAdded: function(model) {
            var sum = model.get_modelsum(),
                countProd = model.get('quantity');

            this.quantity += countProd;

            model.set({
                'sum' : sum,
                'quantity_prev' : countProd,
                'product_sub_id' : model.cid   //set additional ID used for products with the same product_id
            }, {silent: true});

            this.change_only_gift_dining_option();

            if (model.isRealProduct()) {
                this.update_cart_totals({update_shipping_options: true});
            }
        },
        /**
         *  Recalculate total when model remove
         */
        onModelRemoved: function(model) {
            this.quantity -= model.get('quantity');

            this.change_only_gift_dining_option();

            if (this.get_only_product_quantity() < 1) {
                this.discount.zero_discount();
                this.bagChargeItem && this.bagChargeItem.get("discount").zero_discount();
                this.deliveryItem && this.deliveryItem.get("discount").zero_discount();
                this.removeServiceFees();
            }

            if (model.isRealProduct() && !this.paymentInProgress) {
                this.update_cart_totals({update_shipping_options: true});
            }
        },
        /**
         *  Recalculate total when model change
         */
        onModelChange: function(model) {

            var countProdPrev = model.get('quantity_prev'),
                sumNew = model.get_modelsum(),
                countProdNew = model.get('quantity');

            this.quantity = this.quantity + countProdNew - countProdPrev;

            model.set({
                'sum': sumNew,
                'quantity_prev': countProdNew
            }, {silent: true});

            model.changedAttributes() && model.changedAttributes().sum && model.trigger('update:sum', model);

            if (model.isRealProduct()) {
                this.update_cart_totals({update_shipping_options: true});
            }
        },
        findDeliveryItem: function() {
            return this.find(function(model) {
                return model.isDeliveryItem() === true;
            });
        },
        findBagChargeItem: function() {
            return this.find(function(model) {
                return model.get('product').id == null &&
                       model.get('product').get('name') == MSG.BAG_CHARGE_ITEM;
            });
        },
        removeServiceFees: function() {
            var fees = this.filter(function(obj){ return obj.isServiceFee(); });
            this.remove(fees);
        },
        /**
         * save order to localstorage
         */
        saveOrders: function() {
            var obj = this.findDeliveryItem();
            if (obj) {
                setData('delivery_data', {
                    name: obj.get('product').get('name'),
                    price: obj.get('product').get('price'),
                    tax: obj.get('product').get('tax')
                });
            }
            else {
                setData('delivery_data', {});
            }

            var orderToSave = this.toJSON();

            setData('orders', orderToSave);
            this.checkout.saveCheckout();
            this.rewardsCard.saveData();
            this.total.saveTotal();
            this.discount.saveDiscount();
        },
        /**
         * load order from localstorage
         */
        loadOrders: function() {
            this.empty_myorder();
            this.checkout.loadCheckout();
            this.rewardsCard.loadData();
            this.total.loadTotal();
            var orders = getData('orders');
            var delivery_data = getData('delivery_data');

            if (orders) {
                this.addJSON(orders);

                if (this.deliveryItem)
                    this.deliveryItem.get("product").set(delivery_data);
            }

            var total  = _.find(orders, function(item) {
                return item.total instanceof Object;
            });

            if (total) {
                total = total["total"];
                this.total.set({
                    subtotal: total.subtotal,
                    tax: total.tax,
                    surcharge: total.surcharge,
                    discounts: total.discounts
                });
            }

            this.discount.loadDiscount();
        },
        /**
         *
         * check collection myorders
         */
        _check_cart: function(opts) {
            var total = this.total.get_total() * 1,
                tip = this.total.get_tip() * 1,
                isDelivery = this.checkout.get('dining_option') === 'DINING_OPTION_DELIVERY',
                isOnlyGift = this.checkout.get('dining_option') === 'DINING_OPTION_ONLINE';

            opts = opts || {};

            if (this.get_only_product_quantity() === 0) {
                return {
                    status: 'ERROR',
                    errorMsg: MSG.ERROR_PRODUCT_NOT_SELECTED
                };
            }

            if (opts.tip && tip > total) {
                return {
                    status: 'ERROR',
                    errorMsg: MSG.ERROR_GRATUITY_EXCEEDS
                };
            }

            if (!opts.skipDeliveryAmount && isDelivery) {
                var remain = this.total.get_remaining_delivery_amount();
                if (remain > 0 ) {
                    return {
                        status: 'ERROR',
                        errorMsg: (MSG.ADD_MORE_FOR_DELIVERY).replace('%s', App.Data.settings.get('settings_system').currency_symbol + remain)
                    };
                }
            }

            var sum_quantity = this.not_gift_product_quantity(),
                min_items = App.Data.settings.get("settings_system").min_items;

            if (!opts.skipQuantity && sum_quantity < min_items && !isOnlyGift) {
                return {
                    status: 'ERROR_QUANTITY',
                    errorMsg: msgFrm(MSG.ERROR_MIN_ITEMS_LIMIT, min_items)
                };
            }

            return {
                status: 'OK'
            };
        },
        /**
         * check models;
         * options: {
         *     checkout: true - test checkout model
         *     customer: true - test customer model
         *     card: true - test card model
         *     order: true - test myorders collection
         *     tip: true - test add flag tip to order test,
         *     validationOnly: true - test whole order on backend
         * }
         * success - callback if checked is OK
         * error - callback or alert if checked is ERROR
         */
        check_order: function(options, success, error) {
            error = error || App.Data.errors.alert.bind(App.Data.errors); // user notification
            var fields = [],
                errorMsg = '',
                self = this,
                dining_option = this.checkout.get('dining_option');

            if (options.card) {
                var card = App.Data.card,
                    check_card = card.check();

                if (check_card.status === 'ERROR') {
                    errorMsg = check_card.errorMsg;
                } else if (check_card.status === 'ERROR_EMPTY_FIELDS') {
                    fields = fields.concat(check_card.errorList);
                }
            }

            if (options.giftcard) {
                var giftcard = App.Data.giftcard,
                    check_card = giftcard.check();

                if (giftcard.status === 'ERROR') {
                    errorMsg = check_card.errorMsg;
                } else if (check_card.status === 'ERROR_EMPTY_FIELDS') {
                    fields = fields.concat(check_card.errorList);
                }
            }

            if (options.stanfordcard) {
                var stanfordcard = App.Data.stanfordCard,
                    check_card = stanfordcard.check();

                if (stanfordcard.status === 'ERROR') {
                    errorMsg = check_card.errorMsg;
                } else if (check_card.status === 'ERROR_EMPTY_FIELDS') {
                    fields = fields.concat(check_card.errorList);
                }
            }

            if (options.checkout) {
                var checkout = this.checkout,
                    check_checkout = checkout.check();

                if (check_checkout.status === 'ERROR') {
                    return error(check_checkout.errorMsg); // user notification
                } else if (check_checkout.status === 'ERROR_EMPTY_FIELDS') {
                    fields = fields.concat(check_checkout.errorList);
                }
            }

            if (options.order) {
                var check_order = this._check_cart(options);

                if (check_order.status === 'ERROR_QUANTITY') {
                    if (!arguments[2]) { // if we don't set error callback, use usuall two button alert message or if we on the first page
                        return error(check_order.errorMsg, false, false, {
                            isConfirm: true,
                            confirm: {
                                ok: 'Ok',
                                cancel: 'Add Items',
                                cancelHide: options.first_page
                            },
                            callback: function(result) {
                                if (!result) App.Data.router.navigate('index', true);
                            }
                        }); // user notification
                    } else {
                        return error(check_order.errorMsg); // user notification
                    }
                }
                if (check_order.status !== 'OK') {
                    return error(check_order.errorMsg); // user notification
                }
            }

            if (options.customer) {
                var customer = App.Data.customer,
                    check_customer = customer.check(dining_option);

                if (check_customer.status === 'ERROR') {
                    errorMsg = check_customer.errorMsg;
                } else if (check_customer.status === 'ERROR_EMPTY_FIELDS') {
                    if(App.Skins.WEBORDER == App.skin || App.Skins.WEBORDER_MOBILE == App.skin) {
                        fields.splice.apply(fields, [0, 0].concat(check_customer.errorList));
                    } else {
                        fields = fields.concat(check_customer.errorList);
                    }
                }
            }

            if (fields.length) {
                return error(MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, fields.join(', '))); // user notification
            } else if (errorMsg) {
                return error(errorMsg); // user notification
            } else {
                _success.call(this);
            }

            function _success() {
                if (options.validationOnly) {
                    var tmp_model = new Backbone.View();
                    tmp_model.listenTo(this, 'paymentResponseValid', function() {
                        success();
                        tmp_model.remove();
                        self.trigger('paymentInProcessValid');
                    });
                    tmp_model.listenTo(this, 'paymentFailedValid', function(message) {
                        error(message);
                        tmp_model.remove();
                        self.trigger('paymentInProcessValid');
                    });
                    this.create_order_and_pay(PAYMENT_TYPE.NO_PAYMENT, true);
                } else {
                    success();
                }
            }
        },
        /**
         * Pay order and create order to backend.
         */
        create_order_and_pay: function(payment_type, validationOnly) {
            if(this.paymentInProgress)
                return;
            this.paymentInProgress = true;
            if(this.preparePickupTime() === 0) {
                this.trigger('cancelPayment');
                delete this.paymentInProgress;
                App.Data.errors.alert(MSG.ERROR_STORE_IS_CLOSED); // user notification
                return;
            }
            this.trigger('paymentInProcess');
            this.submit_order_and_pay(payment_type, validationOnly);
        },
        preparePickupTime: function() {
            var only_gift = this.checkout.get('dining_option') === 'DINING_OPTION_ONLINE';

            if(!only_gift) {
                var pickup = this.checkout.get('pickupTS'),
                    currentTime = App.Data.timetables.base(),
                    delivery = this.checkout.get('dining_option') === 'DINING_OPTION_DELIVERY',
                    time = App.Data.timetables.current_dining_time(delivery).getTime(),
                    lastPickupTime,
                    lastPT,
                    isASAP = this.checkout.get("isPickupASAP");

                if (pickup) pickup = new Date(time > pickup ? time : pickup);

                if (App.skin != App.Skins.RETAIL && (!pickup || !App.Data.timetables.checking_work_shop(pickup, delivery)) ) { //pickup may be null or string
                    return 0;
                }

                if (isASAP) {
                    lastPT = App.Data.timetables.getLastPTforWorkPeriod(currentTime);
                    if (lastPT instanceof Date){
                        lastPickupTime = format_date_1(lastPT.getTime() - App.Settings.server_time);
                    }
                    if (lastPT === 'not-found') {
                       //TODO: test this case by unit tests and remove this trace:
                    }
                    //for lastPT = "all-the-day" we should not pass any pickupTime to server. i.e. lastPickupTime is undefined
                }

                if (isASAP && App.Data.myorder.paymentResponse && App.Data.myorder.paymentResponse.data) {
                    pickup = new Date(App.Data.myorder.paymentResponse.data.asap_pickup_time);
                }

                this.checkout.set({
                    'pickupTime': isASAP ? 'ASAP (' + pickupToString(pickup) + ')' : pickupToString(pickup),
                    'createDate': format_date_1(Date.now()),
                    'pickupTimeToServer': pickup ? format_date_1(pickup.getTime() - App.Settings.server_time) : undefined,
                    'lastPickupTime': lastPickupTime
                });
            }
        },
        update_cart_totals: function(params) {
            if (!this.getDiscountsTimeout) //it's to reduce the number of requests to the server
                this.getDiscountsTimeout = setTimeout(this.get_cart_totals.bind(this, params), 100);
        },
        get_cart_totals: function(params) {
            var self = this;

            if (this.getDiscountsTimeout) {
                clearTimeout(this.getDiscountsTimeout);
                delete this.getDiscountsTimeout;
            }

            if (self.get_only_product_quantity() < 1) {
                self.total.set({
                    subtotal: 0,
                    tax: 0,
                    surcharge: 0,
                    discounts: 0
                });
            }

            if (self.get_only_product_quantity() < 1 || self.NoRequestDiscounts === true) {
                self.trigger("NoRequestDiscountsComplete");
                return (new $.Deferred()).reject();
            }

            if (this.get_discount_xhr) {
                this.get_discount_xhr.abort();
            }

            this.get_discount_xhr = this._get_cart_totals(params);
            this.get_discount_xhr.always(function() {
                delete self.get_discount_xhr;
            });

            return this.get_discount_xhr;
        },
        _get_cart_totals: function(params) {
            var myorder = this, checkout,
                customer = App.Data.customer,
                rewardsCard = this.rewardsCard.toJSON(),
                total = myorder.total.get_all(),
                items = [],
                order_info = {},
                is_apply_discount = params && params.apply_discount ? params.apply_discount : false,
                order = {
                    establishmentId: App.Data.settings.get("establishment"),
                    items: items,
                    orderInfo: order_info
                },
                shipping_address,
                isShipping,
                request;

            this.preparePickupTime();
            checkout = this.checkout.toJSON();

            if (checkout.discount_code && is_apply_discount) {
                order.discount_code = checkout.discount_code;
            }
            if (!is_apply_discount && checkout.last_discount_code) {
                order.discount_code = checkout.last_discount_code;
            }

            myorder.each(function(model) {
                if (!model.isServiceFee() && !model.isShippingItem())
                  items.push(model.item_submit(true));
            });

            order_info.dining_option = DINING_OPTION[checkout.dining_option];

            isShipping = checkout.dining_option === 'DINING_OPTION_SHIPPING' && customer
                && (shipping_address = customer.get('addresses')[customer.get('shipping_address')])
                && !customer._check_delivery_fields().length;

            if(isShipping) {
                order_info.shipping = customer.get('shipping_services')[customer.get('shipping_selected')] || {};
                order_info.customer =  {address: shipping_address};
            }

            // add rewards card and redemption code to apply discount
            if(rewardsCard.number && rewardsCard.redemption_code) {
                order_info.rewards_card = {
                    redemption: rewardsCard.redemption_code
                };
            }

            // add info for stanford card
            if(params && params.type === PAYMENT_TYPE.STANFORD && params.planId) {
                order.paymentInfo = {
                    type: params.type,
                    cardInfo: {planId: params.planId}
                }
            }

            var myorder_json = JSON.stringify(order);
            request = $.ajax({
                type: "POST",
                url: App.Data.settings.get("host") + "/weborders/cart_totals/",
                data: myorder_json,
                dataType: "json",
                success: function(data) {
                    if (!data || !data.status) {
                        reportErrorFrm(MSG.ERROR_OCCURRED + ' ' + MSG.ERROR_INCORRECT_AJAX_DATA);
                        return;
                    }
                    switch(data.status) {
                        case "OK":
                            if (checkout.discount_code && is_apply_discount) {
                                myorder.checkout.set('last_discount_code', checkout.discount_code);
                            }
                            if (myorder.get_only_product_quantity() > 0) {
                                myorder.process_cart_totals(data.data);
                            }
                            break;
                        case "DISCOUNT_CODE_NOT_FOUND":
                        case "DISCOUNT_CODE_NOT_APPLICABLE":
                            myorder.checkout.set('last_discount_code', null);
                            reportErrorFrm(MSG[data.status]);
                            myorder.update_cart_totals();//get discounts & totals w/o discount_code
                            break;
                        default:
                            if (!data.errorMsg) data.errorMsg = MSG.ERROR_NO_MSG_FROM_SERVER;
                            data.errorMsg = MSG.ERROR_OCCURRED + ' ' + data.errorMsg;
                            reportErrorFrm(data.errorMsg);
                    }//end of switch
                },
                error: function(xhr) {
                    if (xhr.statusText != "abort") {
                        reportErrorFrm(MSG.ERROR_GET_DISCOUNTS);
                    }
                },
                complete: function() {
                    myorder.trigger("DiscountsComplete");
                }
            });

            // Need to update shipping services if it's required
            if(isShipping && params && params.update_shipping_options) {
                App.Data.customer.get_shipping_services(request, function(response) {
                    if(response.data instanceof Object && response.data.shipping instanceof Object && Array.isArray(response.data.shipping.options)) {
                        return response.data.shipping.options;
                    } else {
                        return [];
                    }
                });
            }

            return request;

            function reportErrorFrm(message) {
                if (is_apply_discount) App.Data.errors.alert(message); // user notification
            }
        },
        process_cart_totals: function(json) {
            if (!(json instanceof Object)) return;

            var myorder = this, model;

            json.items.forEach(function(product) {
                var model = myorder.findWhere({ "product_sub_id": product.product_sub_id,
                                                "id_product": product.product });
                if (!model || !model.get("discount"))
                    return;

                if (product.discount instanceof Object) {
                    model.get("discount").set({ name: product.discount.name,
                                        sum: product.discount.sum,
                                        taxed: product.discount.taxed,
                                        id: product.discount.id,
                                        type: product.discount.type
                                    });
                } else {
                    model.get("discount").zero_discount();
                }
            });

            if (json.service_fees == undefined)
                json.service_fees = [];

            if (Array.isArray(json.service_fees)) {
                var myorder_fees = myorder.filter(function(obj){ return obj.isServiceFee(); });

                var diff = myorder_fees.filter(function(obj){
                           return !_.findWhere(json.service_fees, {id: obj.id});
                       });
                //remove all service fees from myorder which aren't present in the responce now
                myorder.remove(diff);

                //we create new service fee if needed or update old one:
                json.service_fees.forEach(function(item){
                    var fee = myorder.findWhere({id: item.id});
                    if (!fee) {
                        fee = new App.Models.ServiceFeeItem({id: item.id});
                        myorder.add(fee);
                    }
                    fee.get("product").set({name: item.name, price: item.amount});
                    fee.set({ initial_price: item.amount,
                              sum: item.amount });
                });
            }

            if (json.order_discount instanceof Object) {
                myorder.discount.set({ name: json.order_discount.name,
                                       sum: json.order_discount.sum,
                                       taxed: json.order_discount.taxed,
                                       id: json.order_discount.id,
                                       type: json.order_discount.type
                                    });
            } else {
                myorder.discount.zero_discount();
            }

            myorder.total.set({
                subtotal: json.subtotal,
                tax: json.tax,
                surcharge: json.surcharge,
                discounts: json.discounts,
                shipping: json.shipping && json.shipping.service_charge,
                shipping_discount: json.shipping && json.shipping.discount_sum,
            });
        },

        submit_order_and_pay: function(payment_type, validationOnly, capturePhase) {
            var myorder = this,
                get_parameters = App.Data.get_parameters,
                skin = App.Data.settings.get('skin'),
                total = myorder.total.get_all(),
                items = [],
                order_info = {},
                payment_info = {
                    tip: total.tip,
                    type: payment_type
                },
                order = {
                    skin: skin,
                    establishmentId: App.Data.settings.get("establishment"),
                    items: items,
                    orderInfo: order_info,
                    paymentInfo: payment_info
                };

            myorder.each(function(model) {
                if (!model.isServiceFee())
                    items.push(model.item_submit());
            });

            var call_name = [],
                checkout = this.checkout.toJSON(),
                rewardsCard = this.rewardsCard.toJSON(),
                card = App.Data.card && App.Data.card.toJSON(),
                customer = App.Data.customer.toJSON();

            if (checkout.last_discount_code) {
                order.discount_code = checkout.last_discount_code;
            }
            order_info.created_date = checkout.createDate;
            order_info.pickup_time = checkout.pickupTimeToServer;
            order_info.lastPickupTime = checkout.lastPickupTime;
            order_info.dining_option = DINING_OPTION[checkout.dining_option];
            order_info.notes = checkout.notes;
            if (checkout.dining_option == "DINING_OPTION_OTHER")  {
                order_info.notes += "\n" + _loc.DELIVERY_INFO + ": " + this.getOtherDiningOptionCallName();
            }
            order_info.asap = checkout.isPickupASAP;
            order_info.discount = this.discount.get("id") ? this.discount.toJSON() : undefined;

            var customerData = this.getCustomerData();
            call_name = call_name.concat(customerData.call_name);
            $.extend(payment_info, customerData.payment_info);

            if(checkout.dining_option === 'DINING_OPTION_DELIVERY') {
                payment_info.address = getAddress();
            }

            // process payment type
            var pt = PaymentProcessor.processPaymentType(payment_type, myorder);
            $.extend(payment_info, pt);

            // if payment has failed need emit 'paymentResponse' event and abort execution
            if (payment_info.errorMsg) {
                return reportPaymentError(payment_info.errorMsg);
            }

            var notifications = this.getNotifications();
            order_info.call_name = call_name.join(' / ');
            if(notifications)
                order.notifications = notifications;

            if(rewardsCard.number) {
                if (rewardsCard.redemption_code) {
                    // To redeem points card number must be provided in separate request together with captcha
                    order_info.rewards_card = {
                        redemption: rewardsCard.redemption_code
                    };
                } else {
                    // Just collect points
                    order_info.rewards_card = {
                        number: rewardsCard.number
                    };
                }
            }

            if(checkout.dining_option === 'DINING_OPTION_SHIPPING') {
                order_info.shipping = customer.shipping_services[customer.shipping_selected] || undefined;
                order_info.customer = !order_info.shipping ? undefined : _.extend({
                    address: getAddress()
                }, order.paymentInfo);
            }

            var myorder_json = JSON.stringify(order),
                successValidation;
            $.ajax({
                type: "POST",
                url: App.Data.settings.get("host") + "/weborders/" + (validationOnly ? "pre_validate/" : "create_order_and_pay_v1/"),
                data: myorder_json,
                dataType: "json",
                success: function(data) {
                    if (!data || !data.status) {
                        reportErrorFrm(MSG.ERROR_OCCURRED + ' ' + MSG.ERROR_INCORRECT_AJAX_DATA);
                        return;
                    }
                    myorder.paymentResponse = data instanceof Object ? _.extend(data, {paymentType: payment_type}) : {};
                    myorder.paymentResponse.capturePhase = capturePhase;

                    switch(data.status) {
                        case "OK":
                            if (validationOnly) {
                                successValidation = Backbone.$.Deferred();
                                successValidation.then(myorder.trigger.bind(myorder, 'paymentResponseValid'));
                            } else {
                                if (data.balances && data.balances.stanford) {
                                    App.Data.stanfordCard && payment_type === PAYMENT_TYPE.STANFORD && App.Data.stanfordCard.updatePlans(data.balances.stanford);
                                }
                                myorder.trigger('paymentResponse');
                            }

                            break;
                        case "REDIRECT": // need to complete payment on external site
                            PaymentProcessor.handleRedirect(payment_type, myorder, data);
                            break;
                        case "PAYMENT_INFO_REQUIRED": //need to make ajax call payment gateway
                            PaymentProcessor.handlePaymentDataRequest(payment_type, myorder, data);
                            break;
                        case "INSUFFICIENT_STOCK":
                            var message = '<span style="color: red;"> <b>' + MSG.ERROR_INSUFFICIENT_STOCK + '</b> </span> <br />';
                            for (var i = 0, j = data.responseJSON.length; i < j; i++) {
                                var current_element = data.responseJSON[i],
                                    order = myorder.where({id_product: current_element.id}),
                                    product = order[0].get_product(),
                                    name_product = product.get("name"),
                                    stock_amount = current_element.stock_amount,
                                    initial_product = App.Data.products[product.get('id_category')].get_product(current_element.id);

                                if (stock_amount === 0) {
                                    myorder.remove(order);
                                    initial_product.set('active', false);
                                } else {
                                    initial_product.set('stock_amount', current_element.stock_amount);
                                }
                                message += "<b>" + name_product + "</b>: requested - " + current_element.requested + ", stock amount - " + current_element.stock_amount + ". <br />";
                            }

                            data.errorMsg = message;
                            reportError(data.errorMsg);
                            break;
                        case "ORDERS_PICKUPTIME_LIMIT":
                            data.errorMsg = MSG.ERROR_ORDERS_PICKUPTIME_LIMIT;
                            reportErrorFrm(data.errorMsg);
                            break;
                        case "REWARD CARD UNDEFINED":
                            reportErrorFrm(MSG.REWARD_CARD_UNDEFINED);
                            break;
                        case "DELIVERY_ADDRESS_ERROR":
                            reportErrorFrm(data.errorMsg);
                            break;
                        case "PRODUCTS_NOT_AVAILABLE_FOR_SELECTED_TIME":
                            reportErrorFrm(data.errorMsg + " " + MSG.PRODUCTS_VALID_TIME + "<br/>" + format_timetables(data.responseJSON["timetables"], ",<br/>"));
                            break;
                        default:
                            data.errorMsg = MSG.ERROR_OCCURRED + ' ' + data.errorMsg;
                            reportErrorFrm(data.errorMsg);
                    }//end of switch
                },
                error: function(xhr) {
                    myorder.paymentResponse = {
                        status: 'ERROR',
                        errorMsg: MSG.ERROR_SUBMIT_ORDER
                    };
                    reportErrorFrm(MSG.ERROR_SUBMIT_ORDER);
                },
                complete: function(xhr, result) {
                    payment_type === PAYMENT_TYPE.PAYPAL_MOBILE && $.mobile.loading("hide");
                    delete myorder.paymentInProgress;
                    successValidation && successValidation.resolve();
                }
            });

            function reportErrorFrm(message) {
                if (validationOnly) {
                    myorder.trigger('paymentFailedValid', [message]);
                } else if (capturePhase) {
                    reportPaymentError(message);
                } else {
                    myorder.trigger('paymentFailed');
                    App.Data.errors.alert(message, false, false, {
                        errorServer: true,
                        typeIcon: 'warning'
                    }); // user notification
                }
            }

            function reportError(message) {
                if (validationOnly) {
                    myorder.trigger('paymentFailedValid', [message]);
                } else {
                    myorder.trigger('paymentFailed', [message]);
                }
            }

            function reportPaymentError(message) {
                myorder.paymentResponse = {status: 'error', errorMsg: message, capturePhase: capturePhase};
                myorder.trigger('paymentResponse');
            }

            function getAddress() {
                return customer.addresses[App.Data.customer.isDefaultShippingAddress() ? customer.addresses.length - 1 : customer.shipping_address];
            }
        },
        getOrderSeatCallName: function(phone) {
            var checkout = this.checkout.toJSON(),
                call_name = [],
                seatInfo = '';
            if (checkout.level)
                seatInfo += ' Level: ' + checkout.level;
            if(checkout.section)
                seatInfo += ' Sect: ' + checkout.section;
            if(checkout.row)
                seatInfo += ' Row: ' + checkout.row;
            if(checkout.seat)
                seatInfo += ' Seat: ' + checkout.seat;
            seatInfo.length > 0 && call_name.push($.trim(seatInfo));
            phone && call_name.push(phone);
            return call_name;
        },
        getOtherDiningOptionCallName: function(phone) {
            var other_dining_options = this.checkout.get('other_dining_options'),
                call_name = [],
                seatInfo = '';
            other_dining_options.each(function(model){
                if (model.get('value')) {
                    seatInfo += ' ' + model.get('name') + ': ' + model.get('value');
                }
            });
            seatInfo.length > 0 && call_name.push($.trim(seatInfo));
            phone && call_name.push(phone);
            return call_name;
        },
        getCustomerData: function() {
            var checkout = this.checkout.toJSON(),
                customer = App.Data.customer.toJSON(),
                contactName = customer.first_name + ' ' + customer.last_name,
                call_name = [],
                payment_info = {};

            contactName && call_name.push(contactName);

            checkout.pickupTime && call_name.push(checkout.pickupTime);
            if (customer.phone) {
                call_name.push(customer.phone);
            }

            if (customer.phone) {
                payment_info.phone = customer.phone;
            }
            if (customer.email) {
                payment_info.email = customer.email;
            }
            payment_info.first_name = customer.first_name;
            payment_info.last_name = customer.last_name;

            return {
                call_name: call_name,
                payment_info: payment_info
            };
        },
        getNotifications: function() {
            var checkout = this.checkout.toJSON(),
                customer = App.Data.customer.toJSON(),
                skin = App.Data.settings.get('skin');

            if (customer.email || checkout.email) {
                return [{
                    skin: skin,
                    type: 'email',
                    destination: customer.email || checkout.email
                }];
            }
        },
        empty_myorder: function() {
            this.remove(this.models); // this can lead to add bagChargeItem or/and deliveryItem automaticaly,
                                      // so one/two items still exist in the collection and total is non zero.
            this.remove(this.bagChargeItem);
            this.remove(this.deliveryItem);

            this.total.empty(); //this is for reliability cause of raunding errors exist.

            this.checkout.set('dining_option', 'DINING_OPTION_ONLINE');
            this.checkout.set('notes', '');
        },
        removeFreeModifiers: function() {
            this.each(function(item) {
                item.removeFreeModifiers();
            });
        },
        isShippingOrderType: function() {
            return this.checkout.get('dining_option') == 'DINING_OPTION_SHIPPING';
        },
        restoreTaxes: function() {
            this.each(function(item) {
                item.restoreTax();
            });
        },
        isBagChargeAvailable: function() {
            return this.checkout.isBagChargeAvailable();
        },
        /**
         * Cleaning of the cart.
         */
        clearData: function() {
            this.empty_myorder();
            this.saveOrders();
        },
        /**
         * Save paymentResponse in sessionStorage. An amount of payment responses may be more than 1 per session. Need use unique id for each.
         *
         * @param {string} uid - Unique identificator
         */
        savePaymentResponse: function(uid) {
            if(typeof uid == 'string' && uid.length && this.paymentResponse) {
                setData(uid + '.paymentResponse', this.paymentResponse);
            }
        },
        /**
         * Restore paymentResponse and remove it from sessionStorage. An amount of payment responses may be more than 1 per session. Need use unique id for each.
         *
         * @param {string} uid - Unique identificator
         */
        restorePaymentResponse: function(uid) {
            if(typeof uid != 'string' || !uid.length) {
                return;
            }
            uid = uid + '.paymentResponse';
            var paymentResponse = getData(uid);
            if(paymentResponse) {
                removeData(uid);
                return this.paymentResponse = paymentResponse;
            }
        },
        /*
         * @method
         * Set shipping address after dinign_option change.
         *
         * @param {Object} model - App.Data.myorder.checkout object
         * @param {string} value - result of App.Data.myorder.checkout.get('dining_option')
         *
         * @returns {numder} selected shipping address
         */
        setShippingAddress: function(model, value) {
            var customer = App.Data.customer,
                shipping_addresses = {};

            if(!customer) {
                return;
            }

            shipping_addresses.DINING_OPTION_DELIVERY = customer.get('deliveryAddressIndex'),
            shipping_addresses.DINING_OPTION_SHIPPING = customer.get('shippingAddressIndex')

            if (value == 'DINING_OPTION_DELIVERY' || value == 'DINING_OPTION_SHIPPING') {
                customer.set('shipping_address', shipping_addresses[value]);
            } else {
                customer.set('shipping_address', customer.defaults.shipping_address);
            }

            return customer.get('shipping_address');
        },
        /**
         * @method
         * @param discount - discount which may be applied to items.
         * @returns array of items with products which have point value and may be redeemed with points reward.
         */
        getItemsWithPointsRewardDiscount: function(discount) {
            var itemsWithDiscount = [];

            discount || (discount = 0);

            this.filter(function(item){
                return item.hasPointValue();
            }).sort(function(x, y) {
                return -1 * (x.get_modelsum() - y.get_modelsum());
            }).some(function(item) {
                var oldSum = item.get_modelsum(),
                    newSum = oldSum - discount;
                item.set('reward_discount', newSum <= 0 ? oldSum : discount);
                var virtual_item = item.clone();
                virtual_item.set('quantity', 1);
                itemsWithDiscount.push(virtual_item);
                discount -= oldSum;
                return discount <= 0;
            });
            return itemsWithDiscount;
        },
        splitAllItemsWithPointValue: function() {
            this.each(this.splitItemWithPointValue);
        },
        splitItemWithPointValue: function(item, silentFlag) {
            silentFlag = !!silentFlag;
            var quantity = item.get('quantity');
            if (item.hasPointValue() && quantity > 1) {
                var hasSameSingleQuantityItem = App.Data.myorder.findWhere({
                    id_product: item.get("id_product"),
                    quantity: 1
                });
                if (!hasSameSingleQuantityItem) {
                    var singleItem = item.clone();
                    singleItem.set('quantity', 1, {silent: silentFlag});
                    App.Data.myorder.add(singleItem); // Add 1 item
                    item.set('quantity', quantity - 1, {silent: silentFlag}); // Update quantity with N-1
                }
            }
        },
        splitItemAfterQuantityUpdate : function(item, oldQuantity, newQuantity, silentFlag) {
            silentFlag = !!silentFlag;
            if (item.get('discount').get('name') === 'Reward' && oldQuantity == 1 && newQuantity != 1) {
                this.splitItemWithPointValue(item, silentFlag);
            }
        }
    });
});
