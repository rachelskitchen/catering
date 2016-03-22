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

    App.Views.CorePromotionsView = {};
    App.Views.CorePromotionsView.CorePromotionsTopLineView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'TopLine',
        events: {
            'click': 'goToPromotionsList'
        },
        goToPromotionsList: function() {
            App.Data.router.navigate('promotions', true);
        }
    });

    App.Views.CorePromotionsView.CorePromotionsListItemView = App.Views.ItemView.extend({
        name: 'promotions',
        mod: 'ListItem',
        tagName: 'li',
        bindings: {
            '.promotion': 'classes: {disabled: not(is_applicable)}',
            '.promotion__name': 'text: name',
            '.promotion__description': 'toggle: not(is_applicable)',
            '.promotion__apply': 'text: select(is_applied, _loc.PROMOTION_APPLIED, _loc.PROMOTION_APPLY), classes: {added: is_applied}',
        },
        events: {
            'click .promotion__link': 'seeInfo',
            'click .promotion:not(.disabled) .promotion__apply': 'apply'
        },
        /**
         * Marks the selected promotion as applied.
         */
        apply: function(e) {
            e.stopPropagation();
            this.model.set('is_applied', !this.model.get('is_applied'));
        },
        /**
         * Navigates to Promotion Details screen.
         */
        seeInfo: function() {
            App.Data.router.navigate('promotion/' + this.model.get('id'), true);
        }
    });

    App.Views.CorePromotionsView.CorePromotionsListView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'list',
        itemView: App.Views.CorePromotionsView.CorePromotionsListItemView,
        initialize: function() {
            var promotions = this.model.get('promotions');
            this.listenTo(promotions, 'promotionsLoaded', this.updateBindings);
            this.bindingSources = _.extend({}, this.bindingSources, {
                _available: new Backbone.Collection(),
                _other: new Backbone.Collection()
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.updateBindings();
        },
        bindings: {
            '.promotions-other': 'toggle: length($_other)',
            '.promotions-available__text': 'toggle: not(length($_available))',
            '.promotions-available__list': 'collection: $_available',
            '.promotions-other__list': 'collection: $_other'
        },
        updateBindings: function() {
            var promotions = this.model.get('promotions');
            this.getBinding('$_available').reset(promotions.where({'is_applicable': true}));
            this.getBinding('$_other').reset(promotions.where({'is_applicable': false}));
        }
    });

    App.Views.CorePromotionsView.CorePromotionsItemView = App.Views.FactoryView.extend({
        name: 'promotions',
        mod: 'item',
        bindings: {
            '.promotion-details__title-text': 'text: name',
            '.promotion-details__discount-code': 'text: code',
            '.promotion-details__barcode-img': 'loadSpinner: setBarcodeURL(_settings_host, code)',
        },
        bindingFilters: {
            setBarcodeURL: function(host, code) {
                return code ? addHost('/weborders/barcode/' + code, host) : '';
            }
        }
    });

    return new (require('factory'))(function() {
        App.Views.PromotionsView = {};
        App.Views.PromotionsView.PromotionsListView = App.Views.CorePromotionsView.CorePromotionsListView;
        App.Views.PromotionsView.PromotionsListItemView = App.Views.CorePromotionsView.CorePromotionsListItemView;
        App.Views.PromotionsView.PromotionsItemView = App.Views.CorePromotionsView.CorePromotionsItemView;
        App.Views.PromotionsView.PromotionsTopLineView = App.Views.CorePromotionsView.CorePromotionsTopLineView;
    });
});
