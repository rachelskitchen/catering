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
                paymentInfo = this.$('.payment-info'),
                order_type, pickup, main, paymentMethods, tips, discount, rewards;

            order_type = App.Views.GeneratorView.create('Checkout', {
                mod: 'OrderType',
                model: this.collection.checkout,
                DINING_OPTION_NAME: this.options.DINING_OPTION_NAME,
                className: 'fl-left'
            });

            pickup = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                timetable: this.options.timetable,
                mod: 'Pickup'
            });

            main = App.Views.GeneratorView.create('Checkout', {
                model: this.collection.checkout,
                customer: this.options.customer,
                rewardsCard: this.collection.rewardsCard,
                mod: 'Main',
                className: 'clear'
            });


            this.subViews.push(order_type, pickup, main);

            orderDetails.prepend(main.el);
            orderDetails.prepend(pickup.el);
            orderDetails.prepend(order_type.el);

            paymentMethods = App.Views.GeneratorView.create('PaymentMethods', {
                mod: 'Main',
                model: this.options.paymentMethods
            });

            this.subViews.push(paymentMethods);
            paymentInfo.append(paymentMethods.el);

            if(this.options.acceptTips) {
                tips = App.Views.GeneratorView.create('Tips', {
                    model: this.collection.total.get('tip'),
                    mod: 'Line',
                    total: this.collection.total
                });
                this.subViews.push(tips);
                paymentInfo.append(tips.el);
            }

            if (this.options.discountAvailable) {
                discount = App.Views.GeneratorView.create('Checkout', {
                    model: this.collection.checkout,
                    mod: 'DiscountCode',
                    myorder: this.collection,
                    className: 'item'
                });
                this.subViews.push(discount);
                paymentInfo.append(discount.el);
            }

            if(this.options.enableRewardCard) {
                rewards = App.Views.GeneratorView.create('Checkout', {
                    model: this.collection.rewardsCard,
                    mod: 'RewardsCard',
                    className: 'item'
                });
                this.subViews.push(rewards);
                paymentInfo.append(rewards.el);
            }

            this.iOSSafariCaretFix();

            return this;
        }
    });

    var CheckoutRewardsCardView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'rewards_card',
        bindings: {
            '.see-rewards': 'classes: {hide: select(length(discounts), false, true)}',
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

    return new (require('factory'))(checkout_view.initViews.bind(checkout_view), function() {
        App.Views.CheckoutView.CheckoutMainView = CheckoutMainView;
        App.Views.CheckoutView.CheckoutPageView = CheckoutPageView;
        App.Views.CheckoutView.CheckoutRewardsCardView = CheckoutRewardsCardView;
    });
});
