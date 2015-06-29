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

define(["backbone", "checkout_view", "stanfordcard_view"], function(Backbone) {
    'use strict';

    App.Views.CoreConfirmView = {};

    App.Views.CoreConfirmView.CoreConfirmPayCardView = App.Views.FactoryView.extend({
        name: 'confirm',
        mod: 'card_order',
        initialize: function() {
            this.listenTo(this.collection, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(this.collection, "paymentFailed", function(message) {
                this.collection.trigger('hideSpinner');
            }, this);

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.afterRender();
            return this;
        },
        afterRender: function() {
            var mode;
            switch(this.options.submode) {
                case 'Gift':
                    mode = 'GiftCard';
                    break;
                case 'Stanford':
                    mode = 'StanfordCard';
                    break;
                default:
                    mode = 'Card';
                    break;
            }
            this.subViews.push(App.Views.GeneratorView.create(mode, {
                el: this.$('#credit-card'),
                mod: 'Main',
                model: this.options.card
            }));

            this.subViews.push(App.Views.GeneratorView.create('MyOrder', {
                el: this.$('.order-items'),
                mod: 'List',
                collection: this.collection
            }));
            this.$('.order-items').contentarrow();

            this.subViews.push(App.Views.GeneratorView.create('Total', {
                el: this.$('.total_block'),
                mod: 'Checkout',
                model: this.collection.total,
                collection: this.collection
            }));
        },
        events: {
            'click .btn-submit': 'submit_payment'
        },
        submit_payment: function() {
            var self = this;
            this.options.card.trigger('add_card');
            saveAllData();

            self.collection.check_order({
                card: self.options.submode == 'Credit',
                giftcard: self.options.submode == 'Gift',
                stanfordcard: self.options.submode == 'Stanford',
                order: true,
                tip: true,
                customer: true,
                checkout: true
            }, function() {
                var paymentType;
                switch(self.options.submode) {
                    case 'Gift':
                        paymentType = PAYMENT_TYPE.GIFT;
                        break;
                    case 'Stanford':
                        paymentType = PAYMENT_TYPE.STANFORD;
                        break;
                    default:
                        paymentType = PAYMENT_TYPE.CREDIT;
                        break;
                }
                self.collection.create_order_and_pay(paymentType);
                !self.canceled && self.collection.trigger('showSpinner');
            });
        }
    });

    App.Views.CoreConfirmView.CoreConfirmStanfordCardView = App.Views.CoreConfirmView.CoreConfirmPayCardView.extend({
        events: {
            'click .btn-submit.submit-payment': 'submit_payment',
            'click .btn-submit.submit-card': 'submit_card',
        },
        submit_payment: function() {
            var self = this;
            saveAllData();

            self.collection.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true
            }, function() {
                self.collection.create_order_and_pay(PAYMENT_TYPE.STANFORD);
                !self.canceled && self.collection.trigger('showSpinner');
            });
        },
        submit_card: function() {
            console.log('submit_card')
        }
    });

    return new (require('factory'))(function() {
        App.Views.ConfirmView = {};
        App.Views.ConfirmView.ConfirmPayCardView = App.Views.CoreConfirmView.CoreConfirmPayCardView;
    });
});
