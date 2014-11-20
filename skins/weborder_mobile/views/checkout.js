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

define(["backbone", "factory", "checkout_view"], function(Backbone) {
    'use strict';

    App.Views.CheckoutView.CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView.extend({
        name: 'checkout',
        mod: 'main',
        initialize: function() {
            this.listenTo(this, 'address-with-states', this.showDeliveryWithStates, this);
            this.listenTo(this, 'address-without-states', this.showDelivery, this);
            this.listenTo(this, 'delivery-to-seat', this.showDeliveryToSeat, this);
            this.listenTo(this, 'address-hide', this.removePrevStyles, this);

            var count = 1;
            if (App.Data.orderFromSeat instanceof Object) {
                var level = App.Data.orderFromSeat.enable_level,
                    section = App.Data.orderFromSeat.enable_sector,
                    row = App.Data.orderFromSeat.enable_row;

                if (level) count++;
                if (section) count++;
                if (row) count++;
            }
            this.numSeatBoxes = count;
            App.Views.CoreCheckoutView.CoreCheckoutMainView.prototype.initialize.apply(this, arguments);
        },
        showDelivery: function() {
            this.removePrevStyles();
            this.$('.contact_info').addClass('address-without-states');
        },
        showDeliveryWithStates: function() {
            this.removePrevStyles();
            this.$('.contact_info').addClass('address-with-states');
        },
        showDeliveryToSeat: function() {
            this.removePrevStyles();
            this.$('.contact_info').addClass('delivery-to-seat-' + this.numSeatBoxes);
        },
        removePrevStyles: function() {
            this.$('.contact_info').removeClass('address-with-states').
                                    removeClass('address-without-states').
                                    removeClass('delivery-to-seat-' + this.numSeatBoxes);
        }
    });
});