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

define(["delivery_addresses", "generator"], function(delivery_addresses) {
    'use strict';

    App.Views.CoreCheckoutView = {};

    App.Views.CoreCheckoutView.CoreCheckoutMainView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:dining_option', this.controlAddress, this);
            this.listenTo(this.model, 'change:dining_option', this.controlDeliverySeat, this);
            this.listenTo(this.options.rewardsCard, 'change:number', this.updateData, this);
            this.listenTo(this.options.customer, 'change:first_name change:last_name change:email change:phone', this.updateData, this);
            this.customer = this.options.customer;
            this.card = App.Data.card;
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);

            this.model.get('dining_option') === 'DINING_OPTION_DELIVERY' &&
                 this.controlAddress(null, 'DINING_OPTION_DELIVERY');

            this.model.get('dining_option') === 'DINING_OPTION_SHIPPING' &&
                 this.controlAddress(null, 'DINING_OPTION_SHIPPING');

            this.model.get('dining_option') === 'DINING_OPTION_DELIVERY_SEAT' &&
                 this.controlDeliverySeat(null, 'DINING_OPTION_DELIVERY_SEAT');
        },
        render: function() {
            var settings = App.Data.settings.get('settings_system'),
                customer = this.options.customer,
                model = {},
                self = this;

            model.firstName = this.customer.escape('first_name');
            model.lastName = this.customer.escape('last_name');
            model.email = this.customer.escape('email');
            model.phone = this.customer.escape('phone');
            model.rewardCard = this.options.rewardsCard.escape('number');
            model.isFirefox = /firefox/i.test(navigator.userAgent);
            model.enableRewardCard = settings.enable_reward_cards_collecting;
            model.business_name = settings.business_name;
            model.address = settings.address;
            model.isMobile = typeof cssua.ua.mobile != 'undefined';
            model.rewardCardType = cssua.ua.mobile ? /android/i.test(cssua.ua.mobile) ? 'tel' : 'number' : 'text'; // too hard logic due to some native android browsers don't correctly display placeholder attribute for input[type='number']

            this.$el.html(this.template(model));

            inputTypeNumberMask(this.$('.phone'), /^\+?\d{0,15}$/, model.phone, true);
            inputTypeNumberMask(this.$('input.rewardCard'), /^\d*$/, model.rewardCard, true);
            this.$('.firstName, .lastName').numberMask({pattern: /^.*$/ }).on("keypressNumber", function(event) {
                try {
                    var start = event.target.selectionStart,
                        end = event.target.selectionEnd,
                        direction = event.target.selectionDirection;
                } catch(e) {
                    console.log('There is not selection API');
                }
                var new_value = this.value.replace(/(^[a-z])|\s([a-z])/g, function(m, g1, g2){
                    return g1 ? g1.toUpperCase() : ' ' + g2.toUpperCase();
                });
                this.value = new_value;
                try {
                    event.target.setSelectionRange(start, end, direction);
                } catch(e) {}
            });

            return this;
        },
        events: {
            'blur .firstName': 'changeFirstName',
            'blur .lastName': 'changeLastName',
            'blur .email': 'changeEmail',
            'blur .phone': 'changePhone',
            'blur .rewardCard' : 'changeRewardCard'
        },
        changeFirstName: function(e) {
            this.customer.set('first_name', e.target.value);
            this.card.set('firstName', e.target.value);
        },
        changeLastName: function(e) {
            this.customer.set('last_name', e.target.value);
            this.card.set('secondName', e.target.value);
        },
        changeEmail: function(e) {
            this.customer.set('email', e.target.value);
        },
        changePhone: function(e) {
            this.customer.set('phone', e.target.value);
        },
        changeRewardCard: function(e) {
            this.options.rewardsCard.set('number', e.target.value);
        },
        controlAddress: function(model, value) {
            var address = this.subViews.shift();

            // remove address if it exists
            address && address.remove();

            if(value === 'DINING_OPTION_DELIVERY' || value === 'DINING_OPTION_SHIPPING') {
                address = new App.Views.CheckoutView.CheckoutAddressView({
                    customer: this.customer,
                    checkout: this.model
                });
                this.subViews.push(address);
                this.$('.delivery_address').append(address.el);
                if(address.model.state || address.model.province)
                    this.trigger('address-with-states');
                else
                    this.trigger('address-without-states');
            } else {
                this.trigger('address-hide');
            }
        },
        controlDeliverySeat: function(model, value) {
            if(value === 'DINING_OPTION_DELIVERY_SEAT') {
                if (!this.seatView) {
                    this.seatView = new App.Views.CoreCheckoutView.CoreCheckoutSeatView({model: this.model});
                    this.$('.delivery_seat').append(this.seatView.el);
                }
                this.trigger('delivery-to-seat');
                this.$('.delivery_seat').show();
            } else {
                this.$('.delivery_seat').hide();
            }
        },
        updateData: function() {
            var customer = this.customer;
            this.$('.firstName').val(customer.get('first_name'));
            this.$('.lastName').val(customer.get('last_name'));
            this.$('.email').val(customer.get('email'));
            this.$('.phone').val(customer.get('phone'));
            this.$('.rewardCard').val(this.options.rewardsCard.get('number'));
        }
    });

    App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'order_type',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:dining_option', this.show_hide);
            this.set_type();
            this.show_hide();
        },
        render: function() {
            var model = {
                isFirefox: /firefox/i.test(navigator.userAgent),
                dining_option: this.model.get('dining_option')
            };
            this.$el.html(this.template(model));

            var dining = this.$('.order-type-select');
            for(var key in this.options.DINING_OPTION_NAME) {
                dining.append('<option value="' + key + '">' + this.options.DINING_OPTION_NAME[key] + '</option>');
            };
            return this;
        },
        events: {
            'change .order-type-select': 'change_type'
        },
        change_type : function(e) {
            var value = e.currentTarget.value,
                oldValue = this.model.get('dining_option');

            if (value !== oldValue) {
                this.model.set('dining_option', value);
            }
        },
        set_type : function() {
            var dining_option = this.model.get('dining_option') || App.Settings.default_dining_option,
                type = this.$('.order-type-select');

            type.val(dining_option);
            this.model.set('dining_option', dining_option);
        },
        show_hide: function() {
            if (this.model.get('dining_option') === 'DINING_OPTION_ONLINE') {
                this.$el.hide();
            } else {
                this.$el.show();
            }
            this.$('.order-type-select').val(this.model.get('dining_option'));
        }
    });

    App.Views.CoreCheckoutView.CoreCheckoutAddressView = App.Views.DeliveryAddressesView.extend({
        name: 'checkout',
        mod: 'address'
    });

    App.Views.CoreCheckoutView.CoreCheckoutSeatView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'seat',
        initialize: function() {
            this.listenTo(this.model, 'change', this.render, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            var data = this.model.toJSON();
            data.isDeliverToSeat = this.model.get('dining_option') === 'DINING_OPTION_DELIVERY_SEAT';
            data.orderFromSeat = App.Data.orderFromSeat || {};
            this.$el.html(this.template(data));

            inputTypeNumberMask(this.$('input[name=level], input[name=section], input[name=row], input[name=seat]'), /^[\d\w]{0,4}$/);
        },
        events: {
            'change input': 'onChangeElem',
            'change select': 'onChangeSelect'
        },
        onChangeElem: function(e) {
            e.target.value = e.target.value.toUpperCase();
            this.model.set(e.target.name, e.target.value);
        },
        onChangeSelect: function(e) {
            this.model.set(e.target.name, e.target.value);
        }
    });

    App.Views.CoreCheckoutView.CoreCheckoutPickupView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'pickup',
        initialize: function() {
            this.listenTo(this.model, 'change:dining_option', this.listenOrderType, this);

            this.templateData = {
                isFirefox: /firefox/i.test(navigator.userAgent),
                isOrderFromSeat: App.Data.orderFromSeat instanceof Object
            };

            this.isDelivery = this.model.get('dining_option') === 'DINING_OPTION_DELIVERY';
            this.pickupTime = this.options.timetable.getPickupList(this.isDelivery);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenOrderType(null, this.model.get('dining_option'));
        },
        render: function() {
            var days;

            this.templateData.pickupTimeLabel = '';
            this.$el.html(this.template(this.templateData));

            days = this.$('select.day');
            this.pickupTime.forEach(function(day, i) {
                days.append('<option value="' + i + '">' + day.weekDay + '</option>');
            });

            return this;
        },
        events: {
            'change select.day': 'changeDay',
            'change select.time': 'changeTime'
        },
        changeDay: function(e) {
            var index = e.target.value*1,
                workingDay = this.pickupTime[index].workingDay,
                time = this.$('select.time'),
                label = time.parent();

            label.removeAttr('disabled');
            time.removeAttr('disabled');
            time.empty();

            workingDay.forEach(function(value, i) {
                time.append('<option value="' + i + '">' + (value !== "closed" ? value : 'The store is closed') + '</option>');
                if(value === "closed") {
                    time.attr('disabled', 'disabled');
                    label.attr('disabled', 'disabled');
                }
            });

            this.model.set('pickupDay',index);
            this.changeTime({target: { value : 0 }});
        },
        changeTime: function(e) {
            var index = e.target.value*1,
                day = this.$('select.day').val(),
                time = this.pickupTime[day].workingDay[index],
                date = this.pickupTime[day].date,
                format = new TimeFrm,
                pickupTS, isPickupASAP = false;

            this.model.set('pickupTimeReview',index);

            if(time && time.indexOf('ASAP') != -1) {
                pickupTS = App.Data.timetables.base().getTime();
                isPickupASAP = true;
            } else if (time === 'closed') {
                pickupTS = null;
            } else {
                format = new TimeFrm(0, 0, 'usa');
                format.load_from_str(time);
                var timeSplit = format.toString('24hour').split(':');
                pickupTS = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeSplit[0], timeSplit[1]).getTime();
            }
            this.model.set({
                'pickupTS': pickupTS,
                'isPickupASAP': isPickupASAP
            });
            return time;
        },
        setPickupDay: function() {
            var pickupDay = this.model.get('pickupDay') || 0,
                pickupTime = this.model.get('pickupTimeReview') || 0,
                day = this.$('select.day');

            day.val(pickupDay);
            this.changeDay({target: { value: pickupDay }});
            this.model.set('pickupTimeReview', pickupTime);
            this.setPickupTime();
        },
        setPickupTime: function() {
            var pickup = this.model.get('pickupTimeReview') || 0,
                time = this.$('select.time');

            time.val(pickup);
            this.changeTime({target: {value: pickup }});
        },
        listenOrderType: function(model, value) {
            this.isDelivery = this.model.get('dining_option') === 'DINING_OPTION_DELIVERY';
            this.pickupTime = this.options.timetable.getPickupList(this.isDelivery);
            if (value === 'DINING_OPTION_DELIVERY') {
                this.$('.pickup').text('Delivery Time');
            } else {
                this.$('.pickup').text('Arrival Time');
            }

            if (value === 'DINING_OPTION_ONLINE') {
                this.$el.hide();
            } else {
                this.$el.show();
            }
            this.setPickupDay();
        }
    });

    App.Views.CoreCheckoutView.CoreCheckoutPayView = App.Views.FactoryView.extend({
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

    App.Views.CoreCheckoutView.CoreCheckoutPayButtonView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'pay_button',
        initialize: function() {
            var payment = App.Data.settings.get_payment_process();
            this.listenTo(this.collection, 'cancelPayment', function() {
                this.canceled = true;
            }, this);
            this.listenTo(this.collection, "paymentFailed", function(message) {
                this.collection.trigger('hideSpinner');
            }, this);
            this.flag = this.options.flag === 'checkout',
            this.needPreValidate = payment.payment_count == 1 && this.flag;
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection.checkout, 'change:dining_option', this.change_cash_text);
        },
        render: function() {
            var payment = Backbone.$.extend(App.Data.settings.get_payment_process(), {
                flag: this.flag
            });

            this.$el.html(this.template(payment));
            this.change_cash_text();
            return this;
        },
        events: {
            'click .pay': 'pay_event',
            'click .credit-card': 'credit_card',
            'click .gift-card': 'gift_card',
            'click .paypal': function() {
                this.pay(PAYMENT_TYPE.PAYPAL);
            },
            'click .cash': function(){
                this.pay(PAYMENT_TYPE.NO_PAYMENT);
            }
        },
        change_cash_text: function() {
            var dining_option = this.collection.checkout.get("dining_option"),
                isDelivery = dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING';
            this.$('.cash').html(isDelivery ? MSG.PAY_AT_DELIVERY : MSG.PAY_AT_STORE);
        },
        gift_card: function() {
            var self = this;
            $('#popup .cancel').trigger('click');
            App.Data.myorder.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
                validationOnly: this.needPreValidate
            }, function() {
                App.Data.mainModel.set('popup', {
                    modelName: 'Confirm',
                    mod: 'PayCard',
                    submode: 'Gift',
                    collection: self.collection,
                    className: 'confirmPayCard',
                    timetable: App.Data.timetables,
                    card: App.Data.giftcard,
                    two_columns_view: true
                });
            });
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
                    validationOnly: this.needPreValidate
                }, function() {
                    self.pay(PAYMENT_TYPE.CREDIT);
                });
            } else if (this.options.flag) {
                App.Data.myorder.check_order({
                    order: true,
                    tip: true,
                    customer: true,
                    checkout: true,
                    validationOnly: this.needPreValidate
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
                    submode: 'Credit',
                    collection: self.collection,
                    className: 'confirmPayCard',
                    timetable: App.Data.timetables,
                    card: App.Data.card,
                    two_columns_view: true
                });
            }
        },
        pay: function(payment_type) {
            saveAllData();
            var self = this;

            self.collection.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
                validationOnly: this.needPreValidate
            }, function() {
                self.collection.create_order_and_pay(payment_type);
                !self.canceled && self.collection.trigger('showSpinner');
            $('#popup .cancel').trigger('click');
            });
        },
        pay_event: function() {
            var self = this;
            App.Data.myorder.check_order({
                order: true,
                tip: true,
                customer: true,
                checkout: true,
                validationOnly: true
            }, function() {
                self.collection.trigger('onPay');
            });
        }
    });

    App.Views.CoreCheckoutView.CoreCheckoutPageView = App.Views.FactoryView.extend({
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

    /*
    *  This DiscountCode view is used by weborder and retail skins.
    */
    App.Views.CoreCheckoutView.CoreCheckoutDiscountCodeView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'discount_code',
        initialize: function() {
            this.listenTo(this.model, 'change', this.render, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            var data = this.model.toJSON();
            data.iPad = iPad();
            this.$el.html(this.template(data));
            inputTypeStringMask(this.$('input'), /^[\d\w]{0,16}$/, '');

            return this;
        },
        events: {
            'click .btnApply': 'onApplyCode',
            'keyup input[name=discount_code]': 'onChangeDiscountCode'
        },
        onChangeDiscountCode: function(e) {
            var newValue = e.target.value,
                oldValue = this.model.get("discount_code");

            if (newValue == oldValue)
                return;

            this.model.set({"discount_code":newValue}, {silent: true});
            this.enableApplyBtn();
        },
        onApplyCode: function() {
            var self = this,
                myorder = this.options.myorder;

            if (!/^[\d\w]{4,16}$/.test(this.model.get("discount_code")) ) {
                App.Data.errors.alert(MSG.ERROR_INCORRECT_DISCOUNT_CODE); // user notification
                return;
            }
            myorder.get_cart_totals({ apply_discount: true})
                .done(function(data) {
                    if (data.status == "OK") {
                        self.disableApplyBtn();
                    }
                });
        },
        enableApplyBtn: function() {
            this.$(".btnApply").removeAttr("disabled").removeClass("applied").text("Apply");
        },
        disableApplyBtn: function() {
            this.$(".btnApply").attr("disabled", "disabled").addClass("applied").text("Applied");
        }
    });

    /*
    *  This DiscountCode2 view is used by weborder_mobile and paypal skins.
    */
    App.Views.CoreCheckoutView.CoreCheckoutDiscountCode2View = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'discount_code',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            var data = this.model.toJSON();
            data.discount_allow = App.Settings.accept_discount_code === true;
            data.discount_code_applied = this.model.get("last_discount_code");
            this.$el.html(this.template(data));
            inputTypeStringMask(this.$('input'), /^[\d\w]{0,16}$/, '');
            return this;
        },
        events: {
            'click .dcode_have': 'enterDiscountCode',
            'click .dcode_remove': 'removeDiscountCode',
            'click .btnApply': 'onApplyCode',
            'change input[name=discount_code]': 'onChangeDiscountCode'
        },
        onChangeDiscountCode: function(e) {
            var newValue = e.target.value,
                oldValue = this.model.get("discount_code");

            if (newValue == oldValue)
                return;

            this.model.set({"discount_code":newValue}, {silent: true});
        },
        enterDiscountCode: function() {
            this.$(".dcode_have").addClass('hidden');
            this.$(".dcode_enter").removeClass('hidden');
            this.$('input[name=discount_code]').val(this.model.get("discount_code"));
        },
        removeDiscountCode: function() {
            var myorder = this.options.myorder;
            this.$(".dcode_remove").addClass('hidden');
            this.$(".dcode_have").removeClass('hidden');
            this.model.set({last_discount_code: '',
                            discount_code: ''}, {silent: true});
            myorder.get_cart_totals();
        },
        onApplyCode: function() {
            var self = this,
                myorder = this.options.myorder;

            if (!/^[\d\w]{4,16}$/.test(this.model.get("discount_code")) ) {
                App.Data.errors.alert(MSG.ERROR_INCORRECT_DISCOUNT_CODE); // user notification
                return;
            }
            myorder.get_cart_totals({ apply_discount: true})
                .done(function(data) {
                    if (data.status == "OK") {
                        self.discountApplied();
                    }
                });
        },
        discountApplied: function() {
            this.$(".dcode_have").addClass('hidden');
            this.$(".dcode_enter").addClass('hidden');
            this.$(".dcode_remove").removeClass('hidden');
        }
    });

    return new (require('factory'))(function() {
        App.Views.CheckoutView = {};
        App.Views.CheckoutView.CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView;
        App.Views.CheckoutView.CheckoutOrderTypeView = App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView;
        App.Views.CheckoutView.CheckoutAddressView = App.Views.CoreCheckoutView.CoreCheckoutAddressView;
        App.Views.CheckoutView.CheckoutPickupView = App.Views.CoreCheckoutView.CoreCheckoutPickupView;
        App.Views.CheckoutView.CheckoutDiscountCodeView = App.Views.CoreCheckoutView.CoreCheckoutDiscountCodeView;
        App.Views.CheckoutView.CheckoutDiscountCode2View = App.Views.CoreCheckoutView.CoreCheckoutDiscountCode2View;
        App.Views.CheckoutView.CheckoutPayView = App.Views.CoreCheckoutView.CoreCheckoutPayView;
        App.Views.CheckoutView.CheckoutPayButtonView = App.Views.CoreCheckoutView.CoreCheckoutPayButtonView;
        App.Views.CheckoutView.CheckoutPageView = App.Views.CoreCheckoutView.CoreCheckoutPageView;
    });
});
