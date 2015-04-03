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
        initialize: function() {
            this.loadCompleted = $.Deferred();
        },
        /**
         * Load a language pack (localStorage or the backend system).
         */
        loadLanguagePack: function() {
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
                $.isEmptyObject(settings.get('settings_system')) || // if the app was not loaded (Establishments View)
                stateLocale.placeholders[skin].version != settings.get('settings_system').locales[curLocale]) {
                    var json = {
                        locale: curLocale,
                        placeholders: {}
                    }
                    if (stateLocale && stateLocale.locale == curLocale && stateLocale.placeholders) json.placeholders = stateLocale.placeholders;
                    /*
                    $.ajax({
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
                    if (curLocale == 'ru') url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/ru.placeholders.json';
                    if (curLocale == 'en') url = 'http://localhost/directory/HTML5/Web_ordering_app/placeholders/en.placeholders.json';

                    $.ajax({
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