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

    /**
     * @class
     * Represents cart total model.
     */
    App.Models.Total = Backbone.Model.extend({
        /**
         * @prop {object} defaults - literal object containing attributes with default values.
         *
         * @prop {number} defaults.subtotal - the subtotal amount.
         * @prop 0.
         *
         * @prop {number} defaults.tax - order tax amount.
         * @prop 0.
         *
         * @prop {number} defaults.surcharge - the surcharge amount.
         * @default 0.
         *
         * @prop {App.Models.Tip} defaults.tip - the Tip model.
         * @default null.
         *
         * @prop {App.Models.Delivery} defaults.delivery - the Delivery model.
         * @default null.
         *
         * @prop {number} defaults.bag_charge - the auto bag charge amount.
         * @default 0.
         *
         * @prop {number} defaults.discounts - sum of all discounts applied.
         * @default 0.
         *
         * @prop {string} defaults.tax_country - tax country code.
         * @default ''.
         *
         * @prop {number} defaults.prevailing_surcharge - the prevailing surcharge rate.
         * @default 0.
         *
         * @prop {number} defaults.prevailing_tax - the prevailing tax rate.
         * @default 0.
         *
         * @prop {number} defaults.shipping - the shipping charge amount.
         * @default 0.
         *
         * @prop {number} defaults.shipping_discount - the shipping discount amount.
         * @default 0.
         */
        defaults: {
            subtotal: 0,
            tax: 0,
            surcharge: 0,
            tip: null,
            delivery: null,
            bag_charge: 0,
            discounts: 0, //sum of all discounts
            tax_country: '',
            prevailing_surcharge: 0,
            prevailing_tax: 0,
            shipping: 0,
            shipping_discount: 0,
            grandTotal: 0 //result price of the order
        },
        /**
         * @method
         * Set values for `bag_charge`, `tax_country`, `prevailing_surcharge`, `prevailing_tax`, `tip`, `delivery` attributes.
         */
        initialize: function(opts) {
            var settings = App.Settings,
                delivery = opts && opts.delivery_item || {},
                set = {
                    bag_charge: settings.auto_bag_charge,
                    tax_country: settings.tax_country,
                    prevailing_surcharge: settings.prevailing_surcharge,
                    prevailing_tax: settings.prevailing_tax,
                    tip: new App.Models.Tip(),
                    delivery: new App.Models.Delivery(delivery)
                };
            this.listenTo(this, "change:subtotal change:surcharge change:tax", this.update_grand, this);
            this.listenTo(set.tip, "change:tipTotal", this.update_grand, this);
            this.unset('delivery_item');
            this.set(set);
        },
        update_grand: function() {
            this.set('grandTotal', this.get_grand());
        },
        /**
         * @method
         * @returns {string} subtotal amount formatted as a string.
         */
        get_subtotal: function() {
            return round_monetary_currency(this.get('subtotal'));
        },
        /**
         * @method
         * @returns {string} tax amount formatted as a string.
         */
        get_tax: function() { // tax
            return round_monetary_currency(this.get('tax'));
        },
        /**
         * @method
         * @returns {string} surcharge amount formatted as a string.
         */
        get_surcharge: function() {
            return round_monetary_currency(this.get('surcharge'));
        },
        /**
         * @method
         * Calculates total amount as `subtotal` + `surcharge` + `tax` for tax excluded countries
         * and as `subtotal` for tax included countries.
         *
         * @returns {string} total amount formatted as a string.
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
         * @method
         * @returns {string} discounts amount formatted as a string.
         */
        get_discounts_str: function() {
            return round_monetary_currency(this.get('discounts'));
        },
        /**
         * @method
         * @returns {string} tip amount formatted as a string.
         */
        get_tip: function() {
            return round_monetary_currency(this.get('tip').get_tip(this.get_subtotal()));
        },
        /**
         * @method
         * Calculates grand total amount as `subtotal` + `surcharge` + `tax` + `tip` for tax excluded countries
         * and as `subtotal` + `tip` for tax included countries.
         *
         * @returns {string} grand total amount formatted as a string.
         */
        get_grand: function() { // subtotal + surcharge + tax + tip
            var total = this.get_total() * 1, // get total sum of order (subtotal + surcharge + tax) without tip
                tip = this.get_tip() * 1, // get tip
                grand_total = total + tip;

            return round_monetary_currency(grand_total);
        },
        /**
         * @method
         * @returns {string} delivery charge amount formatted as a string.
         */
        get_delivery_charge: function() {
            return round_monetary_currency(this.get('delivery').getCharge());
        },
        /**
         * @method
         * Sets delivery charge for total model.
         *
         * @param {number} charge - delivery charge amount.
         */
        set_delivery_charge: function(charge) {
            this.get('delivery').set('charge', charge);
        },
        /**
         * @method
         * @returns {string} shipping charge amount formatted as a string.
         */
        get_shipping_charge: function() {
            return round_monetary_currency(this.get('shipping') || 0);
        },
        /**
         * @method
         * @returns {string} bag charge amount formatted as a string.
         */
        get_bag_charge: function() {
            return round_monetary_currency(this.get('bag_charge'));
        },
        /**
         * @method
         * @returns {string} remaining delivery amount formatted as a string or `null` if delivery is disabled.
         */
        get_remaining_delivery_amount: function() {
            var diff = this.get('delivery').getRemainingAmount(this.get('subtotal'));
            return round_monetary_currency(diff > 0 ? diff : 0);
        },
        /**
         * @method
         * Clears total model.
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
         * @method
         * Saves the model in a storage. 'total' key is used.
         */
        saveTotal: function() {
            setData('total', this);
            this.get('tip').saveTip();
        },
        /**
         * @method
         * Restores the model data from a storage. 'total' key is used.
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
         * @method
         * @returns {object} {
         *    final_total:     <get_total()>
         *    surcharge:       <get_surcharge()>
         *    subtotal:        <get_subtotal()>
         *    tax:             <get_tax()>
         *    tip:             <get_tip()>
         *    total_discounts: <get_discounts_str()>
         * }
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
        /**
         * @method
         * Deeply clones the model.
         *
         * @returns {App.Models.Total} a new total model.
         */
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