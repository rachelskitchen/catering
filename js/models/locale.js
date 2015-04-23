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

define(['backbone'], function(Backbone) {
    'use strict';

    App.Models.Locale = Backbone.Model.extend({
        /**
         * Load a language pack (localStorage or the backend system).
         */
        loadLanguagePack: function() {
            this.loadCompleted = Backbone.$.Deferred();
            this.clear();
            var self = this,
                settings = App.Data.settings,
                skin = settings.get('skin'),
                curLocale = window.navigator.language,
                stateLocale = getData('currentLocale', true); // load data from storage (cookie, sessionStorage, localStorage)
            // for test (begin)
            curLocale = 'en';
            // for test (end)
            if (!stateLocale ||
                stateLocale.locale != curLocale ||
                !stateLocale.placeholders[skin] ||
                Backbone.$.isEmptyObject(settings.get('settings_system')) || // if the app was not loaded (Establishments View)
                !settings.get('settings_system').locales || // for Directory skin (skin shouldn't depend on settings_system)
                stateLocale.placeholders[skin].version != settings.get('settings_system').locales[curLocale]) {
                    var json = {
                        locale: curLocale,
                        placeholders: {}
                    }
                    if (stateLocale && stateLocale.locale == curLocale && stateLocale.placeholders) json.placeholders = stateLocale.placeholders;
                    /*
                    Backbone.$.ajax({
                        url: settings.get('host') + '/weborders/lang/',
                        data: {
                            locale: curLocale,
                            skin: skin
                        },
                        dataType: 'json',
                        success: function(response) {
                            switch (response.status) {
                                case 'OK':
                                    json.placeholders[skin] = response.data;
                                    if (setData('currentLocale', json, true)) { // save data to storage (cookie, sessionStorage, localStorage)
                                        self.set(response.data.placeholders);
                                        self.loadCompleted.resolve();
                                    } else {
                                        self.trigger('showError');
                                    }
                                    break;
                                default:
                                    self.trigger('showError');
                                    break;
                            }
                        },
                        error: function() {
                            self.trigger('showError');
                        }
                    });
                    */
                    // for test (begin)
                    var url;
                    switch (skin) {
                        case App.Skins.WEBORDER:
                            switch (curLocale) {
                                case 'en':
                                    url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.weborder.placeholders.json';
                                    break;
                            }
                            break;
                        case App.Skins.RETAIL:
                            switch (curLocale) {
                                case 'en':
                                    url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.retail.placeholders.json';
                                    break;
                            }
                            break;
                        case App.Skins.WEBORDER_MOBILE:
                            switch (curLocale) {
                                case 'en':
                                    url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.weborder_mobile.placeholders.json';
                                    break;
                            }
                            break;
                        case App.Skins.DIRECTORY:
                            switch (curLocale) {
                                case 'en':
                                    url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.directory.placeholders.json';
                                    break;
                            }
                            break;
                        case App.Skins.DIRECTORY_MOBILE:
                            switch (curLocale) {
                                case 'en':
                                    url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.directory_mobile.placeholders.json';
                                    break;
                            }
                            break;
                        case App.Skins.MLB:
                            switch (curLocale) {
                                case 'en':
                                    url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.mlb.placeholders.json';
                                    break;
                            }
                            break;
                        case App.Skins.PAYPAL:
                            switch (curLocale) {
                                case 'en':
                                    url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.paypal.placeholders.json';
                                    break;
                            }
                            break;
                    }

                    Backbone.$.ajax({
                        url: url,
                        data: {
                            locale: curLocale,
                            skin: skin
                        },
                        dataType: 'json',
                        success: function(response) {
                            response = {
                                status: 'OK',
                                data: {
                                    placeholders: response
                                }
                            }
                            if (curLocale == 'ru') response.data.version = 1427802447190;
                            if (curLocale == 'en') response.data.version = 1427802271098;
                            switch (response.status) {
                                case 'OK':
                                    json.placeholders[skin] = response.data;
                                    if (setData('currentLocale', json, true)) { // save data to storage (cookie, sessionStorage, localStorage)
                                        self.set(response.data.placeholders);
                                        self.loadCompleted.resolve();
                                    } else {
                                        self.trigger('showError');
                                    }
                                    break;
                                default:
                                    self.trigger('showError');
                                    break;
                            }
                        },
                        error: function() {
                            self.trigger('showError');
                        }
                    });
                    // for test (end)
            } else {
                this.set(stateLocale.placeholders[skin].placeholders);
                this.loadCompleted.resolve();
            }
        }
    });
});