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

define(["backbone", "factory"], function(Backbone) {
    'use strict';

    App.Views.CoreStanfordCardView = {};

    App.Views.CoreStanfordCardView.CoreStanfordCardMainView = App.Views.FactoryView.extend({
        name: 'stanfordcard',
        mod: 'main',
        bindings: {
            '.number-input': 'value: number, events: ["input"]',
            '.captcha-input': 'value: captchaValue, events: ["input"]',
            '.captcha-image': 'updateCaptcha: url'
        },
        events: {
            'click .update-captcha': 'updateCaptcha'
        },
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            inputTypeMask(this.$('.number-input'), /^\d*$/, this.model.get('number'), 'numeric');
            this.updateCaptcha();
        },
        computeds: {
            url: {
                deps: ['captchaImage', '_settings_host'],
                get: function(captchaImage, _settings_host) {
                    if(captchaImage) {
                        return _settings_host + captchaImage;
                    } else {
                        return '';
                    }
                }
            }
        },
        updateCaptcha: function() {
            this.removeCaptchaSpinner();
            this.createCaptchaSpinner();
            this.model.set('captchaImage', '');
            this.model.loadCaptcha();
        },
        createCaptchaSpinner: function() {
            this.$('.captcha-spinner').spinner();
            this.captchaSpinner = this.$('.ui-spinner');
        },
        removeCaptchaSpinner: function() {
            this.captchaSpinner && this.captchaSpinner.remove();
            delete this.captchaSpinner;
        }
    });

    return new (require('factory'))(function() {
        App.Views.StanfordCardView = {};
        App.Views.StanfordCardView.StanfordCardMainView = App.Views.CoreStanfordCardView.CoreStanfordCardMainView;
    });

});