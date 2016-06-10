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
            '.promotions__item': 'classes: {disabled: not(is_applicable)}',
            '.promotions__item-name': 'text: name',
            '.promotions__item-description': 'toggle: not(is_applicable)',
            '.promotions__item-apply': 'text: select(applied, _loc.PROMOTION_APPLIED, _loc.PROMOTION_APPLY), classes: {"promotions__item-applied": applied, "primary-text": not(applied), "special-text": applied}',
        },
        events: {
            'click .promotions__item-link': 'seeInfo',
            'click .promotions__item:not(.disabled) .promotions__item-apply': 'apply'
        },
        computeds: {
            applied: {
                deps: ['is_applicable', 'is_applied'],
                get: function(is_applicable, is_applied) {
                    return is_applicable && is_applied;
                }
            }
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
            this.listenTo(this.collection, 'promotionsLoaded', this.updateBindings);
            this.bindingSources = _.extend({}, this.bindingSources, {
                _available: new Backbone.Collection(),
                _other: new Backbone.Collection()
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.updateBindings();
        },
        bindings: {
            '.promotions__other': 'toggle: length($_other)',
            '.promotions__available-text': 'toggle: not(length($_available))',
            '.promotions__available-list': 'collection: $_available',
            '.promotions__other-list': 'collection: $_other'
        },
        updateBindings: function() {
            this.getBinding('$_available').reset(this.collection.where({'is_applicable': true}));
            this.getBinding('$_other').reset(this.collection.where({'is_applicable': false}));
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
