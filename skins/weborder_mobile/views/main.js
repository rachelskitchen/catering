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

define(["backbone", "factory", "generator"], function(Backbone) {
    'use strict';

    App.Views.MainView = App.Views.FactoryView.extend({
        name: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:content', this.content_change, this);
            this.listenTo(this.model, 'change:header', this.header_change, this);
            this.listenTo(this.model, 'change:footer', this.footer_change, this);
            this.listenTo(this.model, 'loadStarted', this.loadStarted, this);
            this.listenTo(this.model, 'loadCompleted', this.loadCompleted, this);
            this.listenTo(this.model, 'showPromoMessage', this.showPromoMessage, this);
            this.listenTo(this.model, 'hidePromoMessage', this.hidePromoMessage, this);
            this.listenTo(this.model, 'showRevelPopup', this.showRevelPopup, this);
            this.listenTo(this.model, 'hideRevelPopup', this.hideRevelPopup, this);
            this.listenTo(this.model, 'change:isBlurContent', this.blurEffect, this);

            this.iOSFeatures();

            var self = this;
            $(window).resize(function() {
                if (!isIEMobile() && !isAndroidWebKit() && self.model.get('no_perfect_scroll') !== true) { //no_perfect_scroll #14024
                   self.$('#content').perfectScrollbar('update');
                }
            })

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            initSizes();
            this.$('#main-spinner').css('font-size', App.Data.getSpinnerSize() + 'px').spinner();
            this.showSpinner();
            // #fix for bug 9841
            this.$el.on('touchend', 'input[type=text], input[type=number], input[type=tel]', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).focus();
            });
            this.iOSSafariCaretFix();
            return this;
        },
        content_change: function() {
            var view, content = this.$('#content'),
                data = this.model.get('content'),
                content_defaults = this.content_defaults();

            while(this.subViews.length > 2) {
                view = this.subViews.pop();
                view.removeFromDOMTree();
            }

            if(Array.isArray(data))
                data.forEach(function(data) {
                    content.append(this.addContent(data));
                }, this);
            else
                content.append(this.addContent(data));

            content.scrollTop(0);
            if (!isIEMobile() && !isAndroidWebKit()) {
               content.perfectScrollbar('destroy');
            }
        },
        header_change: function() {
            var data = _.defaults(this.model.get('header'), this.header_defaults());
            this.subViews[0] && this.subViews[0].remove();
            this.subViews[0] = App.Views.GeneratorView.create(data.modelName, data);
            this.$('#header').append(this.subViews[0].el);
        },
        footer_change : function() {
            var data = _.defaults(this.model.get('footer'), this.footer_defaults());
            this.subViews[1] && this.subViews[1].remove();
            this.subViews[1] = App.Views.GeneratorView.create(data.modelName, data);
            this.$('#footer').append(this.subViews[1].el);
        },
        header_defaults: function() {
            return {
                model: App.Data.header,
                className: 'header',
                modelName: 'Header'
            }
        },
        footer_defaults : function() {
            return {
                model : App.Data.footer,
                className : 'footer',
                modelName : 'Footer'
            };
        },
        content_defaults : function() {
            return {
                className : 'content'
            };
        },
        addContent: function(data, removeClass) {
            var id = 'content_' + data.modelName + '_' + data.mod;
            data = _.defaults(data, this.content_defaults());

            if(removeClass)
                delete data.className;

            var subView = App.Views.GeneratorView.create(data.modelName, data, data.cacheId ? id : undefined);
            if(this.subViews.length > 2)
                this.subViews.push(subView);
            else
                this.subViews[2] = subView;

            return subView.el;
        },
        iOSFeatures: function() {
            if(/iPad|iPod|iPhone/.test(window.navigator.userAgent))
                document.addEventListener('touchstart', new Function, false); // enable css :active pseudo-class for all elements
        },
        loadCompleted: function() {
            $(window).trigger('loadCompleted');
            clearTimeout(this.spinner);
            delete this.spinner;
            if (!isIEMobile() && !isAndroidWebKit() && this.model.get('no_perfect_scroll') !== true) { //no_perfect_scroll #14024
                $("#content").css("overflow-y", "hidden");
                setTimeout($.fn.perfectScrollbar.bind(this.$('#content')), 0);
            }
            if (this.model.get('no_perfect_scroll') === true) {
                $("#content").css("overflow-y", "auto");
            }
            this.hideSpinner();
        },
        loadStarted: function() {
            this.spinner = setTimeout(this.showSpinner.bind(this), 50);
        },
        showSpinner: function() {
            this.blurBg();
            this.$('#main-spinner').show();
        },
        hideSpinner: function() {
            this.unblurBg();
            this.$('#main-spinner').hide();
        },
        /**
         * Styles for a visible promo message.
         */
        showPromoMessage: function() {
            this.$('section').addClass('section_promo_show');
            this.$('footer').addClass('footer_promo_show');
        },
        /**
         * Styles for a invisible promo message.
         */
        hidePromoMessage: function() {
            this.$('section').removeClass('section_promo_show');
            this.$('footer').removeClass('footer_promo_show');
        },
        showRevelPopup: function(data) {
            var container = this.$('#revel-popup');
            container.css({display: 'table'});
            this.blurBg();
            this.revelView = App.Views.GeneratorView.create(data.modelName, data, data.cacheId);
            this.subViews.push(this.revelView);
            container.append(this.revelView.el);
        },
        hideRevelPopup: function() {
            this.$('#revel-popup').hide();
            this.unblurBg();
            this.revelView && this.revelView.removeFromDOMTree();
        },
        blurBg: function() {
            this.$('section, footer, header').addClass('blur');
        },
        unblurBg: function() {
            this.$('section, footer, header').removeClass('blur');
        },
        /**
         * A blur effect of content.
         * Blur effect supported on Firefox 35, Google Chrome 18, Safari 6, iOS Safari 6.1, Android browser 4.4, Chrome for Android 39.
         */
        blurEffect: function() {
            // http://caniuse.com/#search=filter
            if (this.model.get('isBlurContent')) {
                this.blurBg(); // apply blurring background
            } else {
                this.unblurBg(); // cancel blurring background
            }
        },
    });

    function initSizes() {
        var w = 640,
            h = 700,
            fsDefault = 10,
            coef = 1,
            resizing = false,
            interval;

        function resize() {
            resizing = true;
            var wW = $(window).width(),
                wH = $(window).height(),
                wCoef = wW / w,
                hCoef = wH / h;
            if (wCoef > hCoef) {
                coef = hCoef;
            }
            else {
                coef = wCoef;
            }
            $('body').css('font-size', Math.round(fsDefault * coef));
            resizing = false;
        };

        $(window).resize(function() {
            !resizing && resize();
        });

        resize();
    }
});
