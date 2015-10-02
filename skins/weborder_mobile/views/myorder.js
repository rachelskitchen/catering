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

define(["myorder_view"], function(myorder_view) {
    'use strict';

    var MyOrderMatrixView = App.Views.CoreMyOrderView.CoreMyOrderMatrixView.extend({
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

            if(App.Settings.special_requests_online) {
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

    var MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        editItem: function(e) {
            e.preventDefault();
            var index = this.model.collection.models.indexOf(this.model);
            App.Data.router.navigate('modifiers/' + index, true);
        }
    });

    var MyOrderListView = App.Views.CoreMyOrderView.CoreMyOrderListView.extend({
        bindings: {
            ':el': 'toggle: items'
        },
        computeds: {
            items: function() {
                return this.getBinding('$collection').get_only_product_quantity();
            }
        }
    });

    var MyOrderStanfordItemView = App.Views.CoreMyOrderView.CoreMyOrderStanfordItemView.extend({
        name: 'myorder',
        mod: 'stanford_item',
        bindings: {
            '.initial-price': App.Views.CoreMyOrderView.CoreMyOrderStanfordItemView.prototype.bindings['.initial-price'],
            '.next': App.Views.CoreMyOrderView.CoreMyOrderStanfordItemView.prototype.bindings['.next'],
            '.view-2': App.Views.CoreMyOrderView.CoreMyOrderStanfordItemView.prototype.bindings['.view-2']
        },
        events: {
            'click .next': 'next'
        },
        hasPlans: function() {
            var stanfordCard = this.model.get('stanfordCard');
            return stanfordCard.get('validated') && stanfordCard.get('plans').length;
        },
        // override parent's update method to avoid re-rendering
        update: new Function()
    });

    return new (require('factory'))(myorder_view.initViews.bind(myorder_view), function() {
        App.Views.MyOrderView.MyOrderListView = MyOrderListView;
        App.Views.MyOrderView.MyOrderMatrixView = MyOrderMatrixView;
        App.Views.MyOrderView.MyOrderItemView = MyOrderItemView;
        App.Views.MyOrderView.MyOrderStanfordItemView = MyOrderStanfordItemView;
    });
});