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

define(["checkout_view"], function(checkout_view) {
    'use strict';

    var CoreDeliveryAddressesView = App.Views.DeliveryAddressesView,
        CoreCheckoutAddressView = App.Views.CoreCheckoutView.CoreCheckoutAddressView,
        DeliveryAddressesView, CheckoutAddressView, CheckoutMainView;


    DeliveryAddressesView = CoreDeliveryAddressesView.extend({
        initialize: function() {
            CoreDeliveryAddressesView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.options.customer, 'change:shipping_services', this.updateShippingWrapper, this);
            this.updateShippingWrapper();
        },
        updateShippingWrapper: function() {
            var customer = this.options.customer,
                status = customer.get('load_shipping_status'),
                select = this.$('.select.shipping');
            if(!status || 'pending' == status || ('resolved' == status && !customer.get('shipping_services').length)) {
                select.attr('disabled', 'disabled');
            } else {
                select.removeAttr('disabled');
            }
        }
    });

    CheckoutAddressView = DeliveryAddressesView.extend({
        name: 'checkout',
        mod: 'address'
    });

    return new (require('factory'))(checkout_view.initViews.bind(checkout_view), function() {
        App.Views.DeliveryAddressesView = DeliveryAddressesView;
        App.Views.CoreCheckoutView.CoreCheckoutAddressView = CheckoutAddressView;
    });
});