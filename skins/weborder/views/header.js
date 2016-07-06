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

define(["backbone", "factory"], function() {
    'use strict';

    function onClick(eventName) {
        return function() {
            this.model.trigger(eventName);
        };
    }

    var HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        bindings: {
            '.menu': 'classes: {active: strictEqual(tab_index, 0)}',
            '.about': 'classes: {active: strictEqual(tab_index, 1)}',
            '.map': 'classes: {active: strictEqual(tab_index, 2)}',
            '.title': 'text: business_name',
            '.promotions-link': 'toggle: promotions_available'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            if (App.Data.settings.get('settings_system').delivery_for_online_orders) {
                var view = App.Views.GeneratorView.create('Header', {
                    el: this.$('.delivery_wrapper'),
                    mod: 'Delivery',
                    model: this.model
                });
                this.subViews.push(view);
            }
            loadSpinner(this.$('img.img'));
        },
        events: {
            'click .menu': onClick('onMenu'),
            'click .about': onClick('onAbout'),
            'click .map': onClick('onMap'),
            'click .promotions-link': onClick('onPromotions')
        }
    });

    var HeaderDeliveryView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'delivery',
        render: function() {
            var settings = App.Data.settings.get('settings_system'),
                initial_model = this.model.toJSON();

            $.extend(initial_model, {
                currency_symbol: settings.currency_symbol,
                min_delivery_amount: round_monetary_currency(settings.min_delivery_amount),
                delivery_post_code_lookup_enabled: _.isArray(settings.delivery_post_code_lookup) && settings.delivery_post_code_lookup[0],
                delivery_post_codes: _.isArray(settings.delivery_post_code_lookup) && settings.delivery_post_code_lookup[1],
                delivery_geojson_enabled: _.isArray(settings.delivery_geojson) && settings.delivery_geojson[0],
                max_delivery_distance: settings.max_delivery_distance,
                delivery_time: {
                    hour: Math.floor(settings.estimated_delivery_time / 60),
                    minutes: Math.ceil(settings.estimated_delivery_time % 60)
                },
                distance_mearsure: settings.distance_mearsure
            });

            this.model = initial_model;
            App.Views.FactoryView.prototype.render.apply(this, arguments);
        }
    });

    return new (require('factory'))(function() {
        App.Views.HeaderView = {};
        App.Views.HeaderView.HeaderMainView = HeaderMainView;
        App.Views.HeaderView.HeaderDeliveryView = HeaderDeliveryView;
    });
});
