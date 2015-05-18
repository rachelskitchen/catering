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
            var dfd_core = $.Deferred(),
                dfd_skin = $.Deferred(),
                load_all = $.Deferred();
            dfd_core = this._loadLanguagePack(true); // load a core language pack from backend
            dfd_skin = this._loadLanguagePack(); // load a skin language pack from backend
            $.when(dfd_core, dfd_skin).done(function() {
                load_all.resolve();
            });
            return load_all;        
        },
        _loadLanguagePack: function(load_core) {
            var DEFAULT_LOCALE = 'en';
            var self = this, path,
                settings = App.Data.settings,
                skin = settings.get('skin'),
                curLocale = window.navigator.language;

            settings.setSkinPath(true); // set path for the current skin
            
            if (load_core) {
                path = settings.get('coreBasePath');
                this.clear();
            } else {
                path = settings.get('skinPath');                
            }
            
            var loadCurLocale = $.Deferred(),
                loadDefLocale = $.Deferred(),
                loadCompleted = $.Deferred(),
                placeholders = {};

            var js = path + '/i18n/' + DEFAULT_LOCALE + '.js';
            require([js], function(defLocale) {
               //trace(defLocale);
               _.extend(placeholders, defLocale);

               loadDefLocale.resolve();
            }, function(err) {
               self.trigger('showError'); 
               loadDefLocale.resolve();
            });

            js = path + '/i18n/' + curLocale + '.js';
            require([js], function(currentLocale) {
               //trace(currentLocale);
               _.extend(placeholders, currentLocale);

               loadCurLocale.resolve();
            }, function(err) {
               loadCurLocale.resolve();
            });

            $.when(loadDefLocale, loadCurLocale).done(function() {
                self.set(placeholders);
                loadCompleted.resolve();
            });
            return loadCompleted;
        } //end of loadLanguagePack
    });
});