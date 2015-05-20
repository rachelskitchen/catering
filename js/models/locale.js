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
         * Load a language pack
         */
        loadLanguagePack: function() {
            var self = this,
                dfd_core = $.Deferred(),
                dfd_skin = $.Deferred(),
                load_all = $.Deferred();

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
        _loadLanguagePack: function(load_core) {
            var DEFAULT_LOCALE = 'en';
            var self = this, path,
                settings = App.Data.settings,
                skin = settings.get('skin'),
                defLocalePlaceholders,
                curLocalePlaceholders,
                resultPlaceholders,
                curLocale = window.navigator.language.replace(/-.*/g, '');

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
    });
});