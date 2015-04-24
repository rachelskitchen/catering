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

define(["backbone"], function(Backbone) {
    'use strict';

    App.Models.Checkout = Backbone.Model.extend({
        defaults: function() {
            return {
                img: App.Data.settings.get("img_path"),
                pickupTime: '',
                pickupTS: null,
                isPickupASAP: false,
                special: '',
                section: "",
                row: "",
                seat: "",
                level: "",
                email: "", //TBD: probably remove this field. Customer.email is used now.
                rewardCard: '',
                dining_option: '',
                selected_dining_option: '', // It set when dining_option has changed on DINING_OPTION_ONLINE. It is used for recovery user selection of Order Type
                notes: '',
                sections: [],
                levels: [],
                discount_code: '',
                last_discount_code: ''
            };
        },
        initialize: function() {
            // if dining_option changed on DINING_OPTION_ONLINE previous value should be
            this.listenTo(this, 'change:dining_option', function(model, value) {
                var prev = model.previousAttributes().dining_option;
                // condifion prev != value is needed to handle cases of forced change:dining_option emissions
                if(value === 'DINING_OPTION_ONLINE' && prev !== value) {
                    this.set('selected_dining_option', prev);
                }
            }, this);
            // fill sections and levels
            var order_from_seat = App.Data.settings.get('settings_system').order_from_seat,
                levels = Array.isArray(order_from_seat) ? order_from_seat[4] : '',
                sections = Array.isArray(order_from_seat) ? order_from_seat[5] : '';

            if(typeof levels == 'string' && levels.length > 0)
                this.set('levels', levels.split(','));

            if(typeof sections == 'string' && sections.length > 0)
                this.set('sections', sections.split(','));
        },
        /**
         * Save current state model in storage (detected automatic).
         */
        saveCheckout : function() {
            setData('checkout',this);
        },
        /**
         * Load state model from storage (detected automatic).
         */
        loadCheckout : function() {
            var data = getData('checkout');
            data = data instanceof Object ? data : {};
            delete data.img;
            this.set(data);
            this.trigger("change:dining_option", this, this.get("dining_option"));
        },
        /**
         * revert dining option to previous value (return from only gift situation)
         */
        revert_dining_option: function() {
            this.set('dining_option', this.get('selected_dining_option') || App.Settings.default_dining_option);
        },
        check: function() {
            var isStoreClosed = this.isStoreClosed(),
                orderFromSeat = this.checkOrderFromSeat();

            if(isStoreClosed)
                return isStoreClosed;

            if(orderFromSeat)
                return orderFromSeat;

            return {
                status: "OK"
            };
        },
        isStoreClosed: function() {
            var dining_option = this.get('dining_option');
            if(App.skin == App.Skins.RETAIL)
                return false;
            if(this.get('pickupTS') === null && dining_option !== 'DINING_OPTION_DELIVERY_SEAT' && dining_option !== 'DINING_OPTION_ONLINE') {
                return {
                    status: 'ERROR',
                    errorMsg: MSG.ERROR_STORE_IS_CLOSED
                };
            }
        },
        checkOrderFromSeat: function() {
            var orderFromSeat = App.Data.orderFromSeat,
                dining_option = this.get('dining_option'),
                err = [];

            if(orderFromSeat instanceof Object && dining_option === 'DINING_OPTION_DELIVERY_SEAT') {
                orderFromSeat.enable_level && !this.get('level') && err.push('Level');
                orderFromSeat.enable_sector && !this.get('section') && err.push('Section');
                orderFromSeat.enable_row && !this.get('row') && err.push('Row');
                !this.get('seat') && err.push('Seat');
            }

            if(err.length) {
                return {
                    status: "ERROR_EMPTY_FIELDS",
                    errorMsg: MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')),
                    errorList: err
                };
            }
        },
        isColdUntaxable: function() {
            var delivery_cold_untaxed = App.Settings.delivery_cold_untaxed,
                dining_option = this.get('dining_option'),
                isToGo = dining_option === 'DINING_OPTION_TOGO',
                isDelivery = dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_SHIPPING',
                isCatering = dining_option === 'DINING_OPTION_CATERING';

            return isToGo || isCatering || isDelivery && delivery_cold_untaxed;
        },
        isBagChargeAvailable: function() {
            var dining_option = this.get('dining_option');
            return dining_option != 'DINING_OPTION_EATIN' && dining_option != 'DINING_OPTION_ONLINE';
        }
    });
});
