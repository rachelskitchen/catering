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

define(['products_view'], function(products_view) {
    'use strict';

    var ProductListItemView = App.Views.CoreProductView.CoreProductListItemView.extend({
        showModifiers: function() {
            var myorder = new App.Models.Myorder(),
                isStanfordItem = App.Data.is_stanford_mode && this.model.get('is_gift'),
                is_combo = this.model.get('is_combo');

            var def = myorder.add_empty(this.model);

            $('#main-spinner').css('font-size', App.Data.getSpinnerSize() + 'px').addClass('ui-visible');
            def.then(function() {
                var cache_id = is_combo ? myorder.get("id_product") : undefined;

                $('#main-spinner').removeClass('ui-visible');
                App.Data.mainModel.set('popup', {
                    modelName: 'MyOrder',
                    mod: isStanfordItem ? 'StanfordItem' : (is_combo ? 'MatrixCombo' : 'Matrix'),
                    className: isStanfordItem ? 'stanford-reload-item' : '',
                    model: myorder.clone(),
                    action: 'add',
                    init_cache_session: is_combo ? true : false,
                    cache_id: is_combo ? cache_id : undefined //cache is enabled for combo products during the phase of product customization only
                                                              //the view will be removed from cache after the product is added/updated into the cart.
                });
            });
        },
        show_hide: function() {
            this.parent = this.parent && this.parent.length ? this.parent : this.$el.parent();
            if (!this.model.get('active')) {
                this.$el.detach();
            } else {
                this.parent.append(this.$el);
            }
        }
    });

    return new (require('factory'))(products_view.initViews.bind(products_view), function() {
        App.Views.ProductView.ProductListItemView = ProductListItemView;
    });
});
