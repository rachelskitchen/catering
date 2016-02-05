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

    function setCallback(action) {
        return function() {
            var cb = this.options[action];
            typeof cb == 'function' && cb();
        };
    }

    App.Views.CoreProfileView = {};

    App.Views.CoreProfileView.CoreProfileBasicDetailsView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'basic_details',
        bindings: {
            '.first-name': 'value: firstLetterToUpperCase(first_name), events:["input"], trackCaretPosition: first_name',
            '.last-name': 'value: firstLetterToUpperCase(last_name), events:["input"], trackCaretPosition: last_name',
            '.email': 'value: email, events:["input"]',
            '.phone': 'value: phone, events: ["input"], restrictInput: "0123456789+", pattern: /^\\+?\\d{0,15}$/'
        }
    });

    App.Views.CoreProfileView.CoreProfileSignUpView = App.Views.CoreProfileView.CoreProfileBasicDetailsView.extend({
        name: 'profile',
        mod: 'sign_up',
        bindings: {
            '.password': 'value: password, events:["input"]',
            '.password-confirm': 'value: confirm_password, events:["input"]',
            '.passwords-mismatch': 'toggle: select(all(password, confirm_password), not(equal(password, confirm_password)), false)',
            '.signup-btn': 'classes: {disabled: any(not(first_name), not(last_name), not(email), not(phone), not(password), not(confirm_password), not(equal(password, confirm_password)))}'
        },
        events: {
            'click .signup-btn:not(.disabled)': setCallback('signupAction')
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
            'click .login-btn:not(.disabled)': setCallback('loginAction'),
            'click .create-btn': setCallback('createAccount'),
            'click .guest-btn': setCallback('guestCb')
        }
    });

    App.Views.CoreProfileView.CoreProfileCreateView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'create',
        bindings: {
            '.name': 'text: format("$1 $2", first_name, last_name)'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            this.subViews.push(App.Views.GeneratorView.create('Profile', {
                el: this.$('.address-box'),
                mod: 'Address',
                model: this.options.address
            }));

            return this;
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
            'click .login-link': setCallback('login_link'),
            'click .logout-link': setCallback('logout_link'),
            'click .settings-link:not(.disabled)': setCallback('settings_link'),
            'click .payments-link:not(.disabled)': setCallback('payments_link'),
            'click .profile-link:not(.disabled)': setCallback('profile_link'),
            'click .close': setCallback('close_link')
        }
    });

    App.Views.CoreProfileView.CoreProfileAddressView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'address',
        bindings: {
            '.country': 'value: country, options: parseOptions(_lp_COUNTRIES)',
            '.state-row': 'toggle: equal(country, "US")',
            '.state': 'value: state, options: parseOptions(_lp_STATES)',
            '.street_1': 'value: firstLetterToUpperCase(street_1), events: ["input"], trackCaretPosition: street_1',
            '.street_2': 'value: firstLetterToUpperCase(street_2), events: ["input"], trackCaretPosition: street_2',
            '.city': 'value: firstLetterToUpperCase(city), events: ["input"], trackCaretPosition: city',
            '.province-row': 'toggle: equal(country, "CA")',
            '.province': 'value: firstLetterToUpperCase(province), events: ["input"], trackCaretPosition: province',
            '.zipcode': 'value: zipcode, attr: {placeholder: select(equal(country, "US"), _lp_PROFILE_ZIP_CODE, _lp_PROFILE_POSTAL_CODE)}, pattern: /^((\\w|\\s){0,20})$/' // all requirements are in Bug 33655
        },
        bindingFilters: {
            parseOptions: function(data) {
                var result = [];
                if (!_.isObject(data)) {
                    return result;
                }
                for(var i in data) {
                    result.push({
                        label: data[i],
                        value: i
                    });
                }
                return result;
            }
        }
    });

    App.Views.CoreProfileView.CoreProfileEditView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'edit',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var basicDetails = App.Views.GeneratorView.create('Profile', {
                el: this.$('.basic-details-box'),
                mod: 'BasicDetails',
                model: this.model
            });

            var address = App.Views.GeneratorView.create('Profile', {
                el: this.$('.address-box'),
                mod: 'Address',
                model: new Backbone.Model(this.model.getEmptyAddress())
            });

            this.subViews.push(basicDetails, address);

            return this;
        }
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
            // once gets authorized/logged out/created need to close panel
            this.listenTo(this.model, 'change:access_token onUserCreated', controlLinks(false, false, false));
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
            'click .signup-link': controlLinks(true, false, false),
            'click .login-link': controlLinks(false, true, false),
            'click .logged-as': controlLinks(false, false, true),
            'click .close': controlLinks(false, false, false)
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
        }
    });

    function controlLinks(showSignUp, showLogIn, showMenu) {
        return function() {
            this.getBinding('$ui').set({
                showSignUp: showSignUp,
                showLogIn: showLogIn,
                showMenu: showMenu
            });
        };
    }

    return new (require('factory'))(function() {
        App.Views.ProfileView = {};
        App.Views.ProfileView.ProfileBasicDetailsView = App.Views.CoreProfileView.CoreProfileBasicDetailsView;
        App.Views.ProfileView.ProfileSignUpView = App.Views.CoreProfileView.CoreProfileSignUpView;
        App.Views.ProfileView.ProfileLogInView = App.Views.CoreProfileView.CoreProfileLogInView;
        App.Views.ProfileView.ProfileCreateView = App.Views.CoreProfileView.CoreProfileCreateView;
        App.Views.ProfileView.ProfileEditView = App.Views.CoreProfileView.CoreProfileEditView;
        App.Views.ProfileView.ProfileAddressView = App.Views.CoreProfileView.CoreProfileAddressView;
        App.Views.ProfileView.ProfileSettingsView = App.Views.CoreProfileView.CoreProfileSettingsView;
        App.Views.ProfileView.ProfilePWDResetView = App.Views.CoreProfileView.CoreProfilePWDResetView;
        App.Views.ProfileView.ProfileMenuView = App.Views.CoreProfileView.CoreProfileMenuView;
        App.Views.ProfileView.ProfilePanelView = App.Views.CoreProfileView.CoreProfilePanelView;
    });
});