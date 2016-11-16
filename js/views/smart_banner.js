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

    /*
    * Mixin functons for starting smart banner
    */
    var SmartBannerMix = {
        start_smart_banner: function() {
            var mobile = function() {
                if (cssua.ua.ios) {
                    return 'ios';
                } else if (cssua.ua.android) {
                    return 'android';
                }
            }();

            var set_dir = App.SettingsDirectory;
            var store_app_id = (mobile == 'ios' && set_dir ? set_dir.apple_app_id : set_dir.google_app_id);
            if (set_dir.smart_banner && store_app_id) {
                var meta = document.createElement('meta');
                meta.name = APP_STORE_NAME[mobile];
                meta.content = 'app-id=' + store_app_id;
                document.querySelector('head').appendChild(meta);

                $.smartbanner({
                    daysHidden : 0,
                    daysReminder : 0,
                    title : set_dir.smart_banner_title || 'Stanford R&DE FOOD ToGo',
                    author : set_dir.smart_banner_author || 'Revel Systems',
                    icon : set_dir.smart_banner_icon_url || 'https://lh3.googleusercontent.com/kj4yHHb6ct6xWUsUPHE38Efh38_1MpIrF3IejoZiI9yLtB4VtrLJ3timHm6EWnfbJSih=w300',
                    force: mobile,
                    appendToSelector: '#header',
                    scale: '1',
                    onInstall: bannerHideHandler,
                    onClose: bannerHideHandler
                })
            }

            function bannerHideHandler() {
                $('#section').css('top', $('#section').offset().top - $('#smartbanner').height());
            }
        }
    }

    return new (require('factory'))(function() {
        App.Mixes.SmartBannerMix = SmartBannerMix;
    });
});





