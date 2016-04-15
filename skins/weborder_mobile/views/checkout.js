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
        DeliveryAddressesView, CheckoutAddressView, CheckoutMainView, DiscountCodeView,
        OrderTypeShort, PickupShort, AddressShort, OtherShort;

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

    DiscountCodeView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'discount',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            inputTypeMask(this.$('input'), /^[\d\w]{0,200}$/, '', 'text');
        },
        bindings: {
            '.discount-code': 'value: discount_code, events: ["input"]',
            '.ctrl': 'reset: discount_code, events: ["click"]'
        }
    });

    OrderTypeShort = App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView.extend({
        name: 'checkout',
        mod: 'order_type_short',
        bindings: {
            '.address-selection': 'toggle: all(showAddressSelection, inList(dining_option, "DINING_OPTION_DELIVERY", "DINING_OPTION_SHIPPING", "DINING_OPTION_CATERING"))', // wrapper of the address selection drop-down
            '#addresses': 'value: customer_shipping_address', // the address selection drop-down
        },
        computeds: {
            /**
             * Indicates whether the user is logged in.
             */
            isAuthorized: {
                deps: ['customer_access_token'],
                get: function() {
                    return this.options.customer.isAuthorized();
                }
            },
            /**
             * Indicates whether the address selection drop-down list should be shown.
             */
            showAddressSelection: {
                deps: ['isAuthorized', 'customer_addresses'],
                get: function(isAuthorized, customer_addresses) {
                    return isAuthorized && customer_addresses.length;
                }
            }
        },
        render: function() {
            App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView.prototype.render.apply(this, arguments);

            CoreDeliveryAddressesView.prototype.updateAddressesOptions.apply(this, arguments);
            this.listenTo(this.model, 'change:dining_option', function() {
                CoreDeliveryAddressesView.prototype.updateAddressesOptions.apply(this, arguments);
            });

            return this;
        }
    });

    PickupShort = App.Views.CoreCheckoutView.CoreCheckoutPickupView.extend({
        name: 'checkout',
        mod: 'pickup_short'
    });

    AddressShort = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'address_short',
        initialize: function() {
            var model = this.model;
            this.listenTo(model, 'change:dining_option', this.updateAddress, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.address_index = -1;
            this.updateAddress(model, model.get('dining_option'));
        },
        bindings: {
            ':el': 'toggle: all(inList(dining_option, "DINING_OPTION_DELIVERY", "DINING_OPTION_SHIPPING", "DINING_OPTION_CATERING"), showAddressEdit)'
        },
        computeds: CoreDeliveryAddressesView.prototype.computeds,
        updateAddress: function(model, value) {
            if (value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_SHIPPING' || value === 'DINING_OPTION_CATERING') {
                var address = App.Views.GeneratorView.create('Checkout', {
                    mod: 'Address',
                    customer: this.options.customer,
                    checkout: this.model,
                    address_index: this.address_index
                });
                delete this.address_index;
                this.subViews.remove();
                this.subViews.push(address);
                this.$el.append(address.el);
            }
        }
    });

    OtherShort = App.Views.CoreCheckoutView.CoreCheckoutOtherView.extend({
        bindings: {
            ':el': 'toggle: equal(dining_option, "DINING_OPTION_OTHER")'
        }
    });

    return new (require('factory'))(checkout_view.initViews.bind(checkout_view), function() {
        App.Views.DeliveryAddressesView = DeliveryAddressesView;
        App.Views.CoreCheckoutView.CoreCheckoutAddressView = CheckoutAddressView;
        App.Views.CheckoutView.CheckoutDiscountCodeView = DiscountCodeView;
        App.Views.CheckoutView.CheckoutOrderTypeShortView = OrderTypeShort;
        App.Views.CheckoutView.CheckoutPickupShortView = PickupShort;
        App.Views.CheckoutView.CheckoutAddressShortView = AddressShort;
        App.Views.CheckoutView.CheckoutOtherShortView = OtherShort;
    });
});