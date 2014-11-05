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

define(["backbone", "factory", "checkout_view", "card_view"], function(Backbone) {
    'use strict';

    App.Views.CoreRevelView = {};

    App.Views.CoreRevelView.CoreRevelWelcomeView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'welcome',
        events: {
            'click .btn': 'clickOnBtn'
        },
        clickOnBtn: function() {
            this.model.trigger('onWelcomeReviewed');
        }
    });

    App.Views.CoreRevelView.CoreRevelProfileAddressView = App.Views.AddressView.extend({
        name: 'revel',
        mod: 'profile_address'
    });

    App.Views.CoreRevelView.CoreRevelProfilePersonalView = App.Views.CoreCheckoutView.CoreCheckoutMainView.extend({
        name: 'revel',
        mod: 'profile_personal',
        initialize: function() {
            this.customer = this.model.get('customer');
            this.card = this.model.get('card');
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.controlAddress();
        },
        controlAddress: function() {
            var address = new App.Views.RevelView.RevelProfileAddressView({
                customer: this.customer
            });
            this.subViews.push(address);
            this.$('.address').append(address.el);
        }
    });

    App.Views.CoreRevelView.CoreRevelProfilePaymentView = App.Views.CoreCardView.CoreCardMainView.extend({
        name: 'revel',
        mod: 'profile_payment'
    });

    App.Views.CoreRevelView.CoreRevelProfileSecurityView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'profile_security'
    });

    App.Views.CoreRevelView.CoreRevelProfileNotificationView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'profile_notification',
        events: {
            'click .ok': 'ok',
            'click .cancel': 'cancel'
        },
        ok: function() {
            this.model.trigger('onProfileCreateAccepted');
        },
        cancel: function() {
            this.model.trigger('onProfileCreateDeclined');
        }
    });

    App.Views.CoreRevelView.CoreRevelLoyaltyView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'loyalty'
    });

    App.Views.RevelView = {};
    App.Views.RevelView.RevelWelcomeView = App.Views.CoreRevelView.CoreRevelWelcomeView;
    App.Views.RevelView.RevelProfilePersonalView = App.Views.CoreRevelView.CoreRevelProfilePersonalView;
    App.Views.RevelView.RevelProfilePaymentView = App.Views.CoreRevelView.CoreRevelProfilePaymentView;
    App.Views.RevelView.RevelProfileSecurityView = App.Views.CoreRevelView.CoreRevelProfileSecurityView;
    App.Views.RevelView.RevelProfileAddressView = App.Views.CoreRevelView.CoreRevelProfileAddressView;
    App.Views.RevelView.RevelProfileNotificationView = App.Views.CoreRevelView.CoreRevelProfileNotificationView;
    App.Views.RevelView.RevelLoyaltyView = App.Views.CoreRevelView.CoreRevelLoyaltyView;
});