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
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(App.Data.customer, 'change:shipping_services', this.updateConfirmButtonState, this);
            this.updateConfirmButtonState();
        },
        updateConfirmButtonState: function() {
            var customer = App.Data.customer,
                status = customer.get('load_shipping_status'),
                confirm = this.$('#confirmOrder');
            if ('pending' == status) {
                confirm.addClass('disabled');
            } else {
                confirm.removeClass('disabled');
            }
        },
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

    var FooterStanfordCardView = FooterCardView.extend({
        name: "footer",
        mod: "stanford_card",
        bindings: {
            '.proceed': 'classes: {"proceed-plans": not(card_planId), "proceed-order": card_planId, disabled: any(not(card_number), not(card_captchaKey), not(card_captchaValue))}',
            '.reset': 'classes: {disabled: not(card_planId)}'
        },
        events: {
            "click .cancel": "cancel",
            "click .proceed-plans": "submitCard",
            "click .proceed-order": "submitOrder",
            "click .reset": "reset"
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            var myorder = this.options.myorder;
            this.listenTo(myorder, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(myorder, "paymentFailed", function(message) {
                this.options.mainModel.trigger("loadCompleted");
                message && App.Data.errors.alert(message); // user notification
            }, this);
            this.listenTo(this.options.card, 'onStanfordCardError', this.onStanfordCardError, this);
        },
        submitCard: function() {
            var mainModel = this.options.mainModel,
                card = this.options.card;
            mainModel.trigger('loadStarted');
            this.options.card.getPlans().then(mainModel.trigger.bind(mainModel, 'loadCompleted'));
        },
        submitOrder: function() {
            var myorder = this.options.myorder,
                mainModel = this.options.mainModel;
            myorder.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
            }, function() {
                myorder.create_order_and_pay(PAYMENT_TYPE.STANFORD);
                !self.canceled && mainModel.trigger('loadStarted');
                delete self.canceled;
                saveAllData();
                App.Data.router.navigate('confirm', true);
            });
        },
        onStanfordCardError: function(msg) {
            App.Data.errors.alert(msg);
        },
        reset: function() {
            this.options.card.trigger('resetNumber')
        }
    });

    var FooterConfirmView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'confirm',
        bindings: {
            '#cash > span': 'text: cashBtnText',
            '.confirm': 'classes:{rows: any(equal(rows, 2), equal(rows, 3), equal(rows, 4)), "rows-2": equal(rows, 2), "rows-3": equal(rows, 3), "rows-4": equal(rows, 4)}'
        },
        computeds: {
            cashBtnText: {
                deps: ['checkout_dining_option'],
                get: function(dining_option) {
                    var isDelivery = dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING';
                    return isDelivery ? MSG.PAY_AT_DELIVERY : MSG.PAY_AT_STORE;
                }
            },
            rows: {
                deps: ['payments_payment_count', 'payments_credit_card_button', 'payments_gift_card'],
                get: function(payment_count, credit_card_button, gift_card) {
                    credit_card_button && gift_card && --payment_count;
                    this.options.mainModel.trigger('resizeSection', payment_count);
                    return payment_count;
                }
            }
        },
        events: {
            "click #creditCard": "creditCard",
            "click #creditCardRedirect": "creditCard",
            "click #pay": "pay",
            "click #payPaypal": "pay",
            "click #giftcard": "giftCard",
            "click #cash": "cash",
            "click #stanford": 'stanfordCard'
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(App.Data.myorder, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(App.Data.myorder, "paymentFailed", function(message) {
                this.options.mainModel.trigger("loadCompleted");
                message && App.Data.errors.alert(message); // user notification
            }, this);
        },
        remove: function() {
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
            this.options.mainModel.trigger('restoreSection');
        },
        removeFromDOMTree: function() {
            App.Views.FactoryView.prototype.removeFromDOMTree.apply(this, arguments);
            this.options.mainModel.trigger('restoreSection');
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
        },
        stanfordCard: setCallback('stanfordcard')
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

    var FooterRewardsCardView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'rewards_card',
        bindings: {
            '.submit-card': 'classes: {disabled: disableBtn}',
        },
        events: {
            'click .submit-card': 'submit'
        },
        computeds: {
            disableBtn: {
                deps: ['rewardsCard_number', 'rewardsCard_captchaValue', 'rewardsCard_captchaKey'],
                get: function(number, captchaValue, captchaKey) {
                    return !(number && captchaValue && captchaKey);
                }
            }
        },
        submit: function() {
            this.getBinding('$rewardsCard').trigger('onGetRewards');
        }
    });

    var FooterRewardsView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'rewards',
        bindings: {
            '.apply-reward': 'classes: {disabled: select(rewardsCard_redemption_code, false, true)}',
        },
        events: {
            'click .apply-reward': 'apply'
        },
        apply: function() {
            var rewardsCard = this.getBinding('$rewardsCard');
            rewardsCard.trigger('beforeRedemptionApplied');
            rewardsCard.trigger('onRedemptionApplied');
        }
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
        App.Views.FooterView.FooterStanfordCardView = FooterStanfordCardView;
        App.Views.FooterView.FooterConfirmView = FooterConfirmView;
        App.Views.FooterView.FooterDoneView = FooterDoneView;
        App.Views.FooterView.FooterMaintenanceView = FooterMaintenanceView;
        App.Views.FooterView.FooterMaintenanceDirectoryView = FooterMaintenanceDirectoryView;
        App.Views.FooterView.FooterProfileView = App.Views.RevelView.RevelProfileFooterView;
        App.Views.FooterView.FooterLoyaltyView = FooterLoyaltyView;
        App.Views.FooterView.FooterRewardsCardView = FooterRewardsCardView;
        App.Views.FooterView.FooterRewardsView = FooterRewardsView;
    });
});
