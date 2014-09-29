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

define(["backbone", "confirm_view"], function(Backbone) {
    'use strict';

    App.Views.ConfirmView.ConfirmPayCardView = App.Views.CoreConfirmView.CoreConfirmPayCardView.extend({
        render: function() {
            var new_model = {},//this.collection.toJSON(),
                pickup = this.collection.checkout.get("pickupTS"),
                currentTime = this.options.timetable.base(),
                time = currentTime.getTime();

            new_model.isDelivery = this.collection.checkout.get("dining_option") === 'DINING_OPTION_DELIVERY';

            if (pickup) pickup = new Date(time > pickup ? time : pickup);
            new_model.pickup_time = format_date_3(pickup);

            this.$el.html(this.template(new_model));

             //remove the background from popup
            $('#popup').removeClass("popup-background");

            this.afterRender();

            return this;
        }
    });
});
