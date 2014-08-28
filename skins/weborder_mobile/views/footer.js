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

define(["backbone", "factory", "generator"], function(Backbone) {
    'use strict';

    App.Views.FooterView = {};

    App.Views.FooterView.FooterMainView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(App.Data.myorder, 'add', this.updateCount, this);
            this.listenTo(App.Data.myorder, 'remove', this.updateCount, this);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.updateCount(undefined, App.Data.myorder);
            return this;
        },
        events: {
            "click #myorder": "myorder",
            "click #location": "location",
            "click #about": "about"
        },
        myorder: function() {
            var myorder = this.model.get('myorder');
            typeof myorder == 'function' && myorder();
        },
        location: function() {
            var location = this.model.get('location');
            typeof location == 'function' && location();
        },
        about: function() {
            var about = this.model.get('about');
            typeof about == 'function' && about();
        },
        updateCount: function(model, collection) {
            var quantity = this.$('.count'),
                amount = collection.get_only_product_quantity();
            quantity.text(amount);
            if(amount)
                quantity.show();
            else
                quantity.hide();
        }
    });

    App.Views.FooterView.FooterCheckoutView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'checkout',
        events: {
            "click #confirmOrder": "confirmOrder"
        },
        confirmOrder: function() {
            App.Data.myorder.check_order({
                order: true,
                customer: true,
                checkout: true
            }, function() {
                App.Data.router.navigate('confirm', true);
            });
        }
    });

    App.Views.FooterView.FooterCardView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'card',
        events: {
            "click #cancel": "cancel",
            "click #proceed": "proceed"
        },
        cancel: function() {
            App.Data.router.navigate('confirm', true);
        },
        proceed: function() {
            var model = App.Data.card;
            model && model.trigger('add_card');
        }
    });

    App.Views.FooterView.FooterConfirmView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'confirm',
        events: {
            "click #creditCard": "creditCard",
            "click #creditCardRedirect": "creditCard",
            "click #pay": "pay",
            "click #payPaypal": "pay",
            "click #cash": "cash"
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(App.Data.myorder, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(App.Data.myorder, "paymentFailed", function(message) {
                App.Data.mainModel.trigger("loadCompleted");
                message && App.Data.errors.alert(message);
            }, this);
        },
        render: function() {
            //App.Views.FactoryView.prototype.render.apply(this, arguments);
            var payment = App.Data.settings.get_payment_process(),
                rows = payment.payment_count,
                isDelivery = App.Data.myorder.checkout.get("dining_option") === 'DINING_OPTION_DELIVERY';

            payment.cashBtnText = isDelivery ? MSG.PAY_AT_DELIVERY : MSG.PAY_AT_STORE;

            this.$el.html(this.template(payment));
            if (rows === 2) {
                $('#section').addClass('doubleFooter_section');
                this.$('.confirm').addClass('double');
            } else if(rows === 3) {
                $('#section').addClass('tripleFooter_section');
                this.$('.confirm').addClass('triple');
            }
            return this;
        },
        remove: function() {
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
            $('#section').removeClass('doubleFooter_section').removeClass('tripleFooter_section');
        },
        creditCard: function() {
           var payment = App.Data.settings.get_payment_process();
           if (payment.credit_card_dialog) {
               App.Data.router.navigate('card', true);
           } else {
               var self = this;
               App.Data.myorder.check_order({
                   order: true,
                   tip: true,
                   customer: true,
                   checkout: true,
                   card: false
               }, function() {
                   App.Data.myorder.pay_order_and_create_order_backend(2);
                   !self.canceled && App.Data.mainModel.trigger('loadStarted');
                   delete self.canceled;
                   saveAllData();
                   App.Data.router.navigate('confirm', true);
               });
            }
        },
        pay: function(e) {
            var creditCard = $(e.currentTarget).attr('id') === 'pay' ? true : false,
                myorder = App.Data.myorder,
                self = this; // check with tips
            App.Data.myorder.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
                card: creditCard
            }, function() {
                myorder.pay_order_and_create_order_backend(creditCard ? 2 : 3);
                !self.canceled && App.Data.mainModel.trigger('loadStarted');
                delete self.canceled;
                saveAllData();
                App.Data.router.navigate('confirm', true);
            });
        },
        cash: function(e) {
            var myorder = App.Data.myorder,
                self = this; // check with tips

            var self = this;
            App.Data.myorder.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
            }, function() {
                myorder.pay_order_and_create_order_backend(4);
                !self.canceled && App.Data.mainModel.trigger('loadStarted');
                delete self.canceled;
                saveAllData();
                App.Data.router.navigate('confirm', true);
            });
        }
    });

    App.Views.FooterView.FooterDoneView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'done',
        events: {
            "click #returnToMenu": "returnToMenu"
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            !this.model.get('success_payment') && this.$('#returnToMenu > span').text('Return to Order Summary');
            return this;
        },
        returnToMenu: function() {
            if (this.model.get('success_payment')) {
                App.Data.myorder.empty_myorder();
                App.Data.card.empty_card_number();
                App.Data.router.navigate('index', true);
            } else {
                App.Data.router.navigate('confirm', true);
            }
        }
    });

    App.Views.FooterView.FooterMaintenanceView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'maintenance',
        events: {
            "click #reload": "reload"
        },
        reload: function() {
            window.location.replace(window.location.href.replace(/#.*$/, ''));
        }
    });

    App.Views.FooterView.FooterMaintenanceDirectoryView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'maintenance_directory'
    });
});
