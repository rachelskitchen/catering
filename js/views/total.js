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

define(["backbone", "factory", "generator"], function(Backbone) {
    'use strict';

    App.Views.CoreTotalView = {};

    App.Views.CoreTotalView.CoreTotalMainView = App.Views.FactoryView.extend({
        name: 'total',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.update, this);
        },
        render: function() {
            var model = {};
            model.subTotal = this.get_subtotal();
            model.discount_allow = App.Settings.accept_discount_code === true;
            model.discounts = this.model.get_discounts_str();
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            this.$el.html(this.template(model));
        },
        update: function() {
            this.$('.total').text(round_monetary_currency(this.get_subtotal()));
            this.$('.discount').text(this.model.get_discounts_str());
        },
        get_subtotal: function() {
            if (this.collection.get_only_product_quantity() == 0) {
                return round_monetary_currency(0);
            }
            var dining_option = this.collection.checkout.get('dining_option');
            return dining_option != 'DINING_OPTION_DELIVERY' && dining_option != 'DINING_OPTION_SHIPPING' ? this.collection.total.get_total()
                : round_monetary_currency(this.collection.total.get_total() - this.collection.total.get_delivery_charge());
        }
    });

    App.Views.CoreTotalView.CoreTotalCheckoutView = App.Views.FactoryView.extend({
        name: 'total',
        mod: 'checkout',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('tip'), 'change', this.updateAll, this);
            this.listenTo(this.model, 'change', this.updateAll, this); // not update all, because we need show or not show surcharge row, not only update sum
            this.listenTo(this.collection.checkout, 'change:dining_option', this.updateDeliveryCharge, this);
            this.listenTo(this.model.get('delivery'), 'change', this.updateAll, this);
            this.updateDeliveryCharge(this.collection.checkout, this.collection.checkout.get('dining_option'));
        },
        render: function() {
            var data = this.getFormData();
            this.$el.html(this.template(data));
        },
        getFormData: function() {
            var model = {};
            model.subTotal = this.get_subtotal();
            model.surcharge = this.model.get_surcharge();
            model.grandTotal = this.model.get_grand();
            model.tax = this.model.get_tax();
            model.tip = this.model.get_tip();
            model.currency_symbol = App.Settings.currency_symbol;
            model.deliveryCharge = this.model.get_delivery_charge();
            model.tip_allow = App.Settings.accept_tips_online === true;
            model.discount_allow = App.Settings.accept_discount_code === true;
            model.discounts = this.model.get_discounts_str();
            model.deliveryDiscount = this.collection.deliveryItem ? this.collection.deliveryItem.get("discount").get("sum") : 0;
            model.deliveryDiscount = round_monetary_currency(model.deliveryDiscount);

            if (this.collection.get_only_product_quantity() == 0) {
                model.surcharge = round_monetary_currency(0);
                model.tax = round_monetary_currency(0);
                model.grandTotal = round_monetary_currency(0);
                if($('span[data-amount="other"]').hasClass('selected') == false) {
                    model.tip = round_monetary_currency(0);
                    model.grandTotal = round_monetary_currency(0);
                }
                else {
                    model.grandTotal = round_monetary_currency(model.tip * 1);
                }
            }

            return model;
        },
        updateAll: function() {
            var data = this.getFormData();
            this.updateForm(data);
            this.updateDeliveryCharge(this.collection.checkout, this.collection.checkout.get('dining_option'));
        },
        updateForm: function(data) {
            if (!data) return;
            if (data.surcharge > 0){
                this.$('.surcharge_item').removeClass('hide');
            }else{
                this.$('.surcharge_item').addClass('hide');
            }
            if (data.deliveryDiscount > 0){
                this.$('.delivery_discount_item').removeClass('hide');
            }else{
                this.$('.delivery_discount_item').addClass('hide');
            }
            this.$('.subtotal').text(data.subTotal);
            this.$('.surcharge').text(data.surcharge);
            this.$('.tax').text(data.tax);
            this.$('.discount').text(data.discounts);
            this.$('.delivery-discount').text(data.deliveryDiscount);
            this.$('.tip').text(data.tip);
            this.$('.grandtotal').text(data.grandTotal);
        },
        updateDeliveryCharge: function(model, value) {
            var delivery = this.model.get_delivery_charge();
            if((value == 'DINING_OPTION_DELIVERY' || value == 'DINING_OPTION_SHIPPING') && delivery * 1 > 0 && this.collection.get_only_product_quantity() > 0) {
                this.$('span.delivery-charge').text(delivery);
                this.$('li.delivery-charge').show();
                this.$('ul.confirm').addClass('has-delivery');
                var deliveryDiscount = this.collection.deliveryItem ? this.collection.deliveryItem.get("discount").get("sum") : 0;
                if (deliveryDiscount > 0) {
                    this.$('.delivery_discount_item').removeClass('hide');
                }
            } else {
                this.$('li.delivery-charge').hide();
                this.$('.delivery_discount_item').addClass('hide');
                this.$('ul.confirm').removeClass('has-delivery');
            }
        },
        get_subtotal: function() {
            if (this.collection.get_only_product_quantity() == 0) {
                return round_monetary_currency(0);
            }

            return this.collection.total.get_total_wo_delivery();
        }
    });

    return new (require('factory'))(function() {
        App.Views.TotalView = {};
        App.Views.TotalView.TotalMainView = App.Views.CoreTotalView.CoreTotalMainView;
        App.Views.TotalView.TotalCheckoutView = App.Views.CoreTotalView.CoreTotalCheckoutView;
    });
});
