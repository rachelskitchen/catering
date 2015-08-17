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

define(["factory"], function(factory) {
    'use strict';

    var PromoMessageMain = App.Views.FactoryView.extend({
        name: 'promo_message',
        mod: 'main',
        render: function() {
console.log('PromoMessageMainView render')
            this.calculatePromoMessageWidth(); // calculate a promo message width
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            return this;
        },
        calculatePromoMessageWidth: function() {
            var promo_message = Backbone.$('<div class="promo_message promo_message_internal">' + App.Settings.promo_message + '</div>');
            $('body').append(promo_message);
            this.model.set('widthPromoMessage', promo_message.width());
            promo_message.remove();
            this.model.set('widthWindow', $(window).width());
            this.addPromoMessage(); // add a promo message
            $(window).resize(this, this.resizePromoMessage);
        },
        resizePromoMessage: function() {
            if (arguments[0].data.model.get('widthWindow') !== $(window).width()) {
                arguments[0].data.model.set('widthWindow', $(window).width());
            }
        },
        addPromoMessage: function() {
            var self = this;
            window.setTimeout(function() {
                var promo_text = self.$('.promo_text');
                var promo_marquee = self.$('.promo_marquee');
                if (self.model.get('widthPromoMessage') >= self.model.get('widthWindow')) {
                    var isFirefox = /firefox/g.test(navigator.userAgent.toLowerCase());
                    if (isFirefox) {
                        // bug #15981: "First Firefox displays long promo message completely then erases it and starts scrolling"
                        $(document).ready(function() {
                            promo_text.hide();
                            promo_marquee.show();
                        });
                    } else {
                        promo_text.hide();
                        promo_marquee.show();
                    }
                } else {
                    promo_text.show();
                    promo_marquee.hide();
                }
            }, 0);
        }
    });

    return new factory(function() {
        App.Views.PromoMessageView = {};
        App.Views.PromoMessageView.PromoMessageMainView = PromoMessageMain;
    });
});