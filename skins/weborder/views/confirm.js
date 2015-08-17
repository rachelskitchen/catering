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
        bindings: {
            '.pickup_time': 'attr:{title:tooltip(title, pickupTime)}',
            '.pickup-time-title': 'text:title',
            '.pickup-time': 'text:pickupTime'
        },
        computeds: {
            title: {
                deps: ['checkout_dining_option'],
                get: function(dining_option) {
                    var _lp = this.getBinding('$_lp').toJSON();
                    return (dining_option === 'DINING_OPTION_DELIVERY' || dining_option === 'DINING_OPTION_OTHER') ? _lp.CONFIRM_DELIVERY_TIME : _lp.CONFIRM_ARRIVAL_TIME;
                }
            },
            pickupTime: {
                deps: ['checkout_pickupTS', 'checkout_isPickupASAP', 'checkout_dining_option'],
                get: function(pickup, isASAP, dining_option) {
                    var _lp = this.getBinding('$_lp').toJSON(),
                        settings = this.getBinding('$_system_settings').toJSON(),
                        offset = dining_option === 'DINING_OPTION_DELIVERY' ? settings.estimated_delivery_time : settings.estimated_order_preparation_time,
                        currentTime = this.options.timetable.base(),
                        time = currentTime.getTime();

                    if (pickup) pickup = new Date(time > pickup ? time : pickup);

                    if (isASAP) {
                        return offset > 0 ?
                            _lp.CONFIRM_TODAY_ASAP + ' (' + offset + ' ' + _lp.CONFIRM_MINUTES + ')' :
                            _lp.CONFIRM_TODAY_ASAP;
                    } else {
                        return format_date_3(pickup);
                    }
                }
            }
        },
        bindingFilters: {
            tooltip: function(title, pickupTime) {
                return title + ': ' + pickupTime;
            }
        }
    });

    var ConfirmStanfordCardView = App.Views.CoreConfirmView.CoreConfirmStanfordCardView.extend({
        bindings: mixProto('bindings'),
        computeds: mixProto('computeds'),
        bindingFilters: mixProto('bindingFilters')
    });

    function mixProto(prop) {
        return _.extend({}, App.Views.CoreConfirmView.CoreConfirmStanfordCardView.prototype[prop], ConfirmPayCardView.prototype[prop]);
    }

    return new (require('factory'))(confirm_view.initViews.bind(confirm_view), function() {
        App.Views.ConfirmView.ConfirmPayCardView = ConfirmPayCardView;
        App.Views.ConfirmView.ConfirmStanfordCardView = ConfirmStanfordCardView;
    });
});
