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

define(["confirm_view"], function(confirm_view) {
    'use strict';

    var ConfirmPayCardView = App.Views.CoreConfirmView.CoreConfirmPayCardView.extend({
        render: function() {
            var locale = App.Data.locale,
                new_model = {}, offset,
                pickup = this.collection.checkout.get("pickupTS"),
                currentTime = this.options.timetable.base(),
                time = currentTime.getTime(),
                isASAP = this.collection.checkout.get("isPickupASAP");

            new_model.isDelivery = this.collection.checkout.get("dining_option") === 'DINING_OPTION_DELIVERY';

            if (pickup) pickup = new Date(time > pickup ? time : pickup);

            if (isASAP) {
                if (new_model.isDelivery) {
                   offset = App.Settings.estimated_delivery_time;
                } else {
                   offset = App.Settings.estimated_order_preparation_time;
                }
                new_model.pickup_time = offset > 0 ?
                    locale.get('CONFIRM_TODAY_ASAP') + ' (' + offset + ' ' + locale.get('CONFIRM_MINUTES') + ')' :
                    locale.get('CONFIRM_TODAY_ASAP');
            } else {
                new_model.pickup_time = format_date_3(pickup);
            }

            this.$el.html(this.template(new_model));

            this.afterRender();

            return this;
        }
    });

    return new (require('factory'))(confirm_view.initViews.bind(confirm_view), function() {
        App.Views.ConfirmView.ConfirmPayCardView = ConfirmPayCardView;
    });
});
