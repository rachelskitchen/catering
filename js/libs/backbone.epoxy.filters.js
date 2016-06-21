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

    Backbone.Epoxy.binding.addFilter('stringLength', function(value) {
        try {
            return value.toString().length;
        } catch(e) {
            return 0;
        }
    });

    Backbone.Epoxy.binding.addFilter('scalesFormat', function(value) {
        var decimal = Number(_.isObject(App.Settings.scales) && App.Settings.scales.number_of_digits_to_right_of_decimal);
        typeof value != 'number' && (value = Number(value));
        return value.toFixed(decimal);
    });

    Backbone.Epoxy.binding.addFilter('firstLetterToUpperCase', function(value) {
        if (!value) value = '';
        return value.toString().replace(/(^\w)|\s(\w)/g, function(m, g1, g2){
            return g1 ? g1.toUpperCase() : ' ' + g2.toUpperCase();
        });
    });

    Backbone.Epoxy.binding.addFilter('inList', function(value) {
        var values = Array.prototype.slice.call(arguments, 1);
        return values.indexOf(value) > -1;
    });

    Backbone.Epoxy.binding.addFilter('phoneFormat', function(phone) {
        if(phone.length < 10) {
            return phone;
        }
        var matches = phone.match(/^(\+?\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
        if(matches !== null) {
            return matches.slice(1).join('.');
        } else {
            return phone;
        }
    });
});