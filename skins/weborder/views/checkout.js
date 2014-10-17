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

define(["backbone", "checkout_view", "generator"], function(Backbone) {
    'use strict';

    App.Views.CheckoutView.CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView.extend({
        controlAddress: function(model, value) {
            var arrAdd= this.$('.arrival_address');
            App.Views.CoreCheckoutView.CoreCheckoutMainView.prototype.controlAddress.apply(this, arguments);
            if(value === 'DINING_OPTION_DELIVERY') {
                arrAdd.hide();
            } else {
                arrAdd.show();
            }
        }
    });

    App.Views.CheckoutView.CheckoutPageView = App.Views.CoreCheckoutView.CoreCheckoutPageView.extend({
        render: function() {
            var data = {
                noteAllow: this.options.noteAllow,
                note: this.collection.checkout.get('notes')
            };
            this.$el.html(this.template(data));

            var order_type = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                collection: this.collection,
                DINING_OPTION_NAME: this.options.DINING_OPTION_NAME,
                mod: 'OrderType',
                className: 'row'
            }), pickup = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                timetable: this.options.timetable,
                mod: 'Pickup'
            }), main = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                customer: this.options.customer,
                mod: 'Main'
            }), specials = this.$('.specials'),
                tips;

            this.subViews.push(order_type, pickup, main);
            specials.before(order_type.el);
            specials.before(pickup.el);
            specials.before(main.el);

            if(this.options.acceptTips) {
                tips = App.Views.GeneratorView.create('Tips', {
                    model: this.collection.total.get('tip'),
                    mod: 'Line',
                    className: 'row tipBlock',
                    total: this.collection.total
                });
                this.subViews.push(tips);
                specials.before(tips.el);
                tips.$el.on('touchstart', 'input', this.inputClick.bind(this));
            }

            this.$('.data').contentarrow();
            main.$el.on('touchstart', 'input', this.inputClick.bind(this));
            this.iOSSafariCaretFix();

            return this;
        }
    });
});
