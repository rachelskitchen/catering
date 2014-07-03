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

define(["backbone", "factory", "generator", "store_info_view"], function(Backbone) {
    'use strict';

    App.Views.StoreInfoView = {};

    App.Views.StoreInfoView.StoreInfoAboutView = App.Views.FactoryView.extend({
        name: 'store_info',
        mod: 'about',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.$('.gallery').gallery({
                images: this.model.get('images'),
                animate: true,
                circle: true
            });
            loadSpinner(this.$('.about-image'));
            this.$('.about_content').contentarrow();
            return this;
        },
        remove: function() {
            this.$('.about_content').contentarrow('destroy');
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        }
    });

    App.Views.StoreInfoView.StoreInfoMapView = App.Views.CoreStoreInfoView.CoreStoreInfoMainView.extend({
        name: 'store_info',
        mod: 'map',
        render: function() {
            this.model = new Backbone.Model(this.infoDetailed());
            App.Views.CoreStoreInfoView.CoreStoreInfoMainView.prototype.render.apply(this, arguments);
            this.map(true, true, true);
            this.$('.info_map_wrapper').contentarrow();
        }
    });
});