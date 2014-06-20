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
                selected_dining_option: '' // It set when dining_option changed on DINING_OPTION_ONLINE. It uses for recovery user selection of Order Type
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
            this.set('dining_option', this.get('selected_dining_option') || 'DINING_OPTION_TOGO');
        },
        check: function() {
            var skin = App.Data.settings.get('skin'),
                err = [],
                dining_option = this.get('dining_option');

            if (this.get('pickupTS') === null && dining_option !== 'DINING_OPTION_DELIVERY_SEAT' && dining_option !== 'DINING_OPTION_ONLINE') {
                return {
                    status: 'ERROR',
                    errorMsg: MSG.ERROR_STORE_IS_CLOSED
                };
            }

            if (err.length) {
                return {
                    status: "ERROR_EMPTY_FIELDS",
                    errorMsg: MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')),
                    errorList: err
                };
            }

            return {
                status: "OK"
            };
        }
    });
});