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

    var MyOrderMatrixView = _MyOrderMatrixView( CoreViews.CoreMyOrderMatrixView )
                                                    .mixed( DynamicHeightHelper_Modifiers );
    function _MyOrderMatrixView(_base){ return _base.extend({
        render: function() {
            _base.prototype.render.apply(this, arguments);
            this.renderProductFooter();
            this.dh_initialize();
            return this;
        }
      })
    };

    function DynamicHeightHelper(_base_proto) {
      return {
        dh_initialize: function() {
            $('#popup').addClass('ui-invisible');
            setTimeout(this.dh_change_height.bind(this, 1), 20);
            this.interval = this.interval || setInterval(this.dh_change_height.bind(this), 500); // check size every 0.5 sec
            this.$('.modifiers_table_scroll').contentarrow(undefined, true); // 2nd param is doNotUpdateScrollTop
        },
        events: {
            'change_height .product_instructions': 'dh_change_height' // if special request button pressed
        },
        dh_change_height: function(e) {
            var prev_popup_height = this.prev_popup_height || 0,
                popup_height = $('#popup').outerHeight(),
                prev_window_height = this.prev_window_height || 0,
                window_heigth = $(window).height();
            if (this.is_hidden == true ){
                //don't change size for cached view which was temporary closed
                return;
            }
            if (e || prev_popup_height !== popup_height || prev_window_height !== window_heigth) {
                var el = this.$('.modifiers_table'),
                    product = this.$('.product_info').outerHeight(true),
                    footer = this.$('.product_info_footer').outerHeight(true),
                    prev_el_scroll = el.get(0).scrollTop,
                    el_paddings = parseInt(el.css('padding-top')) + parseInt(el.css('padding-bottom')); // Bug 44157

                el.css('max-height', (popup_height - product - footer - el_paddings) + 'px');

                // Bug 37299. Handle scrollTop update here instead of inside $.contentarrow
                if (prev_el_scroll > 0) {
                    el.get(0).scrollTop = prev_el_scroll;
                }

                this.prev_popup_height = popup_height;
                this.prev_window_height = window_heigth;

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

    var MyOrderMatrixComboView = _MyOrderMatrixComboView( CoreViews.CoreMyOrderMatrixComboView )
                                                         .mixed( DynamicHeightHelper_Combo );
    function _MyOrderMatrixComboView(_base){ return _base.extend({
        render: function() {
            _base.prototype.render.apply(this, arguments);
            this.renderProductFooter();
            this.dh_initialize();
            return this;
        }
      })
    };

    var MyOrderItemView = _MyOrderItemView( App.Views.CoreMyOrderView.CoreMyOrderItemView );
    var MyOrderItemComboView = _MyOrderItemView( App.Views.CoreMyOrderView.CoreMyOrderItemComboView );
    var MyOrderItemUpsellView = _MyOrderItemView( App.Views.CoreMyOrderView.CoreMyOrderItemUpsellView );

    function _MyOrderItemView(_base){ return _base.extend({
        editItem: function(event) {
            event.preventDefault();
            var self = this,
                model = this.model,
                isStanfordItem = App.Data.is_stanford_mode && this.model.get_product().get('is_gift');

            var combo_based = model.isComboBased();

            var cache_id = combo_based ? model.get("id_product") : undefined;

            App.Data.mainModel.set('popup', {
                modelName: 'MyOrder',
                mod: isStanfordItem ? 'StanfordItem' : (combo_based ? 'MatrixCombo' : 'Matrix'),
                className: isStanfordItem ? 'stanford-reload-item' : '',
                model: model.clone(),
                real: model,
                action: 'update',
                init_cache_session: combo_based ? true : false,
                cache_id: combo_based ? cache_id : undefined //cache is enabled for combo products during the phase of product customization only
                                                          //the view will be removed from cache after the product is added/updated into the cart.
            });
        }
      })
    }

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

    var MyOrderMatrixFooterView = App.Views.CoreMyOrderView.CoreMyOrderMatrixFooterView.extend({
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixFooterView.prototype.render.apply(this, arguments);

            var view = App.Views.GeneratorView.create('Product', {
                el: this.$('.product_price'),
                model: this.model,
                mod: 'Price'
            });

            this.subViews.push(view);

            return this;
        }
    });

    return new (require('factory'))(myorder_view.initViews.bind(myorder_view), function() {
        App.Views.MyOrderView.MyOrderMatrixView = MyOrderMatrixView;
        App.Views.MyOrderView.MyOrderMatrixComboView = MyOrderMatrixComboView;
        App.Views.MyOrderView.MyOrderItemView = MyOrderItemView;
        App.Views.MyOrderView.MyOrderItemComboView = MyOrderItemComboView;
        App.Views.MyOrderView.MyOrderItemUpsellView = MyOrderItemUpsellView;
        App.Views.MyOrderView.MyOrderItemSpecialView = MyOrderItemSpecialView;
        App.Views.MyOrderView.MyOrderMatrixFooterView = MyOrderMatrixFooterView;
    });
});
