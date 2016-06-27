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

    var MyOrderMatrixView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'matrix',
        bindings: {
            '.action_button': 'classes: {disabled: not(attributesSelected)}, text: select(ui_isAddMode, _lp_MYORDER_ADD_TO_BAG, _lp_MYORDER_UPDATE_ITEM)',
            '.right-side': 'classes: {"no-images": _system_settings_hide_images}',
            '.product_attribute_info': 'updateContent: attrsViewData',
            '.product_images': 'updateContent: imagesViewData',
            '.product_title': 'updateContent: titleViewData',
            '.product_desc': 'updateContent: descViewData',
            '.quantity_info': 'updateContent: qtyViewData',
        },
        computeds: {
            'attributesSelected': {
                deps: ['product_attribute_1_selected', 'product_attribute_2_selected'],
                get: function() {
                    return this.getBinding('$product').check_selected();
                }
            },
            imagesViewData: {
                deps: ['_system_settings_hide_images', 'attributesSelected'],
                get: function(hide_images) {
                    if (!hide_images) {
                        return {
                            name: 'Product',
                            mod: 'Images',
                            model: this.model.get_product(),
                            subViewIndex: 0
                        };
                    }
                }
            },
            titleViewData: {
                deps: ['attributesSelected'],
                get: function() {
                    return {
                        name: 'Product',
                        mod: 'Title',
                        model: this.model,
                        product: this.model.get_product(),
                        subViewIndex: 1
                    };
                }
            },
            attrsViewData: {
                get: function() {
                    var product = this.model.get('product');
                    if(product && product.isParent()) {
                        return {
                            name: 'ModifiersClasses',
                            mod: 'Matrixes',
                            model: this.model,
                            subViewIndex: 2,
                            modifiersEl: this.$('.modifiers_info')
                        };
                    }
                }
            },
            qtyViewData: {
                deps: ['attributesSelected'],
                get: function() {
                    return {
                        name: 'Quantity',
                        mod: this.model.get_product().get("sold_by_weight") ? 'Weight' : 'Main',
                        model: this.model,
                        subViewIndex: 3
                    };
                }
            },
            descViewData: {
                deps: ['_system_settings_hide_products_description', 'attributesSelected'],
                get: function(hide_products_description) {
                    var product = this.model.get_product(),
                        index = 4;
                    if (!hide_products_description && product.get('description')) {
                        return {
                            name: 'Product',
                            mod: 'Description',
                            model: product,
                            subViewIndex: index
                        };
                    } else if (this.subViews[index]) {
                        this.subViews[index].remove();
                    }
                }
            }
        },
        events: {
            'click .action_button:not(.disabled)': addCb('action')
        },
        onEnterListeners: {
            '.action_button:not(.disabled)': addCb('action')
        }
    });

    var MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        bindings: {
            ':el': 'classes: {"order-item": not(isServiceFee), "service-fee-item": isServiceFee}',
            '.sub-box': 'classes: {"left-offset": not(_system_settings_hide_images)}',
            '.name': 'classes: {"left-offset": select(isServiceFee, false, not(_system_settings_hide_images))}'
        },
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderItemView.prototype.render.apply(this, arguments);

            var product = this.model.get_product(),
                view = App.Views.GeneratorView.create('Quantity', {
                    el: this.$('.qty-box'),
                    mod: product.get('sold_by_weight') ? 'Weight' : 'Main',
                    model: this.model,
                    className: 'inline-block'
                });
            this.subViews.push(view);

            this.applyBindings();
            return this;
        },
        editItem: function() {
            this.model.trigger('onItemEdit', this.model);
        }
    });

    var MyOrderDiscountView = App.Views.CoreMyOrderView.CoreMyOrderDiscountView.extend({
        bindings: {
            ':el': 'classes: {"discount-item": true}'
        }
    });

    var MyOrderItemGiftCardView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'item_gift_card',
        bindings: {
            ':el': 'classes: {"order-item": true, "giftcard-item": true, "primary-border": true}',
            '.item-sum': 'text: format("+$1", currencyFormat(initial_price))',
            '.logo': 'attr: {style: showLogo(_system_settings_logo_img)}',
            '.card-number': 'text: product_gift_card_number'
        },
        bindingFilters: {
            showLogo: function(url) {
                if (typeof url != 'string') {
                    return '';
                }
                return 'background-image: url(%s);'.replace('%s', url);
            }
        },
        events: {
            'click .remove': "removeItem",
            'click .edit': "editItem"
        },
        onEnterListeners: {
            '.remove': "removeItem",
            '.edit': "editItem"
        },
        initialize: function() {
            _.extend(this.bindingSources, {
                product: this.model.get_product()
            });
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        editItem: function() {
            this.model.trigger('onItemEdit', this.model);
        },
        removeItem: function() {
            this.collection.remove(this.model);
        }
    });

    var MyOrderListView = App.Views.CoreMyOrderView.CoreMyOrderListView.extend({
        resolveItemMod: function(model) {
            if (model.is_gift()) {
                return 'ItemGiftCard';
            } else {
                return App.Views.CoreMyOrderView.CoreMyOrderListView.prototype.resolveItemMod.apply(this, arguments);
            }
        }
    });

    var MyOrderItemCustomizationView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'item_customization',
        bindings: {
            ':el': 'updateContent: viewData'
        },
        computeds: {
            viewData: {
                get: function() {
                    var product = this.model.get_product(),
                        data = _.extend({
                            subViewIndex: 0
                        }, this.options);

                    if (product.get('is_gift')) {
                        return _.extend(data, {
                            name: 'Product',
                            mod: 'GiftCardReload',
                            model: product,
                            className: 'gift-card-reload'
                        });
                    } else {
                        return _.extend(data, {
                            name: 'MyOrder',
                            mod: 'Matrix',
                            model: this.model,
                            product: this.model.get('product')
                        });
                    }
                }
            }
        },
        events: {
            'click .cancel': addCb('back')
        },
        onEnterListeners: {
            '.cancel': addCb('back')
        }
    });

    function addCb(prop) {
        return function() {
            var cb = this.options[prop];
            typeof cb == 'function' && cb();
        };
    }

    return new (require('factory'))(myorder_view.initViews.bind(myorder_view), function() {
        App.Views.MyOrderView.MyOrderMatrixView = MyOrderMatrixView;
        App.Views.MyOrderView.MyOrderItemView = MyOrderItemView;
        App.Views.MyOrderView.MyOrderItemCustomizationView = MyOrderItemCustomizationView;
        App.Views.MyOrderView.MyOrderDiscountView = MyOrderDiscountView;
        App.Views.MyOrderView.MyOrderItemGiftCardView = MyOrderItemGiftCardView;
        App.Views.MyOrderView.MyOrderListView = MyOrderListView;
    });
});
