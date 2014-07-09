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

define(["backbone", "factory", "generator"], function(Backbone) {
    'use strict';

    App.Views.CoreMyOrderView = {};

    App.Views.CoreMyOrderView.CoreMyOrderModifierView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'modifier',
        render: function() {
            var model = this.model.toJSON();
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            model.price = round_monetary_currency(this.model.get('order_price'));
            this.$el.html(this.template(model));
            return this;
        }
    });

    App.Views.CoreMyOrderView.CoreMyOrderMatrixView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'matrix',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            var model = this.model;
            this.renderProduct();
            this.listenTo(model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.update);
            this.renderModifiers();
            return this;
        },
        update: function() {
            var index = this.subViews.indexOf(this.viewProduct);
            if (index !== -1) {
                this.viewProduct.remove();
                this.subViews[index] = this.viewProduct = App.Views.GeneratorView.create('Product', {
                    modelName: 'Product',
                    model: this.model,
                    mod: 'Modifiers'
                });
                this.$('.product_info').append(this.viewProduct.el);
            }
        },
        renderProduct: function() {
            var model = this.model;
            this.viewProduct = App.Views.GeneratorView.create('Product', {
                modelName: 'Product',
                model: model,
                mod: 'Modifiers'
            });
            this.$('.product_info').append(this.viewProduct.el);
            this.subViews.push(this.viewProduct);
        },
        renderModifiers: function() {
            var model = this.model,
                viewModifiers;

            switch(model.get_attribute_type()) {
                case 0:
                case 2:
                    var el = $('<div></div>');
                    this.$('.modifiers_info').append(el);
                    viewModifiers =  App.Views.GeneratorView.create('ModifiersClasses', {
                        el: el,
                        model: model,
                        mod: 'List'
                    });
                    break;
                case 1:
                    viewModifiers =  App.Views.GeneratorView.create('ModifiersClasses', {
                        el: this.$('.product_attribute_info'),
                        model: model,
                        mod: 'Matrixes',
                        modifiersEl: this.$('.modifiers_info')
                    });
            }
            this.subViews.push(viewModifiers);
        }
    });

    App.Views.CoreMyOrderView.CoreMyOrderItemView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'item',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.update);
        },
        render: function() {
            var self = this, num_digits,
                model = this.model.toJSON(),
                modifiers = this.model.get_modifiers(),
                product = this.model.get_product(),
                sizeModifier = modifiers ? modifiers.getSizeModel() : null;

            model.sizeModifier = sizeModifier ? sizeModifier.get('name') : '';
            model.name = product.get('name');
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;
            model.initial_price = round_monetary_currency(this.model.get('initial_price'));
            model.price_sum = round_monetary_currency(this.model.get('sum'));
            model.price_length = round_monetary_currency(model.price_sum).length;
            model.uom = App.Data.settings.get("settings_system").scales.default_weighing_unit;//    product.get('uom');
            model.is_gift = product.get('is_gift');
            model.gift_card_number = product.get('gift_card_number');
            model.sold_by_weight = model.product.get("sold_by_weight");
            model.label_manual_weights = App.Data.settings.get("settings_system").scales.label_for_manual_weights;
            model.image = product.get_product().get('image');
            model.id = product.get_product().get('id');
            if (model.sold_by_weight) {
                num_digits = App.Data.settings.get("settings_system").scales.number_of_digits_to_right_of_decimal;
                model.weight = model.weight.toFixed(num_digits);
            }

            this.$el.html(this.template(model));

            modifiers && modifiers.each(function(modifier) {
                if(modifier.get('admin_modifier') && (modifier.get('admin_mod_key') == 'SPECIAL' || modifier.get('admin_mod_key') == 'SIZE'))
                    return;
                var selected = modifier.get('modifiers').where({selected: true});
                selected.forEach(function(modifier) {
                    var view = App.Views.GeneratorView.create('MyOrder', {
                        el: $('<li></li>'),
                        mod: 'Modifier',
                        model: modifier
                    });
                    self.subViews.push(view);
                    view.$el.addClass('s' + (round_monetary_currency(modifier.get('price')).length + 1));

                    self.$('ul').append(view.el);
                });
            });

            return this;
        },
        events: {
            'click .remove': "removeItem",
            'click .edit': "editItem"
        },
        removeItem: function(e) {
            e.preventDefault();
            this.collection.remove(this.model);
        },
        editItem: function(e) {
            e.preventDefault();
        },
        update: function() {
            this.subViews.remove();
            this.render();
        }
    });

    App.Views.CoreMyOrderView.CoreMyOrderListView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'list',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'add', this.addItem, this);
            this.listenTo(this.collection, 'remove', this.removeItem, this);
        },
        render: function() {
            this.$el.html(this.template());
            this.collection.each(this.addItem.bind(this));
        },
        addItem: function(model) {
            if(this.collection.deliveryItem === model)
                return;
            var bag_charge = this.collection.get_bag_charge();

            var view = App.Views.GeneratorView.create('MyOrder', {
                mod: 'Item',
                model: model,
                el: $('<li></li>'),
                collection: this.collection
            });

            if (model === App.Data.myorder.bagChargeItem) {
                this.bagChargeItemView = view;
                if (this.subViews.indexOf(this.bagChargeItemView) == -1 &&
                    App.Data.myorder.get_only_product_quantity() > 0 && bag_charge) {

                    this.subViews.push(this.bagChargeItemView);
                    this.$('.myorder').append(this.bagChargeItemView.el);
                }
            }
            else {
                this.subViews.push(view);
                if (this.subViews.indexOf(this.bagChargeItemView) == -1 && this.bagChargeItemView && bag_charge) {
                    this.subViews.push(this.bagChargeItemView);
                }

                this.$('.myorder').append(view.el);
                if (this.bagChargeItemView && bag_charge) {
                    this.$('.myorder').append(this.bagChargeItemView.el);
                }
            }
        },
        removeItem: function(model) {
            var self = this;
            this.subViews.forEach(function(view, i) {
                if(model === view.model) {
                    view.remove();
                    self.subViews.splice(i, 1);
                    if (self.subViews.length == 1 && self.subViews.indexOf(self.bagChargeItemView) != -1) {
                        self.bagChargeItemView.remove();
                        self.subViews.splice(0, 1);
                    }
                    return true;
                }
            });
        }
    });

    App.Views.CoreMyOrderView.CoreMyOrderNoteView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'note',
        events: {
            'change .note_field textarea' : 'change_note'
        },
        render: function() {
            var data = {
                noteAllow: App.Data.settings.get('settings_system').order_notes_allow,
                note: this.model.get('notes')
            };
            this.$el.html(this.template(data));
        },
        change_note: function(e) {
            this.model.set('notes', e.target.value);
        }
    });

    App.Views.MyOrderView = {};

    App.Views.MyOrderView.MyOrderModifierView = App.Views.CoreMyOrderView.CoreMyOrderModifierView;

    App.Views.MyOrderView.MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView;

    App.Views.MyOrderView.MyOrderListView = App.Views.CoreMyOrderView.CoreMyOrderListView;

    App.Views.MyOrderView.MyOrderMatrixView = App.Views.CoreMyOrderView.CoreMyOrderMatrixView;

    App.Views.MyOrderView.MyOrderNoteView = App.Views.CoreMyOrderView.CoreMyOrderNoteView;
});
