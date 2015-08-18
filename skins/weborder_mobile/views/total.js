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

define(["total_view"], function(total_view) {
    'use strict';

    var TotalCartView = App.Views.FactoryView.extend({
        name: 'total',
        mod: 'cart',
        bindings: {
            '.btn': 'text: format("$1: $2 - $3", _lp_TOTAL_SUBTOTAL, currencyFormat(subtotal), _lp_CHECKOUT)'
        },
        events: {
            'click .btn': 'onCheckout'
        },
        onCheckout: function() {
            App.Data.router.navigate('checkout', true);
        }
    });

    return new (require('factory'))(total_view.initViews.bind(total_view), function() {
        App.Views.TotalView.TotalCartView = TotalCartView;
    });
});

