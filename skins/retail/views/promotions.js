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

define(["promotions_view"], function(promotions_view) {
    'use strict';

    var PromotionsListItemView = App.Views.CorePromotionsView.CorePromotionsListItemView.extend({
    	seeInfo: function() {
    		App.Data.errors.alert('', false, false, {
                typeIcon: '',
                customClass: 'promotions-item-popup',
                customView: new App.Views.GeneratorView.create('Promotions', {
                	mod: 'Item',
                	model: this.model
                })
    		});
    	}
    });

    var PromotionsListView = App.Views.CorePromotionsView.CorePromotionsListView.extend({
    	itemView: PromotionsListItemView
    });

    return new (require('factory'))(promotions_view.initViews.bind(promotions_view), function() {
        App.Views.PromotionsView.PromotionsListView = PromotionsListView;
        App.Views.PromotionsView.PromotionsListItemView = PromotionsListItemView;
    });
});
