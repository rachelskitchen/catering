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
        showModifiers: function(event, status) {
            var isStanfordItem = App.Data.is_stanford_mode && this.model.get('is_gift'),
                combo_based = this.model.isComboBased() && status != 'No_Combo',
                has_upsell = this.model.isUpsellProduct();

            var myorder = App.Models.create(combo_based ? (has_upsell ? 'MyorderUpsell' : 'MyorderCombo') : 'Myorder');

            var def = myorder.add_empty(this.model.get('id'), this.model.get('id_category'));

            $('#main-spinner').css('font-size', App.Data.getSpinnerSize() + 'px').addClass('ui-visible');
            def.then(function() {
                var cache_id = combo_based ? myorder.get("id_product") : undefined;
                var clone = myorder.clone();
                if (status == 'No_Combo') {
                    clone.get('product').set('has_upsell', false, {silent: true});
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

    var ProductPriceView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'price',
        initialize: function() {
            this.extendBindingSources({_product: this.model.get_product()});
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.price': 'classes: {"gift-amount": giftMode, "product-price": not(giftMode)}, attr: {size: length(monetaryFormat(product_price)), readonly: not(giftMode)}, restrictInput: "0123456789.,", kbdSwitcher: select(_product_is_gift, "float", "text"), pattern: /^\\d{0,3}(\\.\\d{0,2})?$/',
            '.product-price': 'value: monetaryFormat(product_price)',
            '.gift-amount': 'value: monetaryFormat(price), events: ["input"]',
            '.currency': 'text: _system_settings_currency_symbol',
            '.uom': 'text: uom, toggle: uom',
            '.price-wrapper': 'attr: {"data-amount": monetaryFormat(product_price)}, classes: {"product-price-wrapper": not(giftMode)}'
        },
        computeds: {
            giftMode: {
                deps: ['_product_is_gift', '_system_settings_online_orders'],
                get: function(isGift, onlineOrders) {
                    var modifiers = this.model.get_modifiers(),
                        not_size = modifiers && modifiers.getSizeModel() === undefined;
                    return isGift && onlineOrders && not_size;
                }
            },
            uom: {
                deps: ['_system_settings_scales', '_product_sold_by_weight'],
                get: function(scales, sold_by_weight) {
                    return scales.default_weighing_unit && sold_by_weight ? '/ ' + scales.default_weighing_unit : false;
                }
            },
            product_price: {
                deps: ['initial_price', '_product_combo_price'],
                get: function() {
                    return this.model.get_product_price();
                }
            },
            price: {
                deps: ['product'],
                get: function() {
                    return this.model.get_product().get('price');
                },
                set: function(value) {
                    var product = this.model.get_product();

                    value = parseFloat(value);
                    if(!isNaN(value)) {
                        product.set('price', value);
                        //this.model.set('initial_price', value);
                    } else {
                        this.model.trigger('change:initial_price');
                    }
                }
            }
        }
    });

    return new (require('factory'))(products_view.initViews.bind(products_view), function() {
        App.Views.ProductView.ProductListItemView = ProductListItemView;
        App.Views.ProductView.ProductPriceView = ProductPriceView;
    });
});
