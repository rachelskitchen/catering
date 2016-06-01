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
        showModifiers: function(event, options) {
            var isStanfordItem = App.Data.is_stanford_mode && this.model.get('is_gift'),
                no_combo = _.isObject(options) ? options.no_combo : false,
                combo_based = this.model.isComboBased() && !no_combo,
                has_upsell = this.model.isUpsellProduct();

            var myorder = App.Models.create(combo_based ? (has_upsell ? 'MyorderUpsell' : 'MyorderCombo') : 'Myorder');

            var def = myorder.add_empty(this.model.get('id'), this.model.get('id_category'));

            $('#main-spinner').css('font-size', App.Data.getSpinnerSize() + 'px').addClass('ui-visible');
            def.then(function() {
                var cache_id = combo_based ? myorder.get("id_product") : undefined;
                var clone = myorder.clone();
                if (no_combo) {
                    clone.get('product').set('has_upsell', false, {silent: true});
                }
                if (no_combo && options.combo_root) {
                    clone.get_modifiers().update(options.combo_root.get_modifiers());
                }

                $('#main-spinner').removeClass('ui-visible');
                App.Data.mainModel.set('popup', {
                    modelName: 'MyOrder',
                    mod: isStanfordItem ? 'StanfordItem' : (combo_based ? 'MatrixCombo' : 'Matrix'),
                    className: isStanfordItem ? 'stanford-reload-item' : '',
                    model: clone,
                    action: 'add',
                    init_cache_session: combo_based ? true : false,
                    cache_id: combo_based ? cache_id : undefined //cache is enabled for combo products during the phase of product customization only
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
