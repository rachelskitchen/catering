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
        mod: 'profile_payment',
        initialize: function() {
            this.model = this.model.get('card');
            return App.Views.CoreCardView.CoreCardMainView.prototype.initialize.apply(this, arguments);
        }
    });

    App.Views.CoreRevelView.CoreRevelProfileSecurityView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'profile_security',
        events: {
            'blur .password': 'setPassword',
            'change .checkbox': 'changeCheckbox'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            if(!this.model.get('profileExists')) {
                this.$(':checkbox').prop({
                    checked: true,
                    disabled: true
                });
            }
            this.changeCheckbox();
            return this;
        },
        changeCheckbox: function() {
            var isChecked = this.$(':checkbox').prop('checked'),
                password = this.$('.password'),
                self = this;
            if(isChecked) {
                password.prop('disabled', false);
                password.parent().removeClass('disabled');
            } else {
                password.val('').prop('disabled', true);
                password.parent().addClass('disabled');
            }
            password.each(function() {
                self.setPassword({target: this});
            });
        },
        setPassword: function(e) {
            var el = e.target,
                prop = el.dataset.prop,
                value = el.value;
            this.model.set(prop, value);
        }
    });

    App.Views.CoreRevelView.CoreRevelProfileNotificationView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'profile_notification',
        events: {
            'click .ok': 'ok',
            'click .cancel': 'cancel'
        },
        ok: function() {
            this.model.trigger('onProfileShow');
        },
        cancel: function() {
            this.model.trigger('onProfileCancel');
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