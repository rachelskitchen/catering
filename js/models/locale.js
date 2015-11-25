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

/**
 * Contains {@link App.Models.Locale} constructor.
 * @module locale
 * @requires module:backbone
 * @see {@link module:config.paths actual path}
 */
define(['backbone'], function(Backbone) {
    'use strict';

    /**
     * @class
     * @classdesc Represents a locale model.
     * @alias App.Models.Locale
     * @augments Backbone.Model
     * @example
     * // create a locale model
     * require(['locale'], function() {
     *     var locale = new App.Models.Locale();
     * });
     */
    App.Models.Locale = Backbone.Model.extend(
    /**
     * @lends App.Models.Locale.prototype
     */
    {
        /**
         * Defines current locale and loads core, skin language pack.
         * If `locale` GET parameter exists its value is used as current locale.
         * Otherwise, browser locale preferences is used.
         * By default current locale is 'en'.
         * @returns {Object} Deferred object.
         */
        loadLanguagePack: function() {
            var self = this,
                dfd_core = $.Deferred(),
                dfd_skin = $.Deferred(),
                load_all = $.Deferred();

            if (!App.Data.get_parameters) {
                App.Data.get_parameters = parse_get_params();
            }
            if (App.Data.get_parameters.locale) {
                App.Data.curLocale = App.Data.get_parameters.locale;
            } else {
                var languages = [];
                if (navigator['languages']) { //not supported by some browsers
                    languages = languages.concat(navigator.languages);
                }
                languages.push(navigator.language);
                languages.some(function(language) {
                    language = typeof language == 'string' ? language.split('-')[0] : null; // get rid of the country code
                    if (language && App.Models.Locale.SUPPORTED_LOCALES.indexOf(language) > -1) {
                        App.Data.curLocale = language;
                        return true;
                    }
                });
            }

            this.corePlaceholders = {};
            this.skinPlaceholders = {};
            this.clear();

            dfd_core = this._loadLanguagePack(true); // load a core language pack from backend
            dfd_skin = this._loadLanguagePack(); // load a skin language pack from backend
            $.when(dfd_core, dfd_skin).done(function() {
                var placeholders = {};
                _.extend(placeholders, self.corePlaceholders);
                _.extend(placeholders, self.skinPlaceholders);
                self.set(placeholders);
                load_all.resolve();
            });
            return load_all;
        },
        /**
         * Loads language pack.
         * @private
         * @param {boolean} [load_core=false] - if `true` loads core language pack. Otherwise, skin language pack.
         * @returns {Object} Deferred object.
         */
        _loadLanguagePack: function(load_core) {
            var DEFAULT_LOCALE = 'en';
            var self = this, path,
                settings = App.Data.settings,
                skin = settings.get('skin'),
                defLocalePlaceholders,
                curLocalePlaceholders,
                resultPlaceholders,
                curLocale = App.Data.curLocale;

            if (App.skin && (App.skin == App.Skins.MLB || App.skin == App.Skins.PAYPAL)) {
                curLocale = DEFAULT_LOCALE; // no translations for MLB skin
            }

            settings.setSkinPath(true); // set path for the current skin

            if (load_core) {
                path = settings.get('coreBasePath');
            } else {
                path = settings.get('skinPath');
            }

            var loadCurLocale = $.Deferred(),
                loadDefLocale = $.Deferred(),
                loadCompleted = $.Deferred(),
                placeholders = {};

            var js = path + '/i18n/' + DEFAULT_LOCALE + '.js';
            require([js], function(defLocale) {
               defLocalePlaceholders = defLocale;
               loadDefLocale.resolve();
            }, function(err) {
               self.trigger('showError');
               loadDefLocale.resolve();
            });

            js = path + '/i18n/' + curLocale + '.js';
            require([js], function(currentLocale) {
               curLocalePlaceholders = currentLocale;
               loadCurLocale.resolve();
            }, function(err) {
               loadCurLocale.resolve();
            });

            $.when(loadDefLocale, loadCurLocale).done(function() {
                var resultPlaceholders;
                if (load_core)
                    resultPlaceholders = self.corePlaceholders;
                else
                    resultPlaceholders = self.skinPlaceholders;

                _.extend(resultPlaceholders, defLocalePlaceholders);
                _.extend(resultPlaceholders, curLocalePlaceholders);
                loadCompleted.resolve();
            });
            return loadCompleted;
        } //end of loadLanguagePack
    },
    /**
     * List of available locales: 'de', 'en', 'es', 'et', 'fr', 'it', 'lt', 'ru'.
     */
    {
        SUPPORTED_LOCALES: ['de', 'en', 'es', 'et', 'fr', 'it', 'lt', 'ru']
    });
});
