/**
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
            subtotal: 0,
            tax: 0,
            surcharge: 0,
            tip: null,
            delivery: null,
            bag_charge: null,
            discounts: 0, //sum of all discounts
            tax_country: '',
            prevailing_surcharge: null,
            prevailing_tax: null,
            shipping: null,
            shipping_discount: 0
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
        },
        /**
         * get Total
         */
        get_subtotal: function() {
            return round_monetary_currency(this.get('subtotal'));
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
        get_total: function() { // subtotal + surcharge + tax
            var tax = this.get_tax() * 1,
                subtotal = this.get_subtotal() * 1,
                surcharge = this.get_surcharge() * 1;

            if(!App.TaxCodes.is_tax_included(this.get('tax_country'))) {
                subtotal += surcharge + tax;
            }

            return round_monetary_currency(subtotal);
        },
        /**
         * get total discount
         */
        get_discounts_str: function() {
            return round_monetary_currency(this.get('discounts'));
        },
        /*
         * Get tip.
         */
        get_tip: function() {
            return round_monetary_currency(this.get('tip').get_tip(this.get_subtotal()));
        },
        /**
         * Get total sum of order (subtotal + surcharge + tax + tip).
         */
        get_grand: function() { // subtotal + surcharge + tax + tip
            var total = this.get_total() * 1, // get total sum of order (subtotal + surcharge + tax) without tip
                tip = this.get_tip() * 1, // get tip
                grand_total = total + tip;

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
        /**
         * @method
         * Sets delivery charge for total model
         */
        set_delivery_charge: function(charge) {
            this.get('delivery').set('charge', charge);
        },
         /**
         * @method
         * @returns {string} formatted shipping charge amount
         */
        get_shipping_charge: function() {
            return round_monetary_currency(this.get('shipping') || 0);
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
                diff = min_amount - (this.get('subtotal') - charge); // delivery item now in cart, so we need to decrease total

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
                subtotal : 0,
                surcharge: 0
            });
            this.get('tip').empty();
        },
        /**
         * save information from total model to local storage
         */
        saveTotal: function() {
            setData('total', this);
            this.get('tip').saveTip();
        },
        /**
         * load information from local storage
         */
        loadTotal: function() {
            var json = getData('total');
            if (json) {
              delete json.delivery;
              delete json.tip;
              this.set(json);
            }
            this.get('tip').loadTip();
        },
        /**
         * get all model information for make order
         */
        get_all: function() {
            return {
                final_total: parseFloat(this.get_total()),
                surcharge: parseFloat(this.get_surcharge()),
                subtotal: parseFloat(this.get_subtotal()),
                tax: parseFloat(this.get_tax()),
                tip: parseFloat(this.get_tip()),
                total_discounts: parseFloat(this.get_discounts_str())
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