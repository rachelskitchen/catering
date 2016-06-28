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

    var CartMainView = App.Views.CoreCartView.CoreCartMainView.extend({
        events: {
            'click .hide-cart': 'hideCart'
        },
        hideCart: function() {
            this.model.set('visible', false);
        }
    });

    var CartCheckoutView = App.Views.CoreCartView.CoreCartCoreView.extend({
        name: 'cart',
        mod: 'checkout',
        bindings: {
            '.total_block': 'updateContent: totalViewData'
        },
        computeds: {
            totalViewData: function() {
                setTimeout(this.resize.bind(this), 500);
                return {
                    el: this.$('.total_block'),
                    name: 'Total',
                    mod: 'Checkout',
                    model: this.collection.total,
                    collection: this.collection,
                    checkout: this.collection.checkout
                };
            }
        }
    });

    return new (require('factory'))(cart_view.initViews.bind(cart_view), function() {
        App.Views.CartView.CartMainView = CartMainView;
        App.Views.CartView.CartCheckoutView = CartCheckoutView;
    });
});