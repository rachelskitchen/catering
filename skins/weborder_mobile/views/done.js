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
    'use strict';

    App.Views.DoneView = {};

    App.Views.DoneView.DoneMainView = App.Views.FactoryView.extend({
        name: 'done',
        mod: 'main',
        render: function() {
            var model = this.model.toJSON(),
                pickup_time = model.pickup_time.split(',');
            model.type = 'Pickup Time';

            if (model.dining_option === 'DINING_OPTION_DELIVERY' || model.dining_option === 'DINING_OPTION_DELIVERY_SEAT') {
                model.type = 'Delivery Time';
            }
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            model.pickup_time = pickup_time[0] + ', ';
            model.pickup_day = pickup_time.slice(1).join(', ');
            model.reward_points = model.reward_points || '';
            model.isOnlyGift = model.dining_option === 'DINING_OPTION_ONLINE';

            this.$el.html(this.template(model));
            return this;
        }
    });

    App.Views.DoneView.DoneErrorView = App.Views.FactoryView.extend({
        name: 'done',
        mod: 'error'
    });
});