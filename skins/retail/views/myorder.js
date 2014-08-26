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
        initialize: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.attributes_update);
        },
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.render.apply(this, arguments);
            if (this.options.action === 'add') {
                this.$('.action_button').html('Add to Bag');
            } else {
                this.$('.action_button').html('Update Item');
            }
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

            this.attributes_update();
            return this;
        },
        events: {
            'click .action_button:not(.disabled)': 'action'
        },
        attributes_update: function() {
            if (this.model.get('product').check_selected()) {
                this.$('.action_button').removeClass('disabled');
            }
            else {
                this.$('.action_button').addClass('disabled');
            }
        },
        action: function (event) {
            var check = this.model.check_order(),
                self = this;

            if (check.status === 'OK') {
                this.model.get_product().check_gift(function() {
                    if (self.options.action === 'add') {
                        App.Data.myorder.add(self.model);
                    } else {
                        var index = App.Data.myorder.indexOf(self.model) - 1;
                        App.Data.myorder.remove(self.options.real);
                        App.Data.myorder.add(self.model, {at: index});
                    }

                    $('#popup .cancel').trigger('click');
                }, function(errorMsg) {
                    App.Data.errors.alert(errorMsg);
                });
            } else {
                App.Data.errors.alert(check.errorMsg);
            }
        },
        check: function () {
            var check = this.model.check_order(),
                self = this;

            if (check.status === 'OK') {
                this.model.get_product().check_gift(function() {
                    if (self.options.action === 'add') {
                        App.Data.myorder.add(self.model);
                    } else {
                        var index = App.Data.myorder.indexOf(self.model) - 1;
                        App.Data.myorder.remove(self.options.real);
                        App.Data.myorder.add(self.model, {at: index});
                    }

                    $('#popup .cancel').trigger('click');
                }, function(errorMsg) {
                    App.Data.errors.alert(errorMsg);
                });
            } else {
                App.Data.errors.alert(check.errorMsg);
            }
        },
        renderModifiers: function() {
            var model = this.model,
                product = model.get('product'),
                viewModifiers;

            if(product && product.isParent()) {
                viewModifiers =  App.Views.GeneratorView.create('ModifiersClasses', {
                        el: this.$('.product_attribute_info'),
                        model: model,
                        mod: 'Matrixes',
                        modifiersEl: this.$('.modifiers_info')
                    });
                this.subViews.push(viewModifiers);
            }
        }
    });

    App.Views.MyOrderView.MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderItemView.prototype.render.apply(this, arguments);
            // need hide logo for bag charge (bug Bug 12073)
            this.options.collection.bagChargeItem === this.model && this.$('img.logo').hide();
            return this;
        },
        editItem: function(e) {
            e.preventDefault();
            var model = this.model;
            App.Data.mainModel.set('popup', {
                    modelName: 'MyOrder',
                    mod: 'Matrix',
                    model: model.clone(),
                    real: model,
                    action: 'update'
                });
        },
        getData: function() {
            var data = App.Views.CoreMyOrderView.CoreMyOrderItemView.prototype.getData.apply(this, arguments),
                attrs = this.model.get_attributes();

            return $.extend(data, {
                attrs: attrs || []
            });
        }
    });
});
