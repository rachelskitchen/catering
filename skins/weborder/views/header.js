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
            '.promotions-link': 'toggle: promotions_available',
            '.address-line1': 'text: line1',
            '.address-line2': 'text: line2',
            '.open-now': 'text: select(openNow, _lp_STORE_INFO_OPEN_NOW, _lp_STORE_INFO_CLOSED_NOW)'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            loadSpinner(this.$('img.img'));
        },
        events: {
            'click .menu': onClick('onMenu'),
            'click .about': onClick('onAbout'),
            'click .map': onClick('onMap'),
            'click .promotions-link': onClick('onPromotions')
        },
        computeds: {
            openNow: function() {
                return App.Data.timetables.openNow();
            },
            line1: {
                deps: ['_system_settings_address'],
                get: function(address) {
                    var line1 = address.line_1,
                        line2 = address.line_2;
                    return line2 ? line1 + ', ' + line2 : line1;
                }
            },
            line2: {
                deps: ['_system_settings_address'],
                get: function(address) {
                    var address_line = address.city + ', ';
                        address_line += address.getRegion() ? address.getRegion() + ' ' : '';
                        address_line += address.postal_code;

                    return address_line;
                }
            }
        }
    });

    return new (require('factory'))(function() {
        App.Views.HeaderView = {};
        App.Views.HeaderView.HeaderMainView = HeaderMainView;
    });
});
