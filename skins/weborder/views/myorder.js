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
        bindings: {
            'size_chart_wrapper': 'toggle: _product_size_chart',
            'a.size_chart': 'attr:{href: _product_size_chart}',
        },
        initialize: function() {
            this.extendBindingSources({_product: this.model.get_product()});
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.attributes_update);
        },
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.render.apply(this, arguments);
            if (this.options.action === 'add') {
                this.$('.action_button').html(_loc['MYORDER_ADD_ITEM']);
            } else {
                this.$('.action_button').html(_loc['MYORDER_UPDATE_ITEM']);
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

            view = App.Views.GeneratorView.create('Instructions', {
                el: this.$('.product_instructions'),
                model: model,
                mod: 'Modifiers'
            });
            this.subViews.push(view);

            if (App.Settings.special_requests_online === false) {
                view.$el.hide(); // hide special request if not allowed
            }

            $('#popup').addClass('ui-invisible');
            setTimeout(this.change_height.bind(this, 1), 20);
            this.interval = this.interval || setInterval(this.change_height.bind(this), 500); // check size every 0.5 sec
            this.$('.modifiers_table_scroll').contentarrow();
            this.attributes_update();
            return this;
        },
        events: {
            'click .action_button:not(.disabled)': 'action',
            'change_height .product_instructions': 'change_height' // if special request button pressed
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
                        App.Data.myorder.splitItemAfterQuantityUpdate(self.model, self.options.real.get('quantity'), self.model.get('quantity'));
                    }

                    $('#popup .cancel').trigger('click');
                }, function(errorMsg) {
                    App.Data.errors.alert(errorMsg); // user notification
                });
            } else {
                App.Data.errors.alert(check.errorMsg); // user notification
            }
        },
        change_height: function(e) {
            var prev_height = this.prev_height || 0,
                inner_height = $('#popup').outerHeight(),
                prev_window = this.prev_window || 0,
                window_heigth = $(window).height();

            if (e || prev_height !== inner_height || prev_window !== window_heigth) {
                var el = this.$('.modifiers_table_scroll'),
                    wrapper_height,

                    product = this.$('.product_info').outerHeight(),
                    special = this.$('.instruction_block').outerHeight(),
                    size = this.$('.quantity_info').outerHeight();

                el.height('auto');
                inner_height = $('#popup').outerHeight();
                wrapper_height = $('.popup_wrapper').height();

                if (wrapper_height < inner_height) {
                        var height = wrapper_height - product - special - size - 117;
                    el.height(height);
                }

                inner_height = $('#popup').outerHeight();
                this.prev_height = inner_height;
                this.prev_window = window_heigth;
                $('#popup').removeClass('ui-invisible');
            }
        },
        remove: function() {
            this.$('.modifiers_table_scroll').contentarrow('destroy');
            clearInterval(this.interval);
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.remove.apply(this, arguments);
        }
    });

    var MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
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
        }
    });

    var MyOrderItemSpecialView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'itemSpecial',
        render: function() {
            var model = {
                name: this.model.get_product().get('name'),
                special: this.model.get_special()
            };
            this.$el.html(this.template(model));
        }
    });

    return new (require('factory'))(myorder_view.initViews.bind(myorder_view), function() {
        App.Views.MyOrderView.MyOrderMatrixView = MyOrderMatrixView;
        App.Views.MyOrderView.MyOrderItemView = MyOrderItemView;
        App.Views.MyOrderView.MyOrderItemSpecialView = MyOrderItemSpecialView;
    });
});
