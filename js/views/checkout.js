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

define(["backbone", "factory", "generator", "delivery_addresses"], function(Backbone) {
    'use strict';

    App.Views.CoreCheckoutView = {};

    App.Views.CoreCheckoutView.CoreCheckoutMainView = App.Views.FactoryView.extend({
        name: 'checkout',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:dining_option', this.controlAddress, this);
            this.listenTo(this.model, 'change:dining_option', this.controlDeliverySeat, this);
            this.customer = this.options.customer;
            this.card = App.Data.card;
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.model.get('dining_option') === 'DINING_OPTION_DELIVERY' &&
                 this.controlAddress(null, 'DINING_OPTION_DELIVERY');

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
            model.rewardCard = this.model.escape('rewardCard');
            model.isFirefox = /firefox/i.test(navigator.userAgent);
            model.enableRewardCard = settings.enable_reward_cards_collecting;
            model.business_name = settings.business_name;
            model.address = settings.address;
            model.isMobile = typeof cssua.ua.mobile != 'undefined';
            model.rewardCardType = cssua.ua.mobile ? /android/i.test(cssua.ua.mobile) ? 'tel' : 'number' : 'text'; // too hard logic due to some native android browsers don't correctly display placeholder attribute for input[type='number']

            this.$el.html(this.template(model));
            this.$('.phone').numberMask({
                type: "float",
                pattern: /^\+?\d{0,15}$/
            });
            this.$('input.rewardCard').numberMask({pattern: /^\d*$/ });
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
            'change .email': 'changeEmail',
            'change .phone': 'changePhone',
            'change .rewardCard' : 'changeRewardCard'
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
            this.model.set('rewardCard', e.target.value);
        },
        controlAddress: function(model, value) {
            if(value === 'DINING_OPTION_DELIVERY') {
                this.customer.set('shipping_address', -1);
                var address = new App.Views.CheckoutView.CheckoutAddressView({customer: this.customer});
                this.subViews.push(address);
                this.$('.delivery_address').append(address.el);
                if(address.model.state || address.model.province)
                    this.trigger('address-with-states');
                else
                    this.trigger('address-without-states');
            } else {
                address = this.subViews.shift();
                address && address.remove();
                this.trigger('address-hide');
                this.customer.unset('shipping_address');
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
                this.collection.recalculate_tax();
            }
        },
        set_type : function() {
            var dining_option = this.model.get('dining_option') || 'DINING_OPTION_TOGO',
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
        mod: 'address',
        initialize: function() {
            this.listenTo(this, 'update_address', this.updateAddress, this);
            App.Views.DeliveryAddressesView.prototype.initialize.apply(this, arguments);
            this.updateAddress();
        },
        updateAddress: function() {
            var settings = App.Data.settings.get('settings_system'),
                shipping_address = this.options.customer.get('shipping_address'),
                address;
            address = {
                street_1: this.model.street_1,
                street_2: this.model.street_2,
                city: this.model.city,
                state: this.model.state,
                province: this.model.province,
                zipcode: this.model.zipcode,
                country: this.model.country
            };

            var addresses = this.options.customer.get('addresses');

            if (addresses.length === 0 || typeof addresses[addresses.length - 1].street_1 !== 'string') {
                addresses.push(address);
            } else if (shipping_address === -1) {
                addresses[addresses.length - 1] = address;
            }
            addresses[addresses.length - 1].address = this.options.customer.address_str();

            if (this.model.isShippingServices && address.street_1 && address.city && address.country &&
                address.zipcode && (address.country == 'US' ? address.state : true) &&
                                   (address.country == 'CA' ? address.province : true)) {
                this.options.customer.get_shipping_services();
            }
        }
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
            'change input': 'onChangeElem'
        },
        onChangeElem: function(e) {
            e.target.value = e.target.value.toUpperCase();
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

            if(time === 'ASAP') {
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

    App.Views.CheckoutView = {};

    App.Views.CheckoutView.CheckoutMainView = App.Views.CoreCheckoutView.CoreCheckoutMainView;

    App.Views.CheckoutView.CheckoutOrderTypeView = App.Views.CoreCheckoutView.CoreCheckoutOrderTypeView;

    App.Views.CheckoutView.CheckoutAddressView = App.Views.CoreCheckoutView.CoreCheckoutAddressView;

    App.Views.CheckoutView.CheckoutPickupView = App.Views.CoreCheckoutView.CoreCheckoutPickupView;
});