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

define(["profile_view"], function(profile_view) {
    'use strict';

    var computedsSelection = {
        deps: ['$collection'],
        get: function(collection) {
            var selected = collection.findWhere({selected: true});
            return selected ? selected.id : -1;
        },
        set: function(value) {
            var model = this.collection.get(value),
                selected = this.collection.findWhere({selected: true});
            if (model) {
                model.set('selected', true);
                this.model.set('selected', true);
            } else if (selected) {
                selected.set('selected', false);
                this.model.set('selected', false);
            } else {
                this.model.set('selected', false);
            }
        }
    };

    var ProfilePaymentsSelectionView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'payments_selection',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.payments-list': 'value: selection, options: options'
        },
        computeds: {
            options: {
                deps: ['$collection', '_lp_CHECKOUT_ENTER_NEW_CARD'],
                get: function(collection, label_new_card) {
                    var data = collection.map(function(model) {
                        return {
                            label: creditCardType(model.get('card_type')) + ' - ****' + model.get('last_digits'),
                            value: model.id
                        }
                    });
                    data.push({
                        label: label_new_card,
                        value: -1
                    });
                    return data;
                }
            },
            selection: computedsSelection
        }
    });

    var ProfileGiftCardsSelectionView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'gift_cards_selection',
        bindings: {
            '.gift-cards-list': 'value: selection, options: options'
        },
        computeds: {
            options: {
                deps: ['$collection', '_lp_CHECKOUT_ENTER_NEW_CARD', '_lp_BALANCE', '_system_settings_currency_symbol'],
                get: function(collection, label_new_card, label_balance, currency) {
                    var data = [];
                    collection.each(function(model) {
                        model = model.toJSON();
                        model.remainingBalance > 0 && data.push({
                            label: model.cardNumber + ' - ' + label_balance + ': ' + currency + round_monetary_currency(model.remainingBalance),
                            value: model.cardNumber
                        });
                    });
                    data.push({
                        label: label_new_card,
                        value: -1
                    });
                    return data;
                }
            },
            selection: computedsSelection
        }
    });

    function creditCardType(card_type) {
        var code = _.invert(ACCEPTABLE_CREDIT_CARD_TYPES)[card_type];
        return _loc.CREDIT_CARD_TYPES[code];
    }

    return new (require('factory'))(profile_view.initViews.bind(profile_view), function() {
        App.Views.ProfileView.ProfilePaymentsSelectionView = ProfilePaymentsSelectionView;
        App.Views.ProfileView.ProfileGiftCardsSelectionView = ProfileGiftCardsSelectionView;
    });
});