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

define(["store_info_view"], function(store_info_view) {
    'use strict';

    var logoNode, ih;

    var LogoView = App.Views.CoreStoreInfoView.CoreStoreInfoMainView.extend({
        initialize: function() {
            this.resize = logoResize.bind(this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            function insertFromCache() {
                self.$('.store_info_main_logo').remove();
                self.$el.prepend(logoNode);
            }

            var self = this,
                el = this.el,
                $el = this.$el;

            if(logoNode) {
                insertFromCache();
                $(window).on('resize', self.resize);
            } else {
                var logo = this.$('img#logo');

                // bug #18603: screen is corrupted on mobile devices after switching store then going back
                // CSS does not yet apply therefore this delay is required here
                var timer = window.setInterval(function() {
                    if (logo.is(':hidden')) {
                        loadSpinner(logo, false, function() {
                            self.resize();
                            $(window).on('resize', self.resize);
                        }); // loading img spinner
                        clearInterval(timer);
                    }
                }, 5);
            }

            el.addEventListener('DOMNodeInserted', function(e) {
                if (el === e.target && logoNode) insertFromCache();
            });

            return this;
        },
        remove: function() {
            $(window).off('resize', this.resize);
            this.setDefaultData(); // default data
            return App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        removeFromDOMTree: function() {
            $(window).off('resize', this.resize);
            return App.Views.FactoryView.prototype.removeFromDOMTree.apply(this, arguments);
        },
        /**
        * Default data.
        */
        setDefaultData: function() {
            logoNode = undefined;
            ih = undefined;
        }
    });

    function logoResize() {
        var logoCont = this.$('.store_info_main_logo'),
            cont = this.$('.logo'),
            $logo = this.$('#logo'),
            logo = $logo.get(0),
            cw = cont.width(),
            ch = cont.height();

        ih = ih ? ih : logo.height;
        logo.style.cssText = '';
        $logo.height(ih);

        if(ih >= ch) {
            logo.style.cssText = '';
            $logo.height(ch);
        }

        if($logo.width() > cw) {
            logo.style.cssText = '';
            $logo.width(cw);
        }

        logoCont.css('height', $logo.height() + this.$('.divider').height() + 'px');
        $logo.is(':hidden') && $logo.show();

        logoNode = logoCont.get(0);
    }

    return new (require('factory'))(store_info_view.initViews.bind(store_info_view), function() {
        App.Views.LogoView = LogoView;
    });
});