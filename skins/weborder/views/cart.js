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

define(["backbone", "factory", "generator", "products_view"], function(Backbone) {
    'use strict';

    App.Views.CartView = {};

    App.Views.CartView.CartCoreView = App.Views.FactoryView.extend({
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, "add remove", this.onChangeOrder, this);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            $(window).on('resize.cart', this.resize.bind(this));
            this.listenTo(App.Data.mainModel, 'loadCompleted', this.resize.bind(this));

            this.subViews.push(App.Views.GeneratorView.create('MyOrder', {
                el: this.$('.order-items'),
                mod: 'List',
                collection: this.collection
            }));

            this.$('.order-items').contentarrow();
            this.onChangeOrder();
        },
        onChangeOrder: function() {
            if (this.collection.get_only_product_quantity() > 0)
                this.$(".order-items_wrapper, .total_block").show();
            else
                this.$(".order-items_wrapper, .total_block").hide();
        },
        resize: function() {
            var self = this;
            this.timeouts = this.timeouts || [];

            this.timeouts.push(setTimeout(function() {
                while (self.timeouts.length) {
                    clearTimeout(self.timeouts.pop());
                }
                var main = self.$el.outerHeight(true),
                    title = self.$('.cart_title').outerHeight(true),
                    button = self.$('.btn').outerHeight(true),
                    total = self.$('.total_block').outerHeight(true),
                    height = main - title - button - total - 10,
                    items = self.$('.order-items');

                items.css('max-height', height);
            },50));
        },
        remove: function() {
            this.$('.order-items').contentarrow('destroy');
            $(window).off('resize.cart');
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        }
    });

    App.Views.CartView.CartMainView = App.Views.CartView.CartCoreView.extend({
        name: 'cart',
        mod: 'main',
        render: function() {
            App.Views.CartView.CartCoreView.prototype.render.apply(this, arguments);

            this.subViews.push(App.Views.GeneratorView.create('Total', {
                el: this.$('.total_block'),
                mod: 'Main',
                model: this.collection.total,
                collection: this.collection
            }));
        },
        events: {
            'click .btn': 'checkout_event'
        },
        checkout_event: function() {
            var self = this;

            App.Data.myorder.check_order({
                order: true,
                first_page: true
            }, function() {
                self.collection.trigger('onCheckoutClick');
            });
        }
    });

    App.Views.CartView.CartCheckoutView = App.Views.CartView.CartCoreView.extend({
        name: 'cart',
        mod: 'checkout',
        render: function() {
            App.Views.CartView.CartCoreView.prototype.render.apply(this, arguments);
            this.subViews.push(App.Views.GeneratorView.create('Checkout', {
                el: this.$('.pay_button'),
                mod: 'PayButton',
                collection: this.collection,
                flag: 'checkout'
            }));

            this.subViews.push(App.Views.GeneratorView.create('Total', {
                el: this.$('.total_block'),
                mod: 'Checkout',
                model: this.collection.total,
                collection: this.collection,
                checkout: this.collection.checkout
            }));
        },
        events: {
            'click .pay': 'pay_event'
        },
        pay_event: function() {
            var self = this;
            App.Data.myorder.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
                validation: true
            }, function() {
                self.collection.trigger('onPay');
            });
        }
    });
});