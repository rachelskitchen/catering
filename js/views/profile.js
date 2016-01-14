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
        mod: 'sign_up'
    });

    App.Views.CoreProfileView.CoreProfileLogInView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'log_in'
    });

    App.Views.CoreProfileView.CoreProfileCreateView = App.Views.FactoryView.extend({
        name: 'profile',
        mod: 'create'
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
    });
});