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

require(['app'], function() {
    if (is_browser_unsupported) {
        return;
    }

    var app = require('app'),
        skins = app.skins;

    // add skins
    skins.set('WEBORDER', 'weborder');
    skins.set('WEBORDER_MOBILE', 'weborder_mobile');
    skins.set('RETAIL', 'retail');

    // set REVEL_HOST for getting data from it
    //app.REVEL_HOST = "https://weborder-dev-branch.revelup.com";
    app.REVEL_HOST = window.location.origin;
    app.REVEL_HOST = 'https://weborder-dev-branch.revelup.com';

    // run app
    app.init();
});