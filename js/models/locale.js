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
        loadLanguagePack: function(load_core) {
            var DEFAULT_LOCALE = 'en';
            var self = this, path, stateLocaleKey,
                settings = App.Data.settings,
                skin = settings.get('skin'),
                curLocale = window.navigator.language,
                actualVersions = {
                    defaultLocale: null,
                    curLocale: null
                };

            settings.setSkinPath(true); // set path for the current skin
            
            if (load_core) {
                stateLocaleKey = 'currentLocaleCore';
                path = settings.get('basePath');
                this.clear();
            } else {
                stateLocaleKey = 'currentLocaleSkin';
                path = settings.get('skinPath');                
            }

            var stateLocale = getData(stateLocaleKey, true); // load data from storage (cookie, sessionStorage, localStorage)

            var loadVersions = $.Deferred(),
                loadCompleted = $.Deferred();
            // load versions.json file
            $.ajax({
                url: path + '/i18n/_versions.json',
                dataType: 'json',
                success: function(data) {
                    if (data[DEFAULT_LOCALE]) actualVersions.defaultLocale = data[DEFAULT_LOCALE];
                    if (data[curLocale]) actualVersions.curLocale = data[curLocale];
                    loadVersions.resolve();
                },
                error: function() {
                    self.trigger('showError');
                }
            });

            loadVersions.done(function() {
                
                if  (!stateLocale || stateLocale.locale != curLocale || stateLocale.defaultLocale.locale != DEFAULT_LOCALE 
                        || (actualVersions.defaultLocale && 
                             (
                               !stateLocale.defaultLocale.placeholders[skin] || stateLocale.defaultLocale.placeholders[skin].version != actualVersions.defaultLocale 
                             )
                           ) 
                        || (actualVersions.curLocale && 
                              (
                                !stateLocale.placeholders[skin] || stateLocale.placeholders[skin].version != actualVersions.curLocale
                              )
                           )
                    ) {

                    var json = {
                        locale: curLocale,
                        placeholders: {},
                        defaultLocale: {
                            locale: DEFAULT_LOCALE,
                            placeholders: {}
                        }
                    }

                    var loadLocales = $.Deferred(),
                        countLocales = 2,
                        loadLocaleComplete = function() {
                            countLocales--;
                            if (countLocales == 0) loadLocales.resolve();
                        };

                    // copy existing placeholders to "json" object from "stateLocale" object (localStorage) for the default locale
                    if (stateLocale && stateLocale.defaultLocale.locale == DEFAULT_LOCALE && !$.isEmptyObject(stateLocale.defaultLocale.placeholders)) {
                        json.defaultLocale.placeholders = stateLocale.defaultLocale.placeholders;
                    }

                    if (actualVersions.defaultLocale && 
                        ((json.defaultLocale.placeholders[skin] && json.defaultLocale.placeholders[skin].version != actualVersions.defaultLocale) 
                            || (!json.defaultLocale.placeholders[skin]))) {

                        $.ajax({
                            url: path + '/i18n/' + DEFAULT_LOCALE + '.json',
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
                    if (stateLocale && stateLocale.locale == curLocale && !$.isEmptyObject(stateLocale.placeholders)) {
                        json.placeholders = stateLocale.placeholders;
                    }

                    if (actualVersions.curLocale && ((json.placeholders[skin] && json.placeholders[skin].version != actualVersions.curLocale) || (!json.placeholders[skin]))) {
                        $.ajax({
                            url: path + '/i18n/' + curLocale + '.json',
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
                        if (setData(stateLocaleKey, json, true)) { // save data to storage (cookie, sessionStorage, localStorage)
                            var def_locale = json.defaultLocale.placeholders[skin],
                                cur_locale = json.placeholders[skin],
                                dl = !$.isEmptyObject(def_locale) ? def_locale.placeholders : {},
                                cl = !$.isEmptyObject(cur_locale) ? cur_locale.placeholders : {};
                            self.set(_.extend(dl, cl));
                            loadCompleted.resolve();
                        } else {
                            self.trigger('showError');
                        }
                    });
                } else {
                    var dl = (!$.isEmptyObject(stateLocale.defaultLocale.placeholders[skin])) ?
                        stateLocale.defaultLocale.placeholders[skin].placeholders :
                        {},
                        cl = (!$.isEmptyObject(stateLocale.placeholders[skin])) ?
                        stateLocale.placeholders[skin].placeholders :
                        {};
                    self.set(_.extend(dl, cl));
                    loadCompleted.resolve();
                }
            });
        
            return loadCompleted;
        } //end of loadLanguagePack
    });
});