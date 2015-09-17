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

define(['backbone', 'backbone_epoxy'], function(Backbone) {
    'use strict';

    Backbone.Epoxy.binding.addFilter('currencyFormat', function(value) {
        return App.Settings.currency_symbol + round_monetary_currency(value);
    });

    Backbone.Epoxy.binding.addFilter('equal', function(pattern, value) {
        return pattern == value;
    });

    Backbone.Epoxy.binding.addFilter('strictEqual', function(pattern, value) {
        return pattern === value;
    });

    Backbone.Epoxy.binding.addFilter('weightPriceFormat', function(weight, price) {
        var currency_symbol = App.Settings.currency_symbol,
            scales = App.Settings.scales,
            uom = _.isObject(scales) ? scales.default_weighing_unit : '',
            line = weight +' @ ' + currency_symbol + round_monetary_currency(price);
        if(uom) {
            line += '/' + uom;
        }
        return line;
    });

    Backbone.Epoxy.binding.addFilter('weightFormat', function(price) {
        var currency_symbol = App.Settings.currency_symbol,
            scales = App.Settings.scales,
            uom = _.isObject(scales) ? scales.default_weighing_unit : '',
            line = currency_symbol + round_monetary_currency(price);
        if(uom) {
            line += '/' + uom;
        }
        return line;
    });

    Backbone.Epoxy.binding.addFilter('monetaryFormat', function(price) {
        return round_monetary_currency(price);
    });

});