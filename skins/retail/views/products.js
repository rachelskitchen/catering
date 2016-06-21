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

define(["products_view"], function(products_view) {
    'use strict';

    var ProductListItemView = App.Views.CoreProductView.CoreProductListItemView.extend({
        tagName: 'li',
        className: 'product-item',
        bindings: {
            ':el': 'attr: {tabindex: 0}, classes: {hide: not(filterResult)}'
        }
    });

    var ProductListView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'list',
        itemView: ProductListItemView,
        bindings: {
            '.products-set-title': 'text: name',
            '.products': 'collection: $collection, itemView: "itemView"',
            '.loading': 'toggle: equal(status, "pending")'
        }
    });

    var ProductCategoryListView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'category_list',
        bindings: {
            ':el': 'updateContent: productSet'
        },
        computeds: {
            productSet: {
                deps: ['value'],
                get: function(value) {
                    return {
                        name: 'Product',
                        mod: 'List',
                        model: value,
                        collection: value.get('products'),
                        viewId: value.id,
                        subViewIndex: 0
                    };
                }
            }
        }
    });

    var ProductImagesView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'images',
        events: {
            'click .thumbnail': 'showImage'
        },
        onEnterListeners: {
            '.thumbnail': 'showImage'
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            loadSpinner(this.$('.img'));
            this.showImage({
                currentTarget: this.$('.images > li:first')
            });

            return this;
        },
        showImage: function(event) {
            var images = this.model.get('images'),
                li = $(event.currentTarget),
                index = li.attr('data-index'),
                image = this.$('.large');
            image.attr('src', images[index]);
            loadSpinner(image);
            this.$('.images > li').removeClass('active');
            li.addClass('active');
        }
    });

    var ProductTitleView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'title',
        bindings: {
            '.price': 'text: select(product_sold_by_weight, weightFormat(initial_price), currencyFormat(initial_price))',
            '.name': 'text: product_name'
        }
    });

    var ProductDescriptionView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'description'
    });

    var ProductGiftCardReloadView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'gift_card_reload',
        bindings: {
            '.amount': 'value: monetaryFormat(price), events: ["change"], trackCaretPosition: price, restrictInput: "0123456789.,", kbdSwitcher: "float", pattern: /^\\d{0,3}(\\.\\d{0,2})?$/',
            '.card-number': 'value: gift_card_number, events: ["input"], restrictInput: "0123456789-", kbdSwitcher: "cardNumber", pattern: /^[\\d|-]{0,19}$/',
            '.logo': 'attr: {style: showLogo(_system_settings_logo_img)}',
            '.action_button': 'classes: {disabled: any(not(decimal(price)), not(gift_card_number))}'
        },
        bindingFilters: {
            showLogo: function(url) {
                if (typeof url != 'string') {
                    return '';
                }
                return 'background-image: url(%s);'.replace('%s', url);
            }
        }
    });

    return new (require('factory'))(products_view.initViews.bind(products_view), function() {
        App.Views.ProductView.ProductListItemView = ProductListItemView;
        App.Views.ProductView.ProductListView = ProductListView;
        App.Views.ProductView.ProductCategoryListView = ProductCategoryListView;
        App.Views.ProductView.ProductImagesView = ProductImagesView;
        App.Views.ProductView.ProductTitleView = ProductTitleView;
        App.Views.ProductView.ProductDescriptionView = ProductDescriptionView;
        App.Views.ProductView.ProductGiftCardReloadView = ProductGiftCardReloadView;
    });
});
