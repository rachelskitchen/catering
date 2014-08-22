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

    App.Views.CheckoutView.CheckoutPayView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'pay',
        render: function() {
            this.$el.html(this.template());
            this.subViews.push(App.Views.GeneratorView.create('Checkout', {
                el: this.$('.btn_wrapper'),
                mod: 'PayButton',
                collection: this.collection
            }));
            return this;
        }
    });

    App.Views.CheckoutView.CheckoutPayButtonView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'pay_button',
        initialize: function() {
            this.listenTo(this.collection, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(this.collection, "paymentFailed", function(message) {
                this.collection.trigger('hideSpinner');
            }, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection.checkout, 'change:dining_option', this.change_cash_text);
        },
        render: function() {
            var payment = App.Data.settings.get_payment_process();
            payment.flag = this.options.flag === 'checkout';

            this.$el.html(this.template(payment));
            this.change_cash_text();
            return this;
        },
        events: {
            'click .credit-card': 'credit_card',
            'click .paypal': function() {
                this.pay(3);
        },
            'click .cash': function(){
                this.pay(4);
            }
        },
        change_cash_text: function() {
            var isDelivery = this.collection.checkout.get("dining_option") === 'DINING_OPTION_DELIVERY';
            this.$('.cash').html(isDelivery ? MSG.PAY_AT_DELIVERY : MSG.PAY_AT_STORE);
        },
        credit_card: function() {
            var self = this;
            $('#popup .cancel').trigger('click');
            var payment = App.Data.settings.get_payment_process();
            if (!payment.credit_card_dialog) {
                App.Data.myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                    validation: false
                }, function() {
                    self.pay(2);
                });
            } else if (this.options.flag) {
                App.Data.myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                    validation: true
                }, function() {
                    card_popup();
                });
            } else {
                card_popup();
            }

            function card_popup() {
            App.Data.mainModel.set('popup', {
                modelName: 'Confirm',
                mod: 'PayCard',
                    collection: self.collection,
                className: 'confirmPayCard',
                    timetable: App.Data.timetables,
                    card: App.Data.card
            });
            }
            //remove the background from popup
            $('#popup').removeClass("popup-background");
        },
        pay: function(payment_type) {
            saveAllData();
            var self = this;

            self.collection.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true
            }, function() {
                self.collection.pay_order_and_create_order_backend(payment_type);
                !self.canceled && self.collection.trigger('showSpinner');
            $('#popup .cancel').trigger('click');
            });
        }
    });

    App.Views.CheckoutView.CheckoutPageView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'page',
        initialize: function() {
            this.collection.checkout.on('change:notes', this.update_note, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'click input': 'inputClick',
            'change .input_beauty.special' : 'change_note'
        },
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
            });

            var main = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                customer: this.options.customer,
                mod: 'Main'
            }), specials = this.$('.specials');

            this.subViews.push(order_type, main);
            specials.before(order_type.el);
            specials.before(main.el);

            this.$('.data').contentarrow();
            main.$el.on('touchstart', 'input', this.inputClick.bind(this));
            this.iOSSafariCaretFix();
            return this;
        },
        update_note: function(e) {
            this.$('.input_beauty.special textarea').val(this.collection.checkout.get('notes'));
        },
        change_note: function(e) {
            this.collection.checkout.set('notes', e.target.value);
        },
        remove: function() {
            this.$('.data').contentarrow('destroy');
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        inputClick: function(event) {
            var self = this,
                cont = this.$('.data');
            cont.on('onScroll', restoreFocus);
            function restoreFocus() {
                $(event.target).focus();
                cont.off('onScroll', restoreFocus);
            }
        }
    });
});
