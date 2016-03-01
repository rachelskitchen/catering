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

define(['factory'], function() {
    'use strict';

    var PromotionsTopLineView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'TopLine',
        tagName: 'div',
        events: {
            'click': 'goToPromotionsList'
        },
        goToPromotionsList: function() {
            App.Data.router.navigate('promotions', true);
        }
    });

    var PromotionsItemView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'item',
        tagName: 'div',
        className: 'promotion-details',
        bindings: {
            '.promotion-details__title-text': 'text: discountTitle',
            '.promotion-details__discount-code': 'text: discountCode'
        }
    });

    return new (require('factory'))(function() {
    //return new (require('factory'))(modifiers_view.initViews.bind(modifiers_view), function() {
        App.Views.PromotionsView = {};
        App.Views.PromotionsView.PromotionsItemView = PromotionsItemView;
        App.Views.PromotionsView.PromotionsTopLineView = PromotionsTopLineView;
    });
});
