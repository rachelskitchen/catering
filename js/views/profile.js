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

define(["factory"], function() {
    'use strict';

    App.Views.CoreProfileView = {};

    App.Views.CoreProfileView.CoreProfileSignUpView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'sign_up',
        bindings: {
            '.first-name': 'value: firstLetterToUpperCase(first_name), events:["input"], trackCaretPosition: first_name',
            '.last-name': 'value: firstLetterToUpperCase(last_name), events:["input"], trackCaretPosition: last_name',
            '.email': 'value: email, events:["input"]',
            '.phone': 'value: phone, events: ["input"], restrictInput: "0123456789+", pattern: /^\\+?\\d{0,15}$/',
            '.password': 'value: password, events:["input"]',
            '.password-confirm': 'value: confirm_password, events:["input"]',
            '.passwords-mismatch': 'toggle: select(all(password, confirm_password), not(equal(password, confirm_password)), false)',
            '.signup-btn': 'classes: {disabled: any(not(first_name), not(last_name), not(email), not(phone), not(password), not(confirm_password), not(equal(password, confirm_password)))}'
        },
        events: {
            'click .signup-btn': 'signup'
        },
        signup: function() {
            typeof this.options.signupAction == 'function' && this.options.signupAction();
        }
    });

    App.Views.CoreProfileView.CoreProfileLogInView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'log_in',
        bindings: {
            '.email': 'value: email, events: ["input"]',
            '.pwd': 'value: password, events: ["input"]',
            '.login-btn': 'classes: {disabled: any(not(email), not(password))}'
        },
        events: {
            'click .login-btn': 'login',
            'click .create-btn': 'create',
            'click .guest-btn': 'guest'
        },
        login: function() {
            var showSpinner = typeof this.options.showSpinner == 'function' ? this.options.showSpinner : new Function(),
                hideSpinner = typeof this.options.hideSpinner == 'function' ? this.options.hideSpinner : new Function(),
                afterLogin = typeof this.options.afterLogin == 'function' ? this.options.afterLogin : new Function();
            showSpinner();
            this.model.login().done(afterLogin).always(hideSpinner);
        },
        create: function() {
            typeof this.options.createAccount == 'function' && this.options.createAccount();
        },
        guest: function() {
            typeof this.options.guestCb == 'function' && this.options.guestCb();
        }
    });

    App.Views.CoreProfileView.CoreProfileCreateView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'create',
        bindings: {
            '.name': 'text: format("$1 $2", first_name, last_name)'
        }
    });

    App.Views.CoreProfileView.CoreProfileMenuView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'menu',
        bindings: {
            ':el': 'classes: {shown: header_showProfileMenu}',
            '.login-link': 'toggle: not(access_token)',
            '.logout-link': 'toggle: access_token',
            '.logged-as': 'toggle: access_token, html: loggedAs(email)',
            '.private-btn': 'classes: {"primary-text": access_token, "regular-text": not(access_token), disabled: not(access_token)}'
        },
        bindingFilters: {
            loggedAs: function(username) {
                return _loc.PROFILE_LOGGED_IN.replace('%s', username);
            }
        },
        events: {
            'click .login-link': 'login',
            'click .logout-link': 'logout',
            'click .settings-link:not(.disabled)': 'settings',
            'click .payments-link:not(.disabled)': 'payments',
            'click .profile-link:not(.disabled)': 'profile',
            'click .close': 'close'
        },
        close: function() {
            this.options.header.set('showProfileMenu', false);
        },
        login: function() {
            typeof this.options.login_action == 'function' && this.options.login_action();
            this.close();
        },
        logout: function() {
            this.model.logout();
            this.close();
        },
        settings: function() {
            typeof this.options.settings_action == 'function' && this.options.settings_action();
            this.close();
        },
        payments: function() {
            typeof this.options.payments_action == 'function' && this.options.payments_action();
            this.close();
        },
        profile: function() {
            typeof this.options.profile_action == 'function' && this.options.profile_action();
            this.close();
        }
    });

    App.Views.CoreProfileView.CoreProfileEditView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'edit'
    });

    App.Views.CoreProfileView.CoreProfileSettingsView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'settings'
    });

    App.Views.CoreProfileView.CoreProfilePWDResetView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'reset'
    });

    App.Views.CoreProfileView.CoreProfilePanelView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'panel',
        initialize: function() {
            // as soon as user gets authorized/logged out/created need to hide panel
            this.listenTo(this.model, 'change:access_token onUserCreated', this.close.bind(this));
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            ':el': 'classes: {active: any(ui_showSignUp, ui_showLogIn, ui_showMenu)}',
            '.signup-link': 'toggle: not(access_token), classes: {"primary-text": not(ui_showSignUp), "regular-text": ui_showSignUp}',
            '.login-link': 'toggle: not(access_token), classes: {"primary-text": not(ui_showLogIn), "regular-text": ui_showLogIn}',
            '.close': 'toggle: any(ui_showSignUp, ui_showLogIn, ui_showMenu)',
            '.sign-up-box': 'toggle: ui_showSignUp',
            '.log-in-box': 'toggle: ui_showLogIn',
            '.menu-items': 'toggle: ui_showMenu',
            '.logged-as': 'text: first_name, toggle: access_token'
        },
        events: {
            'click .signup-link': 'showSignUp',
            'click .login-link': 'showLogIn',
            'click .close': 'close',
            'click .logged-as': 'showMenu'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({
                    showSignUp: false,
                    showLogIn: false,
                    showMenu: false
                });
            }
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            // LogIn view
            var loginView = App.Views.GeneratorView.create('Profile', _.extend({}, this.options, {
                el: this.$('.log-in-box'),
                mod: 'LogIn',
                model: this.model
            }));

            // SignUp view
            var signupView = App.Views.GeneratorView.create('Profile', _.extend({}, this.options, {
                el: this.$('.sign-up-box'),
                mod: 'SignUp',
                model: this.model
            }));

            // Menu view
            var menuView = App.Views.GeneratorView.create('Profile', _.extend({}, this.options, {
                el: this.$('.menu-items'),
                mod: 'Menu',
                header: new Backbone.Model({showProfileMenu: true})
            }));

            this.subViews.push(loginView, signupView, menuView);

            return this;
        },
        showSignUp: function() {
            this.getBinding('$ui').set({
                showSignUp: true,
                showLogIn: false,
                showMenu: false
            });
        },
        showLogIn: function() {
            this.getBinding('$ui').set({
                showSignUp: false,
                showLogIn: true,
                showMenu: false
            });
        },
        close: function() {
            this.getBinding('$ui').set({
                showSignUp: false,
                showLogIn: false,
                showMenu: false
            });
        },
        showMenu: function() {
            this.getBinding('$ui').set({
                showSignUp: false,
                showLogIn: false,
                showMenu: true
            });
        }
    });

    return new (require('factory'))(function() {
        App.Views.ProfileView = {};
        App.Views.ProfileView.ProfileSignUpView = App.Views.CoreProfileView.CoreProfileSignUpView;
        App.Views.ProfileView.ProfileLogInView = App.Views.CoreProfileView.CoreProfileLogInView;
        App.Views.ProfileView.ProfileCreateView = App.Views.CoreProfileView.CoreProfileCreateView;
        App.Views.ProfileView.ProfileEditView = App.Views.CoreProfileView.CoreProfileEditView;
        App.Views.ProfileView.ProfileSettingsView = App.Views.CoreProfileView.CoreProfileSettingsView;
        App.Views.ProfileView.ProfilePWDResetView = App.Views.CoreProfileView.CoreProfilePWDResetView;
        App.Views.ProfileView.ProfileMenuView = App.Views.CoreProfileView.CoreProfileMenuView;
        App.Views.ProfileView.ProfilePanelView = App.Views.CoreProfileView.CoreProfilePanelView;
    });
});