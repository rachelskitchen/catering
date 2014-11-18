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
        mod: 'profile_address',
        fillValues: function() {
            var model = this.model;
            model.country && this.$('.country').val(model.country);
        }
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
        events: {
            'change .checkbox': 'changeCheckbox'
        },
        initialize: function() {
            this.RevelAPI = this.model;
            this.model = this.model.get('card');
            this.listenTo(this.RevelAPI, 'change:useAsDefaultCard', this.updateCheckbox, this);
            this.listenTo(this.RevelAPI, 'change:forceCreditCard', this.forceCreditCard, this);
            return App.Views.CoreCardView.CoreCardMainView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.CoreCardView.CoreCardMainView.prototype.render.apply(this, arguments);
            this.updateCheckbox();
            this.forceCreditCard();
            return this;
        },
        changeCheckbox: function() {
            this.RevelAPI.set('useAsDefaultCard', this.$(':checkbox').prop('checked'));
        },
        updateCheckbox: function() {
            var value = this.RevelAPI.get('useAsDefaultCard'),
                inputs = this.$('.input');
            this.$(':checkbox').prop('checked', value);
            if(value) {
                inputs.addClass('required');
            } else {
                inputs.removeClass('required');
            }
        },
        forceCreditCard: function () {
            var checkbox = this.$(':checkbox'),
                value = this.RevelAPI.get('forceCreditCard');
            if(value) {
                checkbox.prop('disabled', true);
                checkbox.parent().addClass('disabled');
            } else {
                checkbox.prop('disabled', false);
                checkbox.parent().removeClass('disabled');
            }
        }
    });

    App.Views.CoreRevelView.CoreRevelProfileSecurityView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'profile_security',
        initialize: function() {
            this.listenTo(this.model, 'onAuthenticationCancel onProfileCancel onProfileSaved', this.render, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
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

    App.Views.CoreRevelView.CoreRevelCreditCardView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'credit_card',
        events: {
            'click .ok': 'ok',
            'click .cancel': 'cancel'
        },
        ok: function() {
            this.model.trigger('onUseSavedCreditCard');
        },
        cancel: function() {
            this.model.trigger('onPayWithCustomCreditCard');
        }
    });

    App.Views.CoreRevelView.CoreRevelAuthenticationView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'authentication',
        initialize: function() {
            this.listenTo(this.model, 'onAuthenticationCancel onAuthenticated', this.resetPassword, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        events: {
            'click .ok': 'authenticate',
            'click .cancel': 'cancel'
        },
        authenticate: function() {
            var email = this.$('.email').val(),
                pwd = this.$('.password').val();

            this.model.authenticate(email, pwd);
        },
        cancel: function() {
            this.model.trigger('onAuthenticationCancel');
        },
        resetPassword: function() {
            this.$('.password').val('');
        }
    });

    App.Views.CoreRevelView.CoreRevelLoyaltyView = App.Views.FactoryView.extend({
        name: 'revel',
        mod: 'loyalty',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            var qrCode = this.$('.qr-code');
            qrCode.attr('src', this.model.getQRCode());
            loadSpinner(qrCode);
            return this;
        }
    });

    App.Views.CoreRevelView.CoreRevelProfileFooterView = App.Views.FactoryView.extend({
        name: 'footer',
        mod: 'profile',
        initialize: function() {
            this.listenTo(this.model, 'change:next change:prev change:save', this.update, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.update();
            return this;
        },
        events: {
            "click .next": "next",
            "click .prev": "prev",
            "click .save": "save"
        },
        next: setCallback('next'),
        prev: setCallback('prev'),
        save: setCallback('save'),
        update: function() {
            var model = this.model;
            update(model.get('prev'), this.$('.prev'));
            update(model.get('next'), this.$('.next'));
            update(model.get('save'), this.$('.save'));

            function update(data, el) {
                if(data) {
                    el.show();
                } else {
                    el.hide();
                }
            }
        }
    });

    function setCallback(prop) {
        return function() {
            var tab = this.model.get(prop);
            typeof tab == 'function' && tab();
        };
    }

    App.Views.RevelView = {};
    App.Views.RevelView.RevelWelcomeView = App.Views.CoreRevelView.CoreRevelWelcomeView;
    App.Views.RevelView.RevelProfilePersonalView = App.Views.CoreRevelView.CoreRevelProfilePersonalView;
    App.Views.RevelView.RevelProfilePaymentView = App.Views.CoreRevelView.CoreRevelProfilePaymentView;
    App.Views.RevelView.RevelProfileSecurityView = App.Views.CoreRevelView.CoreRevelProfileSecurityView;
    App.Views.RevelView.RevelProfileAddressView = App.Views.CoreRevelView.CoreRevelProfileAddressView;
    App.Views.RevelView.RevelProfileNotificationView = App.Views.CoreRevelView.CoreRevelProfileNotificationView;
    App.Views.RevelView.RevelLoyaltyView = App.Views.CoreRevelView.CoreRevelLoyaltyView;
    App.Views.RevelView.RevelAuthenticationView = App.Views.CoreRevelView.CoreRevelAuthenticationView;
    App.Views.RevelView.RevelProfileFooterView = App.Views.CoreRevelView.CoreRevelProfileFooterView;
    App.Views.RevelView.RevelCreditCardView = App.Views.CoreRevelView.CoreRevelCreditCardView;
});