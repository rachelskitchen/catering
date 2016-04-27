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

    var CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView.extend({
        controlAddress: function(model, value) {
            var arrAdd= this.$('.arrival_address');
            App.Views.CoreCheckoutView.CoreCheckoutMainView.prototype.controlAddress.apply(this, arguments);
            if(value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_SHIPPING' ) {
                arrAdd.hide();
            } else {
                arrAdd.show();
            }
        }
    });

    var CheckoutPageView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'page',
        bindings: {
            '.notes': 'value: checkout_notes, events: ["input"], toggle: _system_settings_order_notes_allow'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var orderDetails = this.$('.order-details'),
                order_type, pickup, main;

            order_type = App.Views.GeneratorView.create('Checkout', {
                mod: 'OrderType',
                model: this.collection.checkout,
                DINING_OPTION_NAME: this.options.DINING_OPTION_NAME,
                className: 'fl-left'
            });

            pickup = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                timetable: this.options.timetable,
                mod: 'Pickup',
                className: 'fl-left'
            });

            main = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                customer: this.options.customer,
                rewardsCard: this.collection.rewardsCard,
                mod: 'Main'
            });

            this.subViews.push(order_type, pickup, main);

            orderDetails.append(order_type.el);
            orderDetails.append(pickup.el);
            orderDetails.append(main.el);

            this.iOSSafariCaretFix();

            return this;
        }
    });

    return new (require('factory'))(checkout_view.initViews.bind(checkout_view), function() {
        App.Views.CheckoutView.CheckoutMainView = CheckoutMainView;
        App.Views.CheckoutView.CheckoutPageView = CheckoutPageView;
    });
});
