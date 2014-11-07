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

define(["backbone", 'tip', 'delivery'], function(Backbone) {
    'use strict';

    App.Models.Total = Backbone.Model.extend({
        defaults: {
            total: 0,
            tax: 0,
            surcharge: 0,
            tip: null,
            delivery: null,
            bag_charge: null,
            discount_total: 0, //sum of all discounts
            tax_country: '',
            prevailing_surcharge: null,
            prevailing_tax: null
        },
        initialize: function(opts) {
            var settings = App.Data.settings.get("settings_system"),
                delivery = opts && opts.delivery_item || {},
                set = {
                    bag_charge: settings.auto_bag_charge,
                    tax_country: settings.tax_country,
                    prevailing_surcharge: settings.prevailing_surcharge,
                    prevailing_tax: settings.prevailing_tax,
                    tip: new App.Models.Tip(),
                    delivery: new App.Models.Delivery(delivery)
                };
            opts && delete opts.delivery_item;
            this.unset('delivery_item');
            opts = opts instanceof Object ? opts : {};
            this.set($.extend({}, this.defaults, set, opts));

            this.listenTo(this.get('delivery'), 'change:price', function() {
                var deliveryItem = App.Data.myorder.find(function(model) {
                        return model.get('product').id == null &&
                               model.get('product').get('isDeliveryItem') === true;
                    });
                if (deliveryItem)
                    App.Data.myorder.onModelChange(deliveryItem);
            });
        },
        /**
         * get Total
         */
        get_total: function() {
            return round_monetary_currency(this.get('total'));
        },
        /**
         * get Tax
         */
        get_tax: function() { // tax
            return round_monetary_currency(this.get('tax'));
        },
        /**
         * get Surcharge
         */
        get_surcharge: function() {
            return round_monetary_currency(this.get('surcharge'));
        },
        /**
         * Get total sum of order (subtotal + surcharge + tax) without tip.
         */
        get_subtotal: function() { // total + surcharge + tax
            var tax = this.get_tax() * 1,
                total = this.get_total() * 1,
                subtotal = total,
                surcharge = this.get_surcharge() * 1;

            if(!App.TaxCodes.is_tax_included(this.get('tax_country'))) {
                subtotal = total + surcharge + tax;
            }

            return round_monetary_currency(subtotal);
        },
        /**
         * get total discount
         */
        get_discount_total: function() {
            return round_monetary_currency(this.get('discount_total'));
        },
        /*
         * Get tip.
         */
        get_tip: function() {
            return round_monetary_currency(this.get('tip').get_tip(this.get_subtotal()));
        },
        /**
         * Get total sum of order (subtotal + tax + tip).
         */
        get_grand: function() { // total + surcharge + tax + tip
            var subtotal = this.get_subtotal() * 1, // get total sum of order (subtotal + tax) without tip
                tip = this.get_tip() * 1, // get tip
                grand_total = subtotal + tip;

            return round_monetary_currency(grand_total);
        },
        /**
         * Get delivery charge. return 0 if delivery is disabled.             *
         */
        get_delivery_charge: function() {
            var delivery = this.get('delivery'),
                charge = delivery.get('enable') ? delivery.get('charge') : 0;
            return round_monetary_currency(charge);
        },
        set_delivery_charge: function(charge) {
            this.get('delivery').set('charge', charge);
        },
        /**
         * get bag charge
         */
        get_bag_charge: function() {
            return round_monetary_currency(this.get('bag_charge'));
        },
        /**
         * Get remaining delivery amount. Return null if delivery is disabled, 0 if total is enough else return remaining amount
         */
        get_remaining_delivery_amount: function() {
            var delivery = this.get('delivery'),
                min_amount = delivery.get('min_amount'),
                charge = delivery.get('charge'),
                diff = min_amount - (this.get('total') - charge); // delivery item now in cart, so we need to decrease total

            if(!delivery.get('enable'))
                return null;

            return round_monetary_currency(diff > 0 ? diff : 0);
        },
        /**
         * clear total model
         */
        empty: function() {
            this.set({
                tax : 0,
                total : 0,
                surcharge: 0
            });
            this.get('tip').empty();
        },
        /**
         * save information from total model to local storage
         */
        saveTotal: function() {
            this.get('tip').saveTip();
        },
        /**
         * load information from local storage
         */
        loadTotal: function() {
            this.get('tip').loadTip();
        },
        /**
         * get all model information for make order
         */
        get_all: function() {
            return {
                final_total: parseFloat(this.get_subtotal()),
                surcharge: parseFloat(this.get_surcharge()),
                subtotal: parseFloat(this.get_total()),
                tax: parseFloat(this.get_tax()),
                tip: parseFloat(this.get_tip())
            };
        },
        clone: function() {
            var total = new App.Models.Total();
            for (var key in this.attributes) {
                var value = this.get(key);
                if (value && value.clone) { value = value.clone(); }
                total.set(key, value, {silent : true });
            }
            total.trigger('change', total, {clone: true});
            return total;
        }
    });
});