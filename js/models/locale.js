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

            var DEFAULT_LOCALE = 'en';
            var self = this,
                skin = App.Data.settings.get('skin'),
                curLocale = window.navigator.language,
                actualVersions = {
                    defaultLocale: null,
                    curLocale: null
                },
                stateLocale = getData('currentLocale', true); // load data from storage (cookie, sessionStorage, localStorage)

            var loadVersions = Backbone.$.Deferred();
            // load versions.json file
            Backbone.$.ajax({
                url: '../i18n/versions.json',
                dataType: 'json',
                success: function(data) {
                    if (data[skin][DEFAULT_LOCALE]) actualVersions.defaultLocale = data[skin][DEFAULT_LOCALE];
                    if (data[skin][curLocale]) actualVersions.curLocale = data[skin][curLocale];
                    loadVersions.resolve();
                },
                error: function() {
                    self.trigger('showError');
                }
            });

            loadVersions.done(function() {
                if (!stateLocale || stateLocale.locale != curLocale || stateLocale.defaultLocale.locale != DEFAULT_LOCALE || (actualVersions.defaultLocale && ((stateLocale.defaultLocale.placeholders[skin] && stateLocale.defaultLocale.placeholders[skin].version != actualVersions.defaultLocale) || !stateLocale.defaultLocale.placeholders[skin])) || (actualVersions.curLocale && ((stateLocale.placeholders[skin] && stateLocale.placeholders[skin].version != actualVersions.curLocale) || !stateLocale.placeholders[skin]))) {
                    var json = {
                        locale: curLocale,
                        placeholders: {},
                        defaultLocale: {
                            locale: DEFAULT_LOCALE,
                            placeholders: {}
                        }
                    }

                    var loadLocales = Backbone.$.Deferred(),
                        countLocales = 2,
                        loadLocaleComplete = function() {
                            countLocales--;
                            if (countLocales == 0) loadLocales.resolve();
                        };

                    // copy existing placeholders to "json" object from "stateLocale" object (localStorage) for the default locale
                    if (stateLocale && stateLocale.defaultLocale.locale == DEFAULT_LOCALE && !Backbone.$.isEmptyObject(stateLocale.defaultLocale.placeholders)) {
                        json.defaultLocale.placeholders = stateLocale.defaultLocale.placeholders;
                    }

                    if (actualVersions.defaultLocale && ((json.defaultLocale.placeholders[skin] && json.defaultLocale.placeholders[skin].version != actualVersions.defaultLocale) || (!json.defaultLocale.placeholders[skin]))) {
                        Backbone.$.ajax({
                            url: '../i18n/' + skin + '/' + DEFAULT_LOCALE + '.' + skin + '.json',
                            dataType: 'json',
                            success: function(data) {
                                json.defaultLocale.placeholders[skin] = {
                                    version: actualVersions.defaultLocale,
                                    placeholders: data
                                };
                                loadLocaleComplete();
                            },
                            error: function() {
                                self.trigger('showError');
                            }
                        });
                    } else {
                        loadLocaleComplete();
                    }

                    // copy existing placeholders to "json" object from "stateLocale" object (localStorage) for the current locale
                    if (stateLocale && stateLocale.locale == curLocale && !Backbone.$.isEmptyObject(stateLocale.placeholders)) {
                        json.placeholders = stateLocale.placeholders;
                    }

                    if (actualVersions.curLocale && ((json.placeholders[skin] && json.placeholders[skin].version != actualVersions.curLocale) || (!json.placeholders[skin]))) {
                        Backbone.$.ajax({
                            url: '../i18n/' + skin + '/' + curLocale + '.' + skin + '.json',
                            dataType: 'json',
                            success: function(data) {
                                json.placeholders[skin] = {
                                    version: actualVersions.curLocale,
                                    placeholders: data
                                };
                                loadLocaleComplete();
                            },
                            error: function() {
                                self.trigger('showError');
                            }
                        });
                    } else {
                        loadLocaleComplete();
                    }

                    loadLocales.done(function() {
                        if (setData('currentLocale', json, true)) { // save data to storage (cookie, sessionStorage, localStorage)
                            var dl = (!Backbone.$.isEmptyObject(json.defaultLocale.placeholders[skin])) ?
                                json.defaultLocale.placeholders[skin].placeholders :
                                {},
                                cl = (!Backbone.$.isEmptyObject(json.placeholders[skin])) ?
                                json.placeholders[skin].placeholders :
                                {};
                            self.set(_.extend(dl, cl));
                            self.loadCompleted.resolve();
                        } else {
                            self.trigger('showError');
                        }
                    });
                } else {
                    var dl = (!Backbone.$.isEmptyObject(stateLocale.defaultLocale.placeholders[skin])) ?
                        stateLocale.defaultLocale.placeholders[skin].placeholders :
                        {},
                        cl = (!Backbone.$.isEmptyObject(stateLocale.placeholders[skin])) ?
                        stateLocale.placeholders[skin].placeholders :
                        {};
                    self.set(_.extend(dl, cl));
                    self.loadCompleted.resolve();
                }
            });
        }
    });
});