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

    App.Views.HeaderView = {};

    App.Views.HeaderView.HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        initialize: function() {
            this.listenTo(this.model, 'change:menu_index', this.menu, this);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            var view = new App.Views.GeneratorView.create('Categories', {
                collection: this.collection,
                mod: 'Tabs',
                el: this.$('.categories')
            });
            this.subViews.push(view);
            loadSpinner(this.$('img.logo'));
            return this;
        },
        events: {
            'click .shop': 'onMenu',
            'click .about': 'onAbout',
            'click .locations': 'onLocations'
        },
        menu: function(model, value) {
            var menu = this.$('.menu li');
            menu.removeClass('active');
            menu.eq(value).addClass('active');
        },
        onMenu: function() {
            this.model.trigger('onShop');
        },
        onAbout: function() {
            this.model.trigger('onAbout');
        },
        onLocations: function() {
            this.model.trigger('onLocations');
        }
    });

    App.Views.HeaderView.HeaderConfirmationView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'confirmation'
    });
});