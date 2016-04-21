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
        OrderTypeShort, PickupShort, AddressShort, AddressSelection, OtherShort;

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
            inputTypeMask(this.$('input'), /^.{0,200}$/, '', 'text');
        },
        bindings: {
            '.discount-code': 'value: discount_code, events: ["input"]',
            '.ctrl': 'reset: discount_code, events: ["click"]'
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
            var checkout = this.options.checkout;
            this.listenTo(checkout, 'change:dining_option', this.updateAddress, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.updateAddress(checkout, checkout.get('dining_option'));
        },
        updateAddress: function(checkout, value) {
            if (value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_SHIPPING' || value === 'DINING_OPTION_CATERING') {
                var address = App.Views.GeneratorView.create('Checkout', {
                    mod: 'Address',
                    customer: this.options.customer,
                    checkout: this.options.checkout
                });
                this.subViews.remove();
                this.subViews.push(address);
                this.$el.append(address.el);
            }
        }
    });

    AddressSelection = App.Views.CoreCheckoutView.CoreCheckoutAddressSelectionView.extend({
        name: 'checkout',
        mod: 'address_selection',
        initialize: function() {
            this.listenTo(this.options.checkout, 'change:dining_option', this.updateNewAddressIndex);
            App.Views.CoreCheckoutView.CoreCheckoutAddressSelectionView.prototype.initialize.apply(this, arguments);
        }
    });

    OtherShort = App.Views.CoreCheckoutView.CoreCheckoutOtherView.extend({
        bindings: {
            ':el': 'toggle: equal(dining_option, "DINING_OPTION_OTHER")'
        }
    });

    OrderTypeShort = App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView.extend({
        name: 'checkout',
        mod: 'order_type_short',
        bindings: {
            '.address-selection': 'toggle: all(inList(dining_option, "DINING_OPTION_DELIVERY", "DINING_OPTION_SHIPPING", "DINING_OPTION_CATERING"), showAddressSelection)',
            '.address-edit': 'toggle: all(showAddressSelection, showAddressEdit)'
        },
        events: _.extend({}, App.Views.DeliveryAddressesSelectionView.prototype.computeds, {
            'change #addresses': 'updateShippingServices'
        }),
        computeds: _.extend({}, App.Views.DeliveryAddressesSelectionView.prototype.computeds),
        render: function() {
            App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView.prototype.render.apply(this, arguments);

            var addressSelection = App.Views.GeneratorView.create('Checkout', {
                    mod: 'AddressSelection',
                    checkout: this.options.checkout,
                    customer: this.options.customer,
                    address_index: -1
                }),
                addressForm = App.Views.GeneratorView.create('Checkout', {
                    mod: 'AddressShort',
                    checkout: this.options.checkout,
                    customer: this.options.customer,
                    className: 'checkout checkout-lines font-size2'
                });
            this.subViews.push(addressSelection);
            this.$('.address-selection').html(addressSelection.el);

            this.subViews.push(addressForm);
            this.$('.address-form').html(addressForm.el);

            return this;
        },
        updateShippingServices: function() {
            App.Views.AddressView.prototype.initModel.apply(this, arguments);
            App.Views.AddressView.prototype.updateAddress.apply(this, arguments);
            var model = App.Data.myorder.getCustomerAddress();
            // need to reset shipping services before updating them
            // due to server needs a no shipping service specified to return a new set of shipping services.
            this.options.customer.resetShippingServices();
            this.isShippingServices = this.options.checkout && this.options.checkout.get('dining_option') === 'DINING_OPTION_SHIPPING';
            if (this.isShippingServices && model.street_1 && model.city && model.country && model.zipcode
                && (model.country == 'US' ? model.state : true) && (model.country == 'CA' ? model.province : true)) {
                App.Data.myorder.update_cart_totals({update_shipping_options: true});
            }
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
        App.Views.CheckoutView.CheckoutAddressSelectionView = AddressSelection;
    });
});