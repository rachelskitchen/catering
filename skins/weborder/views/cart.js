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

define(["products_view"], function() {
    'use strict';

    var CartCoreView = App.Views.FactoryView.extend({
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, "add remove", this.onChangeOrder, this);
        },
        bindings: {
            '.btn': 'classes: {disabled: any(not(orderItems_quantity), orderItems_pending, shippingPending)}',
            '.animate-spin': 'classes: {hide: all(not(orderItems_pending), not(shippingPending))}'
        },
        computeds: {
            shippingPending: {
                deps: ['checkout_dining_option', 'customer_shipping_selected'],
                get: function(checkout_dining_option, customer_shipping_selected) {
                    return checkout_dining_option == 'DINING_OPTION_SHIPPING' && customer_shipping_selected == -1;
                }
            }
        },
        bindingSources: {
            orderItems: function() {
                var model = new Backbone.Model({
                    pending: App.Data.myorder.pending,
                    quantity: App.Data.myorder.get_only_product_quantity()
                });

                model.listenTo(App.Data.myorder, 'add change remove', function() {
                    model.set('quantity', App.Data.myorder.get_only_product_quantity());
                });
                // update_cart_totals is in progress
                model.listenTo(App.Data.myorder, 'onCartTotalsUpdate', function() {
                    model.set('pending', true);
                });
                // update_cart_totals completed
                model.listenTo(App.Data.myorder, 'DiscountsComplete NoRequestDiscountsComplete', function() {
                    model.set('pending', false);
                });

                return model;
            }
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.listenTo(App.Data.mainModel, 'loadCompleted', this.resize.bind(this));

            this.subViews.push(App.Views.GeneratorView.create('MyOrder', {
                el: this.$('.order-items'),
                mod: 'List',
                collection: this.collection
            }));

            this.onChangeOrder();
        },
        onChangeOrder: function() {
            if (this.collection.get_only_product_quantity() > 0)
                this.$(".order-items_wrapper, .total_block").show();
            else
                this.$(".order-items_wrapper, .total_block").hide();
        },
        resize: function() {
            var button = this.$('.btn').outerHeight(true),
                totalBlock = this.$('.total_block').outerHeight(true);
            this.$('.order-items_wrapper').css('bottom', (button + totalBlock) + 'px');
            this.$('.total_block').css('bottom', button + 'px');
        }
    });

    var CartMainView = CartCoreView.extend({
        name: 'cart',
        mod: 'main',
        render: function() {
            App.Views.CartView.CartCoreView.prototype.render.apply(this, arguments);

            this.subViews.push(App.Views.GeneratorView.create('Total', {
                el: this.$('.subtotal-box'),
                mod: 'Main',
                model: this.collection.total,
                collection: this.collection
            }));
        },
        bindings: {
            '.subtotal-subline': 'toggle: orderItems_quantity'
        },
        events: {
            'click .btn': 'checkout_event'
        },
        onEnterListeners: {
            '.btn': 'checkout_event'
        },
        checkout_event: function() {
            var self = this;

            App.Data.myorder.check_order({
                order: true,
                first_page: true,
                skipDeliveryAmount: true
            }, function() {
                self.collection.trigger('onCheckoutClick');
            });
        }
    });

    var CartCheckoutView = CartCoreView.extend({
        name: 'cart',
        mod: 'checkout',
        bindings: {
            '.pay-btn .text': 'text: payBtnText(orderItems_quantity, total_grandTotal)'
        },
        bindingFilters: {
            payBtnText: function(quantity, grandTotal) {
                // if grandTotal is $0 we must show "Place Order" button instead of "Pay".
                return (Number(grandTotal) || !quantity) ? _loc.CHECKOUT_PAY : _loc.PLACE_ORDER;
            }
        },
        events: {
            'click .pay-btn': 'pay'
        },
        onEnterListeners: {
            '.pay-btn': 'pay'
        },
        render: function() {
            App.Views.CartView.CartCoreView.prototype.render.apply(this, arguments);

            this.subViews.push(App.Views.GeneratorView.create('Total', {
                el: this.$('.total_block'),
                mod: 'Checkout',
                model: this.collection.total,
                collection: this.collection,
                checkout: this.collection.checkout
            }));
        },
        pay: function() {
            this.collection.trigger('onPay', this.model.onPay.bind(this.model));
        }
    });

    var CartConfirmationView = CartCheckoutView.extend({
        bindings: {
            '.pay-btn': 'toggle: false'
        }
    });

    return new (require('factory'))(function() {
        App.Views.CartView = {};
        App.Views.CartView.CartCoreView = CartCoreView;
        App.Views.CartView.CartMainView = CartMainView;
        App.Views.CartView.CartCheckoutView = CartCheckoutView;
        App.Views.CartView.CartConfirmationView = CartConfirmationView;
    });
});