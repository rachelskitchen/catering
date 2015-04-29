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
            this.listenTo(this.model, 'change', this.updateAll, this);
        },
        render: function() {            
            this.$el.html(this.template());
            this.applyBindings();
        },
        updateAll: function() {
            this.viewModel.set(this.getData());
        },
        getData: function() {
            return {
                subTotal: this.get_subtotal(),
                discounts: this.model.get_discounts_str()
            };
        },
        bindings: {
            ".total_discounts": "classes:{hide:hide_discounts}",
            ".discount": "text:discounts",
            ".total": "text:subTotal"
        },
        viewModel: function(view) {
            var viewModel = Backbone.Epoxy.Model.extend({
                defaults: view.getData(),
                computeds: {
                    hide_discounts: function() {
                        return this.get("discounts")*1 <= 0;
                    }
                }
            });
            return App.modelViews.CoreTotalMain = new viewModel();
        },
        get_subtotal: function() {
            if (this.collection.get_only_product_quantity() == 0) {
                return round_monetary_currency(0);
            }
            var dining_option = this.collection.checkout.get('dining_option');
            if (dining_option == 'DINING_OPTION_DELIVERY') {
                return this.collection.total.get_total_wo_delivery();
            } 
            else {
                return this.collection.total.get_total();
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
        getData: function() {
            return {
                subTotal: this.get_subtotal(),
                surcharge: this.model.get_surcharge(),
                grandTotal: this.model.get_grand(),
                tax: this.model.get_tax(),
                tip: this.model.get_tip(),
                deliveryCharge: this.model.get_delivery_charge(),
                discounts: this.model.get_discounts_str(),
                deliveryDiscount: round_monetary_currency(this.collection.deliveryItem ? this.collection.deliveryItem.get("discount").get("sum") : 0),
                dining_option: this.collection.checkout.get('dining_option')
            };
        },
        bindings: {
            ".total_discounts": "classes:{hide:hide_discounts}",
            "li.delivery-charge": "classes:{hide:hide_delivery}",
            ".delivery_discount_item": "classes:{hide:hide_delivery_discount}",
            ".surcharge_item": "classes:{hide:hide_surcharge_item}",
            ".discount": "text:discounts",
            ".subtotal": "text:subTotal",
            "span.delivery-charge": "text:deliveryCharge",
            ".delivery-discount": "text:deliveryDiscount",
            ".surcharge": "text:surcharge",
            ".tax": "text:tax",
            ".tip": "text:tip",
            ".grandtotal": "text:grandTotal",
            ".delivery_charge_title": "text:delivery_charge_str",
            ".delivery_discount_title": "text:delivery_discount_str"
        },
        viewModel: function(view) {
            var viewModel = Backbone.Epoxy.Model.extend({
                defaults: view.getData(),
                computeds: {
                    hide_discounts: function() {
                        return this.get("discounts")*1 <= 0;
                    },
                    hide_delivery: function() {
                        if (view.collection.get_only_product_quantity() > 0 && 
                             ((this.get('dining_option') == 'DINING_OPTION_DELIVERY' &&  this.get('deliveryCharge')*1 > 0) || 
                               this.get('dining_option') == 'DINING_OPTION_SHIPPING')) {
                            return false;
                        } else
                            return true;
                    },
                    hide_delivery_discount: function() {
                        return this.get('deliveryDiscount')*1 <= 0;
                    },
                    hide_surcharge_item: function() {
                        return this.get('surcharge')*1 <= 0;
                    },
                    delivery_charge_str: function() {
                        return this.get('dining_option') == 'DINING_OPTION_SHIPPING' ? 'Shipping:' : 'Delivery Charge:'
                    },
                    delivery_discount_str: function() {
                        return this.get('dining_option') == 'DINING_OPTION_SHIPPING' ? 'Shipping Discount:' : 'Delivery Discount:'
                    }
                }
            });
            return App.modelViews.CoreTotalCheckout = new viewModel();
        }
    });    

    return new (require('factory'))(function() {
        App.Views.TotalView = {};
        App.Views.TotalView.TotalMainView = App.Views.CoreTotalView.CoreTotalMainView;
        App.Views.TotalView.TotalCheckoutView = App.Views.CoreTotalView.CoreTotalCheckoutView;
    });
});
