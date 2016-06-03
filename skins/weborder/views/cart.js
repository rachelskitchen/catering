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

define(["cart_view"], function(cart_view) {
    'use strict';

    var CartCheckoutView = App.Views.CoreCartView.CoreCartCoreView.extend({
        name: 'cart',
        mod: 'checkout',
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

    return new (require('factory'))(cart_view.initViews.bind(cart_view), function() {
        App.Views.CartView.CartCheckoutView = CartCheckoutView;
        App.Views.CartView.CartConfirmationView = CartConfirmationView;
    });
});