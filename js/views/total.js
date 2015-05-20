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

define(["backbone", "backbone_epoxy", "factory", "generator"], function(Backbone) {
    'use strict';

    App.Views.CoreTotalView = {};
    App.Views.CoreTotalView.CoreTotalMainView = Backbone.Epoxy.View.extend(App.Views.FactoryView.prototype).extend({
        name: 'total',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.$el.html(this.template());
            this.applyBindings();
        },
        bindings: {
            ".total_discounts": "classes:{hide:hide_discounts}",
            ".discount": "text:discountsFrm",
            ".total": "text:totalFrm"
        },
        computeds: {
            totalFrm: {
                deps: ['total', 'dining_option'], // depends on attr. 'total' of this.model
                get: function() {
                    return this.get_subtotal();
                }
            },
            discountsFrm: {
                deps: ["discounts"],  //depends on attr. 'discounts' of this.model
                get: function() {
                    return this.model.get_discounts_str();
                }
            },
            hide_discounts: function() {
                return this.getBinding("discounts")*1 <= 0;
            }
        },
        get_subtotal: function() {
            if (this.collection.get_only_product_quantity() == 0) {
                return round_monetary_currency(0);
            }
            return this.collection.total.get_total();
        },
        integrity_test: function() { // #23033
            if (typeof testA_3 != 'function') {
                console.error('Integrity error. ' + MSG.ERROR_INTEGRITY_TEST_MAIN);
            }
        }
    });

    App.Views.CoreTotalView.CoreTotalCheckoutView = App.Views.CoreTotalView.CoreTotalMainView.extend({
        name: 'total',
        mod: 'checkout',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('tip'), 'change', this.updateAll, this);
            this.listenTo(this.model, 'change', this.updateAll, this);
            this.listenTo(this.collection.checkout, 'change:dining_option', this.updateAll, this);
            this.listenTo(this.model.get('delivery'), 'change', this.updateAll, this);
        },
        updateAll: function() {
            this.viewModel.set(this.getData());
        },
        getData: function() {
            var dining_option = this.collection.checkout.get('dining_option');
            return {
                surcharge: this.model.get_surcharge(),
                grandTotal: this.model.get_grand(),
                tax: this.model.get_tax(),
                tip: this.model.get_tip(),
                deliveryCharge: this.model.get_delivery_charge(),
                shippingCharge: this.model.get_shipping_charge(),
                deliveryDiscount: round_monetary_currency(this.collection.deliveryItem ? this.collection.deliveryItem.get("discount").get("sum") : 0),
                shippingDiscount: round_monetary_currency(this.model.get('shipping_discount') || 0),
                dining_option: dining_option
            };
        },
        bindings: {
            ".total_discounts": "classes:{hide:hide_discounts}",
            "li.delivery-charge": "classes:{hide:hide_delivery}",
            ".delivery_discount_item": "classes:{hide:hide_delivery_discount}",
            ".shipping_charge_item": "classes:{hide:hide_shipping}",
            ".shipping_discount_item": "classes:{hide:hide_shipping_discount}",
            ".surcharge_item": "classes:{hide:hide_surcharge_item}",
            ".discount": "text:discountsFrm",
            ".subtotal": "text:totalFrm",
            "span.delivery-charge": "text:deliveryCharge",
            ".delivery-discount": "text:deliveryDiscount",
            ".shipping_charge": "text:shippingCharge",
            ".shipping_discount": "text:shippingDiscount",
            ".surcharge": "text:surcharge",
            ".tax": "text:tax",
            ".tip": "text:tip",
            ".grandtotal": "text:grandTotal",
        },
        viewModel: function(view) {
            var viewModel = Backbone.Epoxy.Model.extend({
                defaults: view.getData(),
                computeds: {
                    hide_delivery: {
                        deps: ['dining_option', 'deliveryCharge'],
                        get: function(dining_option, deliveryCharge) {
                             return dining_option != 'DINING_OPTION_DELIVERY' ||  deliveryCharge*1 <= 0 || view.collection.get_only_product_quantity() <= 0;
                        }
                    },
                    hide_shipping: function() { //for right automatic binding discovering you may use AND/OR functions instead of &&/|| inline operation with deps: [...]
                        return OR(this.get('dining_option') != 'DINING_OPTION_SHIPPING', this.get('shippingCharge')*1 <= 0) || view.collection.get_only_product_quantity() <= 0;
                    },
                    hide_delivery_discount: function() {
                        var dining_option = this.get('dining_option');
                        return this.get('deliveryDiscount')*1 <= 0 || dining_option != 'DINING_OPTION_DELIVERY';
                    },
                    hide_shipping_discount: function() { //for right binding discovering you may use AND/OR functions instead of &&/|| operations with extra value declaration
                        return OR(this.get('shippingDiscount')*1 <= 0, this.get('dining_option') != 'DINING_OPTION_SHIPPING');
                    },
                    hide_surcharge_item: function() {
                        return this.get('surcharge')*1 <= 0;
                    }
                }
            });
            return App.lastModelViews.CoreTotalCheckout = new viewModel();
        }
    });

    return new (require('factory'))(function() {
        App.Views.TotalView = {};
        App.Views.TotalView.TotalMainView = App.Views.CoreTotalView.CoreTotalMainView;
        App.Views.TotalView.TotalCheckoutView = App.Views.CoreTotalView.CoreTotalCheckoutView;
    });
});