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
    var cache = {};

    App.Views.Generator = new Function();

    App.Views.Generator.prototype = {
        options: {
            mod: 'Main'
        },
        create: function(ViewClass, options, idParam) {
            var root, id = idParam && ViewClass + options.mod + 'View' + idParam;
            options = options || {};
            options = _.defaults(options, this.options);
            if(App.Views.Generator.enableCache && id in cache) {
                var view = cache[id];
            } else {
                options.dbgClassName = ViewClass + 'View.' + ViewClass + options.mod + 'View';
                root = App.Views[ViewClass + 'View'];
                if (!root || !root[ViewClass + options.mod + 'View']) {
                    console.error("Can't find the view class: " + "App.Views." + options.dbgClassName);
                }
                view = new App.Views[ViewClass + 'View'][ViewClass + options.mod + 'View'](options);
                if(App.Views.Generator.enableCache && id)
                    cache[id] = view;
            }
            return view;
        },
        /**
         * Clear cache if store was changed.
         */
        clearCache: function(key) {
            for (var view in cache) {
                if (!~view.indexOf('CoreEstablishments')) cache[view].remove();
            }
            cache = {};
            App.Data.view_cache = cache; //for debug
        },
        /*
        *
        */
        cacheRemoveView: function(ViewClass, mod, id) {
            id = ViewClass + mod + 'View' + id;
            if (cache[id]) {
                cache[id].remove();
                delete cache[id];
            }
        }
    };

    App.Views.GeneratorView = new App.Views.Generator();
});