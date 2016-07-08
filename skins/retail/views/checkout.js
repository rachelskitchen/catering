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

    var CheckoutPageView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'page',
        bindings: {
            '.step-1': 'classes: {active: equal(ui_step, 1)}',
            '.step-2': 'classes: {active: equal(ui_step, 2)}',
            '.step-3': 'classes: {active: equal(ui_step, 3)}',
            '.view-1': 'toggle: equal(ui_step, 1)',
            '.view-2': 'toggle: equal(ui_step, 2)',
            '.view-3': 'toggle: equal(ui_step, 3)',
            '.order-type': 'updateContent: orderTypeView',
            '.personal-box': 'updateContent: mainView',
            '.payment-methods-box': 'updateContent: paymentMethodsView, classes: {hide: not(hasGrandTotal(total_grandTotal))}',
            '.choose-cc-box': 'updateContent: chooseCreditCardView, classes: {hide: any(not(equal(paymentMethods_selected, "credit_card_button")), not(length($tokens)), not(hasGrandTotal(total_grandTotal))), "inline-block": not(paymentMethods_credit_card_dialog)}',
            '.cc-box': 'updateContent: creditCardView, classes: {hide: any(not(equal(paymentMethods_selected, "credit_card_button")), select(length($tokens), token_selected, false), not(hasGrandTotal(total_grandTotal))), "inline-block": not(paymentMethods_credit_card_dialog)}',
            '.billing-address-box': 'updateContent: billingAddressView, classes: {hide: any(not(equal(paymentMethods_selected, "credit_card_button")), select(length($tokens), token_selected, false), not(hasGrandTotal(total_grandTotal)))}',
            '.choose-gift-card-box': 'updateContent: chooseGiftCardView, classes: {hide: any(not(equal(paymentMethods_selected, "gift_card")), not(length($giftCards)), not(hasGrandTotal(total_grandTotal)))}',
            '.gift-card-box': 'updateContent: giftCardView, classes: {hide: any(not(equal(paymentMethods_selected, "gift_card")), select(length($giftCards), giftCard_selected, false), not(hasGrandTotal(total_grandTotal)))}',
            '.stanford-card-box': 'updateContent: stanfordCardView, classes: {hide: any(not(equal(paymentMethods_selected, "stanford")), not(hasGrandTotal(total_grandTotal)))}',
            '.stanford-plans-box': 'updateContent: stanfordPlansView, classes: {hide: any(not(equal(paymentMethods_selected, "stanford")), not(hasGrandTotal(total_grandTotal)))}',
            '.discounts-box': 'classes: {hide: all(not(discountCodeView), not(rewardsView))}',
            '.discounts-title': 'text: discountsTitle(discountCodeView, rewardsView)',
            '.discount-code-box': 'updateContent: discountCodeView',
            '.rewards-box': 'updateContent: rewardsView'
        },
        computeds: {
            orderTypeView: function() {
                return {
                    name: 'Checkout',
                    mod: 'OrderType',
                    model: this.collection.checkout,
                    DINING_OPTION_NAME: this.options.DINING_OPTION_NAME
                };
            },
            mainView: function() {
                return {
                    name: 'Checkout',
                    mod: 'Main',
                    model: this.collection.checkout,
                    customer: this.options.customer,
                    rewardsCard: this.collection.rewardsCard
                };
            },
            paymentMethodsView: function() {
                return {
                    name: 'PaymentMethods',
                    mod: 'Main',
                    model: this.options.paymentMethods,
                    checkout: this.collection.checkout
                };
            },
            chooseCreditCardView: {
                deps: ['paymentMethods_credit_card_button'],
                get: function(credit_card_button) {
                    if (credit_card_button) {
                        return {
                            name: 'Profile',
                            mod: 'PaymentsSelection',
                            collection: this.tokens,
                            model: this.token
                        };
                    }
                }
            },
            creditCardView: function() {
                return {
                    name: 'Card',
                    mod: 'Main',
                    model: this.options.card,
                    token: this.token,
                    paymentMethods: this.options.paymentMethods
                };
            },
            billingAddressView: {
                deps: ['paymentMethods_credit_card_dialog'],
                get: function(card_dialog) {
                    if (card_dialog && this.options.needShowBillingAddess) {
                        return {
                            name: 'Card',
                            mod: 'BillingAddress',
                            model: this.options.card.get("billing_address"),
                            customer: this.options.customer,
                            card: this.options.card,
                            checkout: this.collection.checkout
                        };
                    }
                }
            },
            chooseGiftCardView: {
                deps: ['paymentMethods_gift_card'],
                get: function(gift_card) {
                    if (gift_card) {
                        return {
                            name: 'Profile',
                            mod: 'GiftCardsSelection',
                            collection: this.giftCards,
                            model: this.giftCard
                        };
                    }
                }
            },
            giftCardView: {
                deps: ['paymentMethods_gift_card'],
                get: function(gift_card) {
                    if (gift_card) {
                        return {
                            name: 'GiftCard',
                            mod: 'Main',
                            model: this.options.giftcard
                        };
                    }
                }
            },
            stanfordCardView: {
                deps: ['paymentMethods_stanford'],
                get: function(stanford) {
                    if (stanford) {
                        return {
                            name: 'StanfordCard',
                            mod: 'Main',
                            model: this.options.stanfordcard,
                            myorder: this.collection
                        }
                    }
                }
            },
            stanfordPlansView: {
                deps: ['paymentMethods_stanford'],
                get: function(stanford) {
                    if (stanford) {
                        return {
                            name: 'StanfordCard',
                            mod: 'Plans',
                            model: this.options.stanfordcard,
                            collection: this.options.stanfordcard.get('plans')
                        };
                    }
                }
            },
            discountCodeView: function() {
                if (this.options.discountAvailable) {
                    return {
                        name: 'Checkout',
                        mod: 'DiscountCode',
                        model: this.collection.checkout,
                        myorder: this.collection
                    };
                }
            },
            rewardsView: function() {
                if(this.options.enableRewardCard) {
                    return {
                        name: 'Checkout',
                        mod: 'RewardsCard',
                        model: this.collection.rewardsCard
                    };
                }
            }
        },
        bindingFilters: {
            discountsTitle: function(discountCode, rewards) {
                if (discountCode && rewards) {
                    return _loc.CHECKOUT_DISCOUNT_AND_REWARDS_TITLE;
                } else if (discountCode) {
                    return _loc.CHECKOUT_DISCOUNT_TITLE;
                } else {
                    return _loc.CHECKOUT_REWARDS_TITLE;
                }
            },
            hasGrandTotal: function(grandTotal) {
                return Boolean(Number(grandTotal));
            }
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({
                    step: 1
                });
            }
        },
        events: {
            'click .to-step-1': 'toStep1',
            'click .to-step-2': 'toStep2',
            'click .to-step-3': 'toStep3',
            'click .submit': 'submit'
        },
        onEnterListeners: {
            '.to-step-1': 'toStep1',
            '.to-step-2': 'toStep2',
            '.to-step-3': 'toStep3',
            '.submit': 'submit'
        },
        initialize: function() {
            this.tokens = new Backbone.Collection();
            this.giftCards = new Backbone.Collection();
            this.token = new Backbone.Model({selected: false, paymentsExist: false});
            this.giftCard = new Backbone.Model({selected: false});
            _.extend(this.bindingSources, {
                token: this.token,           // indicates any token is selected or not
                tokens: this.tokens,         // tokens
                giftCard: this.giftCard,     // indicated any saved gift card is selected or not
                giftCards: this.giftCards    // saved gift cards
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.options.customer, 'onLogin', this.setProfileData);
            this.listenTo(this.options.customer, 'onLogout', this.removeProfileData);
            this.setProfileData();
        },
        setProfileData: function() {
            var promises = this.options.promises(),
                customer = this.options.customer,
                self = this;

            if (promises.length) {
                Backbone.$.when.apply(Backbone.$, promises).then(function() {
                    if (customer.payments) {
                        customer.payments.selectFirstItem();
                        self.token.set({
                            selected: customer.payments.length > 0,
                            paymentsExist: true
                        });
                        self.tokens.reset(customer.payments.models);
                    }
                    if (customer.giftCards) {
                        customer.giftCards.selectFirstItem();
                        self.giftCard.set('selected', true);
                        self.giftCards.reset(customer.giftCards.models);
                    }
                });
            }
        },
        removeProfileData: function() {
            this.token.set({
                paymentsExist: false,
                selected: false
            });
            this.giftCard.set('selected', false);
            this.tokens.reset();
            this.giftCards.reset();
        },
        toStep1: function() {
            this.setBinding('ui_step', 1);
        },
        toStep2: function() {
            var ui = this.getBinding('$ui');
            this.collection.check_order({
                order: true,
                checkout: true,
                customer: true
            }, function() {
                ui.set('step', 2);
            });
        },
        toStep3: function() {
            var ui = this.getBinding('$ui');
            this.collection.check_order({
                order: true,
                checkout: true,
                customer: true
            }, function() {
                ui.set('step', 3);
            });
        },
        submit: function() {
            this.collection.trigger('onPay', this.options.paymentMethods.onPay.bind(this.options.paymentMethods));
        }
    });

    var CheckoutRewardsCardView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'rewards_card',
        bindings: {
            '.rewards-card-apply': 'classes: {hide: length(discounts)}',
            '.see-rewards': 'classes: {hide: not(length(discounts))}',
            '.rewardCard': 'value: number, events: ["input"], attr: {readonly: select(length(discounts), true, false)}, restrictInput: "0123456789", kbdSwitcher: "numeric", pattern: /^\\d*$/'
        },
        events: {
            'click .rewards-card-apply': 'applyRewardsCard',
            'click .see-rewards': 'showRewards',
            'click .cancel-input': 'resetRewards'
        },
        applyRewardsCard: function() {
            this.model.trigger('onApplyRewardsCard');
        },
        showRewards: function() {
            this.model.trigger('onRewardsReceived');
        },
        resetRewards: function() {
            this.model.resetData();
        }
    });

    var CheckoutAddressView = App.Views.CoreCheckoutView.CoreCheckoutAddressView.extend({
        name: 'checkout',
        mod: 'address',
        render: function() {
            App.Views.CoreCheckoutView.CoreCheckoutAddressView.prototype.render.apply(this, arguments);

            var addressSelection = App.Views.GeneratorView.create('Checkout', {
                mod: 'AddressSelection',
                checkout: this.options.checkout,
                customer: this.options.customer,
                address_index: this.options.address_index
            });
            this.subViews.push(addressSelection);
            this.$('.address-selection').html(addressSelection.el);

            return this;
        }
    });

    return new (require('factory'))(checkout_view.initViews.bind(checkout_view), function() {
        App.Views.CheckoutView.CheckoutPageView = CheckoutPageView;
        App.Views.CheckoutView.CheckoutRewardsCardView = CheckoutRewardsCardView;
        App.Views.CheckoutView.CheckoutAddressView = CheckoutAddressView;
    });
});
