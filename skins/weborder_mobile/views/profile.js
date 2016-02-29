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

    var ProfilePaymentSelectionView = App.Views.CoreProfileView.CoreProfilePaymentSelectionView.extend({
        className: 'payment-item font-size3 primary-bg primary-text'
    });

    var ProfilePaymentsSelectionView = App.Views.CoreProfileView.CoreProfilePaymentsSelectionView.extend({
        bindings: {
            ':el': 'toggle: equal(selected, "credit_card_button")'
        },
        itemView: ProfilePaymentSelectionView
    });

    var ProfilePaymentEditionView = App.Views.CoreProfileView.CoreProfilePaymentEditionView.extend({
        className: 'payment-item font-size3 primary-text list-subheader'
    });

    var ProfilePaymentsEditionView = App.Views.CoreProfileView.CoreProfilePaymentsEditionView.extend({
        bindings: {
            '.credit-cards': 'classes: {collapsed: ui_collapsed}',
            '.payments-list': 'toggle: not(ui_collapsed), collection: $collection'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({collapsed: true});
            }
        },
        itemView: ProfilePaymentEditionView,
        events: {
            'click .credit-cards': 'collapse'
        },
        collapse: function() {
            var $ui = this.getBinding('$ui');
            $ui.set('collapsed', !$ui.get('collapsed'));
        }
    });

    return new (require('factory'))(profile_view.initViews.bind(profile_view), function() {
        App.Views.ProfileView.ProfilePaymentsSelectionView = ProfilePaymentsSelectionView;
        App.Views.ProfileView.ProfilePaymentsEditionView = ProfilePaymentsEditionView;
    });
});