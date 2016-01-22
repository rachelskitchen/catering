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

define(["factory"], function(Backbone) {
    'use strict';

    App.Views.CoreProfileView = {};

    App.Views.CoreProfileView.CoreProfileSignUpView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'sign_up',
        bindings: {
            '.first-name': 'value: firstLetterToUpperCase(first_name), events:["input"], trackCaretPosition: first_name',
            '.last-name': 'value: firstLetterToUpperCase(last_name), events:["input"], trackCaretPosition: last_name',
            '.email': 'value: email, events:["input"]',
            '.password': 'value: password, events:["input"]',
            '.password-confirm': 'value: confirm_password, events:["input"]',
            '.passwords-mismatch': 'toggle: select(all(password, confirm_password), not(equal(password, confirm_password)), false)'
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
            '.name': 'text: format("$1 $2", first_name, last_name)',
            '.phone': 'value: phone, events: ["input"], restrictInput: "0123456789+", pattern: /^\\+?\\d{0,15}$/'
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

    return new (require('factory'))(function() {
        App.Views.ProfileView = {};
        App.Views.ProfileView.ProfileSignUpView = App.Views.CoreProfileView.CoreProfileSignUpView;
        App.Views.ProfileView.ProfileLogInView = App.Views.CoreProfileView.CoreProfileLogInView;
        App.Views.ProfileView.ProfileCreateView = App.Views.CoreProfileView.CoreProfileCreateView;
        App.Views.ProfileView.ProfileEditView = App.Views.CoreProfileView.CoreProfileEditView;
        App.Views.ProfileView.ProfileSettingsView = App.Views.CoreProfileView.CoreProfileSettingsView;
        App.Views.ProfileView.ProfilePWDResetView = App.Views.CoreProfileView.CoreProfilePWDResetView;
        App.Views.ProfileView.ProfileMenuView = App.Views.CoreProfileView.CoreProfileMenuView;
    });
});