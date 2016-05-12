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

define(["card_view"], function(card_view) {
    'use strict';

    var CardMainView = App.Views.CoreCardView.CoreCardMainView.extend({
    	bindings: {
    		'.checkbox-outer': 'classes: {hide: not(token_paymentsExist)}',
    		'.checkbox': "checkedSpan: {value: rememberCard, outer_elem: '.checkbox-outer'}"
    	}
    });

	return new (require('factory'))(card_view.initViews.bind(card_view), function() {
        App.Views.CardView.CardMainView = CardMainView;
    });
});