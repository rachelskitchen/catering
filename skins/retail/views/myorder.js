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
        initialize: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.attributes_update);
        },
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.render.apply(this, arguments);
            if (this.options.action === 'add') {
                this.$('.action_button > span').html(_loc['MYORDER_ADD_TO_BAG']);
            } else {
                this.$('.action_button > span').html(_loc['MYORDER_UPDATE_ITEM']);
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
            'click .action_button:not(.disabled)': 'action',
            'keydown .action_button:not(.disabled)': function(e) {
                if (this.pressedButtonIsEnter(e)) {
                    this.action();
                }
            }
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
                        var index = App.Data.myorder.indexOf(self.options.real) - 1;
                        App.Data.myorder.add(self.model, {at: index});
                        App.Data.myorder.remove(self.options.real);
                    }

                    $('#popup .cancel').trigger('click');
                }, function(errorMsg) {
                    App.Data.errors.alert(errorMsg); // user notification
                });
            } else {
                App.Data.errors.alert(check.errorMsg); // user notification
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

    var MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderItemView.prototype.render.apply(this, arguments);
            App.Settings.hide_images === true && this.$el.addClass("no_image");
            return this;
        },
        editItem: function(e) {
            e.preventDefault();
            var model = this.model,
                isStanfordItem = App.Data.is_stanford_mode && this.model.get_product().get('is_gift');

            App.Data.mainModel.set('popup', {
                modelName: 'MyOrder',
                mod: isStanfordItem ? 'StanfordItem' : 'Matrix',
                className: isStanfordItem ? 'stanford-reload-item' : '',
                model: model.clone(),
                real: model,
                action: 'update'
            });
        }/*,
        getData: function() {
            var data = App.Views.CoreMyOrderView.CoreMyOrderItemView.prototype.getData.apply(this, arguments),
                attrs = this.model.get_attributes();

            return $.extend(data, {
                attrs: attrs || []
            });
        }*/
    });

    return new (require('factory'))(myorder_view.initViews.bind(myorder_view), function() {
        App.Views.MyOrderView.MyOrderMatrixView = MyOrderMatrixView;
        App.Views.MyOrderView.MyOrderItemView = MyOrderItemView;
    });
});
