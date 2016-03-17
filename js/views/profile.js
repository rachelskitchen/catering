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
            'click .guest-btn': setCallback('guestCb'),
            'click .forgot-password': setCallback('forgotPasswordAction')
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
            '.logged-as': 'toggle: access_token, html: loggedAs(first_name)',
            '.private-btn': 'classes: {"primary-text": access_token, "regular-text": not(access_token), disabled: not(access_token)}',
            '.payments-link': 'toggle: _settings_directory_saved_credit_cards'
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
            'click .my_promotions-link:not(.disabled)': setCallback('my_promotions_link'),
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
        events: {
            'click .update-btn': setCallback('updateAction')
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var basicDetails = App.Views.GeneratorView.create('Profile', {
                el: this.$('.basic-details-box'),
                mod: 'BasicDetails',
                model: this.model
            });

            var accountPassword = App.Views.GeneratorView.create('Profile', {
                el: this.$('.account-password-box'),
                mod: 'AccountPassword',
                model: this.model
            });

            var address = App.Views.GeneratorView.create('Profile', {
                el: this.$('.address-box'),
                mod: 'Address',
                model: this.options.address
            });

            this.subViews.push(basicDetails, address);

            return this;
        }
    });

    App.Views.CoreProfileView.CoreProfileAccountPasswordView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'account_password',
        bindings: {
            '.current-password': 'value: password, events:["input"], pattern: /^.{0,255}$/',
            '.new-password': 'value: confirm_password, events:["input"], pattern: /^.{0,255}$/',
            '.account-password': 'classes: {required: any(password, confirm_password)}'
        }
    });

    App.Views.CoreProfileView.CoreProfilePWDResetView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'reset_password',
        bindings: {
            '.email': 'value: email, events: ["input"], pattern: /^.{0,254}$/',
            '.reset-btn': 'classes: {disabled: not(email)}'
        },
        events: {
            'click .reset-btn': setCallback('resetAction')
        }
    });

    App.Views.CoreProfileView.CoreProfilePanelView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'panel',
        initialize: function() {
            this.listenTo(this.model, 'hidePanel', controlLinks(false, false, false, false));
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            ':el': 'classes: {active: any(ui_showSignUp, ui_showLogIn, ui_showMenu, ui_showPWDReset)}',
            '.signup-link': 'toggle: not(access_token), classes: {"primary-text": not(ui_showSignUp), "regular-text": ui_showSignUp}',
            '.login-link': 'toggle: not(access_token), classes: {"primary-text": not(ui_showLogIn), "regular-text": ui_showLogIn}',
            '.close': 'toggle: any(ui_showSignUp, ui_showLogIn, ui_showMenu, ui_showPWDReset)',
            '.sign-up-box': 'toggle: ui_showSignUp',
            '.log-in-box': 'toggle: ui_showLogIn',
            '.menu-items': 'toggle: ui_showMenu',
            '.logged-as': 'text: first_name, toggle: access_token',
            '.reset-password-box': 'toggle: ui_showPWDReset'
        },
        events: {
            'click .signup-link': controlLinks(true, false, false, false),
            'click .login-link': controlLinks(false, true, false, false),
            'click .logged-as': controlLinks(false, false, true, false),
            'click .close': controlLinks(false, false, false, false)
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({
                    showSignUp: false,
                    showLogIn: false,
                    showMenu: false,
                    showPWDReset: false
                });
            }
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            // LogIn view
            var loginView = App.Views.GeneratorView.create('Profile', _.extend({}, this.options, {
                el: this.$('.log-in-box'),
                mod: 'LogIn',
                model: this.model,
                forgotPasswordAction: controlLinks(false, false, false, true).bind(this)
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

            var resetPWD = App.Views.GeneratorView.create('Profile', _.extend({}, this.options, {
                el: this.$('.reset-password-box'),
                mod: 'PWDReset',
                resetAction: this.options.resetAction
            }));

            this.subViews.push(loginView, signupView, menuView, resetPWD);

            return this;
        }
    });

    App.Views.CoreProfileView.CoreProfileOwnerContactsView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'owner_contacts',
        bindings: {
            ':el': 'toggle: any(_settings_directory_owner_contact, _settings_directory_owner_website)',
            '.contact-info': 'toggle: _settings_directory_owner_contact',
            '.website-info': 'toggle: _settings_directory_owner_website',
            '.phone': 'text: _settings_directory_owner_contact, attr: {href: format("tel:$1", _settings_directory_owner_contact)}',
            '.website': 'text: _settings_directory_owner_website, attr: {href: _settings_directory_owner_website}'
        }
    });

    App.Views.CoreProfileView.CoreProfilePaymentSelectionView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'payment_selection',
        tagName: 'li',
        bindings: {
            ':el': 'classes: {selected: selected}',
            '.card-number': 'text: last_digits',
            '.card-type': 'text: creditCardType(_lp_CREDIT_CARD_TYPES, card_type)'
        },
        bindingFilters: {
            creditCardType: creditCardType
        },
        events: {
            'click': 'select'
        },
        select: function() {
            var isSelect = !this.model.get('selected');
            isSelect && this.model.set('selected', isSelect);
        }
    });

    App.Views.CoreProfileView.CoreProfilePaymentsSelectionView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'payments_selection',
        bindings: {
            '.payments-list': 'collection: $collection'
        },
        itemView: App.Views.CoreProfileView.CoreProfilePaymentSelectionView,
        events: {
            'click .add-cc': setCallback('addCreditCard')
        }
    });

    App.Views.CoreProfileView.CoreProfilePaymentEditionView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'payment_edition',
        tagName: 'li',
        bindings: {
            '.card-number': 'text: last_digits',
            '.card-type': 'text: creditCardType(_lp_CREDIT_CARD_TYPES, card_type)'
        },
        bindingFilters: {
            creditCardType: creditCardType
        },
        events: {
            'click .remove-btn': 'removeToken'
        },
        removeToken: function() {
            this.options.collectionView.options.removeToken(this.model.get('id'));
        }
    });

    App.Views.CoreProfileView.CoreProfilePaymentsEditionView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'payments_edition',
        bindings: {
            '.payments-list': 'collection: $collection'
        },
        itemView: App.Views.CoreProfileView.CoreProfilePaymentEditionView
    });

    App.Views.CoreProfileView.CoreProfilePaymentsView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'payments',
        // events: {
        //     'click .update-btn': setCallback('updateAction')
        // },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var paymentsEdition = App.Views.GeneratorView.create('Profile', {
                el: this.$('.payments-box'),
                mod: 'PaymentsEdition',
                collection: this.collection,
                removeToken: this.options.removeToken
            });

            this.subViews.push(paymentsEdition);

            return this;
        }
    });

    function controlLinks(showSignUp, showLogIn, showMenu, showPWDReset) {
        return function() {
            this.getBinding('$ui').set({
                showSignUp: showSignUp,
                showLogIn: showLogIn,
                showMenu: showMenu,
                showPWDReset: showPWDReset
            });
        };
    }

    function creditCardType(types, card_type) {
        var code = _.invert(ACCEPTABLE_CREDIT_CARD_TYPES)[card_type]
        return types[code];
    }

    return new (require('factory'))(function() {
        App.Views.ProfileView = {};
        App.Views.ProfileView.ProfileBasicDetailsView = App.Views.CoreProfileView.CoreProfileBasicDetailsView;
        App.Views.ProfileView.ProfileSignUpView = App.Views.CoreProfileView.CoreProfileSignUpView;
        App.Views.ProfileView.ProfileLogInView = App.Views.CoreProfileView.CoreProfileLogInView;
        App.Views.ProfileView.ProfileCreateView = App.Views.CoreProfileView.CoreProfileCreateView;
        App.Views.ProfileView.ProfileEditView = App.Views.CoreProfileView.CoreProfileEditView;
        App.Views.ProfileView.ProfileAddressView = App.Views.CoreProfileView.CoreProfileAddressView;
        App.Views.ProfileView.ProfileAccountPasswordView = App.Views.CoreProfileView.CoreProfileAccountPasswordView;
        App.Views.ProfileView.ProfilePWDResetView = App.Views.CoreProfileView.CoreProfilePWDResetView;
        App.Views.ProfileView.ProfileMenuView = App.Views.CoreProfileView.CoreProfileMenuView;
        App.Views.ProfileView.ProfilePanelView = App.Views.CoreProfileView.CoreProfilePanelView;
        App.Views.ProfileView.ProfileOwnerContactsView = App.Views.CoreProfileView.CoreProfileOwnerContactsView;
        App.Views.ProfileView.ProfilePaymentSelectionView = App.Views.CoreProfileView.CoreProfilePaymentSelectionView;
        App.Views.ProfileView.ProfilePaymentsSelectionView = App.Views.CoreProfileView.CoreProfilePaymentsSelectionView;
        App.Views.ProfileView.ProfilePaymentEditionView = App.Views.CoreProfileView.CoreProfilePaymentEditionView;
        App.Views.ProfileView.ProfilePaymentsEditionView = App.Views.CoreProfileView.CoreProfilePaymentsEditionView;
        App.Views.ProfileView.ProfilePaymentsView = App.Views.CoreProfileView.CoreProfilePaymentsView;
    });
});