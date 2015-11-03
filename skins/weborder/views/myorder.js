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

    var CoreViews = App.Views.CoreMyOrderView;

    var DynamicHeightHelper_Modifiers = DynamicHeightHelper(CoreViews.CoreMyOrderMatrixView.prototype);

    var MyOrderMatrixView = CoreViews.CoreMyOrderMatrixView.extend(_.extend(DynamicHeightHelper_Modifiers, {
        initialize: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.attributes_update);
        },
        render: function() {
            CoreViews.CoreMyOrderMatrixView.prototype.render.apply(this, arguments);
            this.renderProductFooter();
            this.dh_initialize();
            return this;
        },
        renderProductFooter: function() {
            var model = this.model,
                product = this.model.get("product");

            var view = App.Views.GeneratorView.create('MyOrder', {
                el: this.$(".product_info_footer"),
                model: this.model,
                mod: 'MatrixFooter',
                action: this.options.action,
                real: this.options.real
            });
            this.subViews.push(view);
        },
        attributes_update: function() {
            this.model.trigger("change_child_selected");
        }
    }));

    function DynamicHeightHelper(_base_proto) {
      return {
        dh_initialize: function() {
            $('#popup').addClass('ui-invisible');
            setTimeout(this.dh_change_height.bind(this, 1), 20);
            this.interval = this.interval || setInterval(this.dh_change_height.bind(this), 500); // check size every 0.5 sec
            this.$('.modifiers_table_scroll').contentarrow();
        },
        events: _.extend({}, _base_proto.events, {
            'change_height .product_instructions': 'dh_change_height' // if special request button pressed
        }),
        dh_change_height: function(e) {
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
            _base_proto.remove.apply(this, arguments);
        }
      }
    }

    var DynamicHeightHelper_Combo = DynamicHeightHelper(CoreViews.CoreMyOrderMatrixComboView.prototype);

    var MyOrderMatrixComboView = CoreViews.CoreMyOrderMatrixComboView.extend(_.extend(DynamicHeightHelper_Combo, {
        render: function() {
            CoreViews.CoreMyOrderMatrixComboView.prototype.render.apply(this, arguments);
            this.renderProductFooter();
            this.dh_initialize();
            return this;
        },
        renderProductFooter: function() {
            var model = this.model,
                product = this.model.get("product");

            var view = App.Views.GeneratorView.create('MyOrder', {
                el: this.$(".product_info_footer"),
                model: this.model,
                mod: 'MatrixFooter',
                action: this.options.action,
                real: this.options.real
            });
            this.subViews.push(view);
        }
    }));

    //TBD: review this: -----------------------------------------------
    Backbone.inherit = function(_base_class, new_proto) {
        var new_class =  _base_class.extend(new_proto);
        new_class.prototype.events =  _.extend({}, _base_class.prototype.events, new_proto.events);
        new_class.prototype.bindings =  _.extend({}, _base_class.prototype.bindings, new_proto.bindings);
        return new_class;
    }

    var Test_BaseView = (function(_base){ return Backbone.inherit(_base, {
            render: function() {
                _base.render.apply(this, arguments);
            },
            events: {
                "change .test_1":  "render"
            }
        });
    })(App.Views.FactoryView);

    var Test_View2 = (function(_base){ return Backbone.inherit(_base, {
            render: function() {
                _base.render.apply(this, arguments);
            },
            events: {
                "change .test_2":  "render"
            }
        });
    })(Test_BaseView); // -----------------------------------------------------

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
        App.Views.MyOrderView.MyOrderMatrixComboView = MyOrderMatrixComboView;
        App.Views.MyOrderView.MyOrderItemView = MyOrderItemView;
        App.Views.MyOrderView.MyOrderItemSpecialView = MyOrderItemSpecialView;
        App.Views.Test_BaseView = Test_BaseView;
        App.Views.Test_View2 = Test_View2;
    });
});
