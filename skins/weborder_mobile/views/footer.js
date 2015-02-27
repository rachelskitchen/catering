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

define(["revel_view", "generator"], function(revel_view) {
    'use strict';

    var FooterMainView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(App.Data.myorder, 'add', this.updateCount, this);
            this.listenTo(App.Data.myorder, 'remove', this.updateCount, this);
        },
        render: function() {
            if (App.Settings.promo_message) this.calculatePromoMessageWidth(); // calculate a promo message width
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.updateCount(undefined, App.Data.myorder);
            return this;
        },
        events: {
            'click #myorder': 'myorder',
            'click #location': 'location',
            'click #about': 'about',
            'click .loyalty': 'loyalty',
            'click .menu': 'menu'
        },
        myorder: setCallback('myorder'),
        location: setCallback('location'),
        about: setCallback('about'),
        loyalty: setCallback('loyalty'),
        menu: setCallback('menu'),
        updateCount: function(model, collection) {
            var quantity = this.$('.count'),
                amount = collection.get_only_product_quantity();
            quantity.text(amount);
            if(amount)
                quantity.show();
            else
                quantity.hide();
        },
        /**
         * Calculate a promo message width.
         */
        calculatePromoMessageWidth: function() {
            if (this.model.get('isShowPromoMessage')) {
                var promo_message = Backbone.$('<div class="promo_message promo_message_internal">' + App.Settings.promo_message + '</div>');
                $('body').append(promo_message);
                this.model.set('widthPromoMessage', promo_message.width());
                promo_message.remove();
                this.model.set('widthWindow', $(window).width());
                this.addPromoMessage(); // add a promo message
                $(window).resize(this, this.resizePromoMessage);
            } else {
                this.$('.promo_message').hide();
            }
        },
        /**
         * Resize of a promo message.
         */
        resizePromoMessage: function() {
            if (arguments[0].data.model.get('widthWindow') !== $(window).width()) {
                arguments[0].data.model.set('widthWindow', $(window).width());
            }
        },
        /**
         * Add a promo message.
         */
        addPromoMessage: function() {
            var self = this;
            window.setTimeout(function() {
                var promo_text = self.$('.promo_text');
                var promo_marquee = self.$('.promo_marquee');
                if (self.model.get('widthPromoMessage') >= self.model.get('widthWindow')) {
                    var isFirefox = /firefox/g.test(navigator.userAgent.toLowerCase());
                    if (isFirefox) {
                        // bug #15981: "First Firefox displays long promo message completely then erases it and starts scrolling"
                        $(document).ready(function() {
                            promo_text.hide();
                            promo_marquee.show();
                        });
                    } else {
                        promo_text.hide();
                        promo_marquee.show();
                    }
                } else {
                    promo_text.show();
                    promo_marquee.hide();
                }
            }, 0);
        }
    });

    var FooterCheckoutView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'checkout',
        events: {
            "click #confirmOrder": "confirmOrder",
            "click .profile": "profile"
        },
        confirmOrder: function() {
            App.Data.myorder.check_order({
                order: true,
                customer: true,
                checkout: true,
                validationOnly: true
            }, function() {
                App.Data.router.navigate('confirm', true);
            });
        },
        profile: setCallback('profile')
    });

    var FooterCardView = App.Views.FactoryView.extend({
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

    var FooterGiftCardView = FooterCardView.extend({
        proceed: function() {
            var model = App.Data.giftcard;
            model && model.trigger('add_card');
        }
    });

    var FooterConfirmView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'confirm',
        events: {
            "click #creditCard": "creditCard",
            "click #creditCardRedirect": "creditCard",
            "click #pay": "pay",
            "click #payPaypal": "pay",
            "click #giftcard": "giftCard",
            "click #cash": "cash"
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(App.Data.myorder, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(App.Data.myorder, "paymentFailed", function(message) {
                App.Data.mainModel.trigger("loadCompleted");
                message && App.Data.errors.alert(message); // user notification
            }, this);
        },
        render: function() {
            //App.Views.FactoryView.prototype.render.apply(this, arguments);
            var payment = App.Data.settings.get_payment_process(),
                rows = payment.payment_count,
                isDelivery = App.Data.myorder.checkout.get("dining_option") === 'DINING_OPTION_DELIVERY';

            payment.credit_card_button && payment.gift_card && rows--;

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
            $(window).off("resize", this.resizePromoMessage);
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
            $('#section').removeClass('doubleFooter_section').removeClass('tripleFooter_section');
        },
        creditCard: function() {
           this.model.trigger('payWithCreditCard');
        },
        giftCard: function() {
           App.Data.router.navigate('giftcard', true);
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
                myorder.create_order_and_pay(creditCard ? PAYMENT_TYPE.CREDIT : PAYMENT_TYPE.PAYPAL);
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
                myorder.create_order_and_pay(PAYMENT_TYPE.NO_PAYMENT);
                !self.canceled && App.Data.mainModel.trigger('loadStarted');
                delete self.canceled;
                saveAllData();
                App.Data.router.navigate('confirm', true);
            });
        }
    });

    var FooterDoneView = App.Views.FactoryView.extend({
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

    var FooterMaintenanceView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'maintenance',
        events: {
            "click #reload": "reload"
        },
        reload: function() {
            window.location.replace(window.location.href.replace(/#.*$/, ''));
        }
    });

    var FooterMaintenanceDirectoryView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'maintenance_directory'
    });

    var FooterLoyaltyView = FooterMainView.extend({
        name: 'footer',
        mod: 'loyalty'
    });

    function setCallback(prop) {
        return function() {
            var tab = this.model.get(prop);
            typeof tab == 'function' && tab();
        };
    }

    return new (require('factory'))(revel_view.initViews.bind(revel_view), function() {
        App.Views.FooterView = {};
        App.Views.FooterView.FooterMainView = FooterMainView;
        App.Views.FooterView.FooterCheckoutView = FooterCheckoutView;
        App.Views.FooterView.FooterCardView = FooterCardView;
        App.Views.FooterView.FooterGiftCardView = FooterGiftCardView;
        App.Views.FooterView.FooterConfirmView = FooterConfirmView;
        App.Views.FooterView.FooterDoneView = FooterDoneView;
        App.Views.FooterView.FooterMaintenanceView = FooterMaintenanceView;
        App.Views.FooterView.FooterMaintenanceDirectoryView = FooterMaintenanceDirectoryView;
        App.Views.FooterView.FooterProfileView = App.Views.RevelView.RevelProfileFooterView;
        App.Views.FooterView.FooterLoyaltyView = FooterLoyaltyView;
    });
});
