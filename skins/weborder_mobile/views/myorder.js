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

define(["backbone", "myorder_view"], function(Backbone) {
    'use strict';

    App.Views.MyOrderView.MyOrderMatrixView = App.Views.CoreMyOrderView.CoreMyOrderMatrixView.extend({
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.render.apply(this, arguments);
            var model = this.model,
                view;

            var sold_by_weight = this.model.get_product().get("sold_by_weight"),
                mod = sold_by_weight ? 'Weight' : 'Main';

            view = App.Views.GeneratorView.create('Quantity', {
                el: this.$('.quantity_info'),
                model: model,
                mod: mod
            });
            this.subViews.push(view);

            if(App.Data.settings.get('settings_system').special_requests_online) {
                view = App.Views.GeneratorView.create('Instructions', {
                    el: this.$('.product_instructions'),
                    model: model,
                    mod: 'Modifiers'
                });
                this.subViews.push(view);
            }

            return this;
        }
    });

    App.Views.MyOrderView.MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        editItem: function(e) {
            e.preventDefault();
            var index = this.model.collection.models.indexOf(this.model);
            App.Data.router.navigate('modifiers_edit/' + index, true);
        }
    });
});