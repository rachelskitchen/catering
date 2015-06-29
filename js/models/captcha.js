/**
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

define(["backbone"], function(Backbone) {
    'use strict';

    /**
     * @class
     * Represents Captcha API
     */
    App.Models.Captcha = Backbone.Model.extend({
        /**
         * @prop {object} defaults - literal object containing attribute with default values.
         *
         * @prop {string} defaults.captchaImage - captcha image url.
         * @default ''.
         *
         * @prop {string} defaults.captchaKey - captcha key value (used in backend to validate captcha value).
         * @default ''.
         *
         * @prop {string} defaults.captchaValue - captcha value entered by user.
         * @default ''.
         */
        defaults: {
            captchaImage: '',
            captchaKey: '',
            captchaValue: ''
        },
        /**
         * @methods
         * Gets captcha image from '/weborders/captcha/?establishment=<number>' resource.
         */
        loadCaptcha: function() {
            var self = this;
            $.getJSON('/weborders/captcha/?establishment=' + App.Data.settings.get('establishment'), {}, function(json) {
                self.set('captchaImage', json.captcha_image);
                self.set('captchaKey', json.captcha_key);
            });
        }
    });
});