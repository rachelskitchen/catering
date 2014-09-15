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

define(["backbone", "factory", "store_info_view"], function(Backbone) {
    'use strict';

    var logoNode, ih;

    App.Views.LogoView = App.Views.CoreStoreInfoView.CoreStoreInfoMainView.extend({
        initialize: function() {
            this.resize = logoResize.bind(this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var self = this,
                cont = self.$('.store_info_main_logo');

            if(logoNode) {
                this.$('.store_info_main_logo').remove();
                this.$el.prepend(logoNode);
                $(window).on('resize', self.resize);
            } else {
                loadSpinner(this.$('img#logo'), false, function() {
                    self.resize();
                    $(window).on('resize', self.resize);
                });
            }

            return this;
        },
        remove: function() {
            $(window).off('resize', this.resize);
            return App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        removeFromDOMTree: function() {
            $(window).off('resize', this.resize);
            return App.Views.FactoryView.prototype.removeFromDOMTree.apply(this, arguments);
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
});