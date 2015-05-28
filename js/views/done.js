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

define(["backbone", "factory"], function(Backbone) {

    App.Views.CoreMainView = {};

    App.Views.CoreMainView.CoreMainDoneView = App.Views.FactoryView.extend({
        name: 'main',
        mod: 'done',
        render: function() {
            var get = App.Data.myorder.paymentResponse,
                checkout =  App.Data.myorder.checkout,
                dining_option = checkout.get('dining_option');

            var model = this.model.toJSON();
            model.logo = App.Data.header.get('logo');
            model.business_name = App.Data.header.get('business_name');
            model.isOnlyGift = dining_option === 'DINING_OPTION_ONLINE';

            if (get.status === "OK") {
                this.model.success = true;
                App.Data.myorder.order_id = get.orderId;

                if (dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_DELIVERY_SEAT' || dining_option === 'DINING_OPTION_SHIPPING')
                    model.pickup_type = 'Delivery Time';
                else
                    model.pickup_type = 'Pickup Time';

                model.order_id = get.orderId;
                model.total = round_monetary_currency(get.total); // order total
                model.pickup_time_date = checkout.get('pickupTime'); // order time

                $.extend(model, this.getPickupTime());

                model.email = App.Data.customer.get('email');
                model.status = 'success';

                model.reward_points = get.reward_points || '';
                model.symbol = App.Data.settings.get('settings_system').currency_symbol;

                model.isOrderFromSeat = App.Data.orderFromSeat instanceof Object;
                model.isDeliverToSeat = checkout.get("dining_option") === 'DINING_OPTION_DELIVERY_SEAT';
                model.level = checkout.get("level");
                model.section = checkout.get("section");
                model.row = checkout.get("row");
                model.seat = checkout.get("seat");
            } else {
                var error = get.errorMsg.replace(/\+/g, ' ').replace(/%\d+/g, '');
                this.model.success = false;
                model = $.extend(model, {
                    status: 'error',
                    /* message : 'Payment failed - try to repeat',*/
                    message: error
                });
            }
            this.$el.html(this.template(model));

            this.listenToOnce(App.Data.mainModel, 'loadCompleted', function() {
                loadSpinner(this.$('img.logo'));
            }, this);
            return this;
        },
        events: {
            "click .btnReturn": 'return_menu'
        },
        return_menu: function() {
            if (this.model.success) {
                this.model.trigger('onMenu');
            } else {
                this.model.trigger('onCheckout');
            }
        },
        getPickupTime: function() {
            var checkout = App.Data.myorder.checkout,
                time_array = checkout.get('pickupTime').split(',');
            return {
                pickup_time: time_array[0] + ', ',
                pickup_day: time_array.slice(1).join(', ')
            };
        }
    });

    return new (require('factory'))(function() {
        App.Views.MainView = {};
        App.Views.MainView.MainDoneView = App.Views.CoreMainView.CoreMainDoneView;
    });
});