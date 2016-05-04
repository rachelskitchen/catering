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

    App.Views.CoreGiftCardView = {};

    App.Views.CoreGiftCardView.CoreGiftCardMainView = App.Views.FactoryView.extend({
        name: 'giftcard',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'updateCaptcha', this.updateCaptcha, this);
            this.updateCaptcha();
        },
        bindings: {
            '.number-input': 'value: cardNumber, events:["input"], restrictInput: "0123456789-", kbdSwitcher: "cardNumber", pattern: /^[\\d|-]{0,19}$/',
            '.captcha-input': 'value: captchaValue, events:["input"]',
            'img.captcha': 'updateCaptcha: url',
            '#id_captcha_key': 'value: captchaKey',
            '#id_captcha_value': 'value: captchaValue, events: ["input"]'
        },
        events: {
            'click .btn-reload': 'updateCaptcha',
            'keydown .btn-reload': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.updateCaptcha();
                }
            }
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
            this.model.set('captchaValue', '');
            this.model.loadCaptcha();
        },
        render: function() {
            var cardNumber, model = {}, self = this;
            model.cardNumber = this.model.escape('cardNumber');
            model.isFirefox = /firefox/i.test(navigator.userAgent);
            this.$el.html(this.template(model));

            var captcha = this.$('#id_captcha_value');
            inputTypeMask(captcha, /^\w{0,4}$/, ''); //#14495 bug
            cardNumber = this.$('.number');
            if (cssua.userAgent.mobile) {
                var ios_version_old = false;
                if (cssua.userAgent.ios && cssua.userAgent.ios.substr(0, 1) == 6) {
                    ios_version_old = true;
                }
                var hack = false;
                if (cssua.userAgent.android) {
                    /*
                     Hack for bug: https://code.google.com/p/android/issues/detail?id=24626.
                     Bug of Revel Systems: http://bugzilla.revelup.com/bugzilla/show_bug.cgi?id=5368.
                     */
                    if (check_android_old_version(cssua.userAgent.android)) { // checking version OS Android (old version is Android <= 4.2.1)
                        hack = true;
                        cardNumber.attr("type", "text");
                        cardNumber.focus(function () {
                            $(this).attr("type", "number");
                        });
                        cardNumber.blur(function () {
                            $(this).attr("type", "text");
                        });
                    }
                }
                if (!hack) {
                    if (ios_version_old) {
                        cardNumber.attr("type", "text");
                    }
                }
            }
        },
        createCaptchaSpinner: function() {
            this.$('.captcha').hide();
            this.$('.captcha-spinner').spinner();
            this.captchaSpinner = this.$('.ui-spinner');
        },
        removeCaptchaSpinner: function() {
            this.$('.captcha').show();
            this.captchaSpinner && this.captchaSpinner.remove();
            delete this.captchaSpinner;
        }
    });

    App.Views.CoreGiftCardView.CoreGiftCardProfileView = App.Views.CoreGiftCardView.CoreGiftCardMainView.extend({
        name: 'profile',
        mod: 'giftcard'
    })

    return new (require('factory'))(function() {
        App.Views.GiftCardView = {};
        App.Views.GiftCardView.GiftCardMainView = App.Views.CoreGiftCardView.CoreGiftCardMainView;
        App.Views.GiftCardView.GiftCardProfileView  = App.Views.CoreGiftCardView.CoreGiftCardProfileView;
    });
});
