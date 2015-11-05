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

define(["backbone", "stanfordcard_view", "factory", "generator"], function(Backbone, stanfordcard_view) {
    'use strict';

    App.Views.CoreMyOrderView = {};

    App.Views.CoreMyOrderView.CoreMyOrderModifierView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'modifier',
        render: function() {
            var price, model = this.model.toJSON();
            model.currency_symbol = App.Data.settings.get('settings_system').currency_symbol;

            if (this.model.isMaxPriceFree())
                price = model.max_price_amount;
            else
                price = this.model.isFree() ? model.free_amount : this.model.getSum();

            model.price = round_monetary_currency( price );
            model.half_price_str = MSG.HALF_PRICE_STR[this.model.get('qty_type')];
            this.$el.html(this.template(model));
            return this;
        }
    });

    App.Views.CoreMyOrderView.CoreMyOrderProductDiscountView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'product_discount',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get("discount"), 'change', this.render, this);
        },
        render: function() {
            // this.model is the instance of App.Models.Myorder
            var model = {},
                discount = this.model.get("discount");
            model.currency_symbol = App.Settings.currency_symbol;
            model.discount_name = discount.get('name');
            model.discount_sum = discount.toString();
            model.price_length = model.discount_sum.length + 1;
            this.$el.html(this.template(model));

            removeClassRegexp(this.$el, "s\\d{1,2}");
            this.$el.addClass('s' + (model.discount_sum.length + 1));

            if (discount.get("sum") <= 0) {
                this.$el.hide();
            }
            else {
                this.$el.show();
            }
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

    App.Views.CoreMyOrderView.CoreMyOrderMatrixComboView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'matrix_combo',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            var model = this.model;
            this.renderProduct();
            this.renderProductSets();
            return this;
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
        renderProductSets: function() {
            var model = this.model,
                productSets,
                product = this.model.get("product");

            if (!product) return;

            var el = $('<div></div>');
                this.$('.modifiers_info').append(el);
                productSets = App.Views.GeneratorView.create('ProductSets', {
                    el: el,
                    model: this.model,
                    collection: product.get('product_sets'),
                    mod: 'List'
                });

            this.subViews.push(productSets);
        }
    });

    App.Views.CoreMyOrderView.CoreMyOrderMatrixFooterView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'matrix_footer',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change_child_selected', this.update_child_selected);
            return this;
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
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
            this.update_child_selected();
            return this;
        },
        events: {
            'click .action_button:not(.disabled)': 'action',
        },
        update_child_selected: function() {
            if (this.model.get('product').check_selected()) {
                this.$('.action_button').removeClass('disabled');
            }
            else {
                this.$('.action_button').addClass('disabled');
            }
        },
        action: function (event) {
            var check = this.model.check_order(),
                self = this, index, collection;

            if (check.status === 'OK') {
                if (self.options.action === 'add') {
                    App.Data.myorder.add(self.model);
                } else {
                    collection = self.options.real.collection;
                    index = collection.indexOf(self.options.real);
                    collection.remove(self.options.real);
                    collection.add(self.model, {at: index});
                    trace ("action: real product index = ", index);
                    if (collection.splitItemAfterQuantityUpdate)
                        collection.splitItemAfterQuantityUpdate(self.model, self.options.real.get('quantity'), self.model.get('quantity'));
                }
                $('#popup .cancel').trigger('click');
                self.options.action_callback && self.options.action_callback(self.model);
            } else {
                App.Data.errors.alert(check.errorMsg); // user notification
            }
        }
    });

    App.Views.CoreMyOrderView.CoreMyOrderItemView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'item',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.update);
            this.listenTo(this.model.get_product(), 'change', this.update);
        },
        render: function() {
            var self = this,
                modifiers = this.model.get_modifiers();

            this.$el.html(this.template(this.getData()));

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
                    view.$el.addClass('s' + (round_monetary_currency(modifier.getSum()).length + 1));

                    self.$('.modifier_place').append(view.el);
                });
            });

            var view = App.Views.GeneratorView.create('MyOrder', {
                el: $('<li></li>'),
                mod: 'ProductDiscount',
                model: this.model
            });
            self.subViews.push(view);
            self.$('.discount_place').append(view.el);

            return this;
        },
        getData: function() {
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
            model.price_length = round_monetary_currency(model.initial_price).length; //price is not changed for the product
            model.uom = App.Data.settings.get("settings_system").scales.default_weighing_unit;//    product.get('uom');
            model.is_gift = product.get('is_gift');
            model.gift_card_number = product.get('gift_card_number');
            model.sold_by_weight = model.product.get("sold_by_weight");
            model.label_manual_weights = App.Data.settings.get("settings_system").scales.label_for_manual_weights;
            model.image = product.get_product().get('image');
            model.id = product.get_product().get('id');
            model.is_service_fee = this.model.isServiceFee();
            model.attrs = this.model.get_attributes() || [];

            if (model.sold_by_weight) {
                num_digits = App.Data.settings.get("settings_system").scales.number_of_digits_to_right_of_decimal;
                model.weight = model.weight.toFixed(num_digits);
            }

            return model;
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

    App.Views.CoreMyOrderView.CoreMyOrderDiscountView = App.Views.FactoryView.extend({
        name: 'myorder',
        mod: 'discount',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.render, this);
        },
        render: function() {
            var model = {};
            // this.model is the instance of App.Models.DiscountItem
            model.currency_symbol = App.Settings.currency_symbol;
            model.discount_sum = this.model.toString();
            model.discount_name = this.model.get('name');
            model.price_length = model.discount_sum.length + 1;
            this.$el.html(this.template(model));
            if (this.model.get("sum") <= 0) {
                this.$el.hide();
            }
            else {
                this.$el.show();
            }
            return this;
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
            var view = App.Views.GeneratorView.create('MyOrder', {
                mod: 'Item',
                model: model,
                el: $('<li></li>'),
                collection: this.collection
            });

            if (model.isServiceFee()) {
                this.subViews.push(view);
                this.$('.service_fees').append(view.el);
                return;
            }

            this.subViews.push(view);
            this.$('.myorder').append(view.el);

            if (this.subViews.indexOf(this.discountItemView) == -1 && this.collection.discount && !this.discountItemView ) {
                var view = App.Views.GeneratorView.create('MyOrder', {
                    mod: 'Discount',
                    model: this.collection.discount,
                    el: $('<li></li>')
                });
                this.subViews.push(view);
                this.discountItemView = view;
                this.$('.discount').append(this.discountItemView.el);
            }
        },
        removeItem: function(model) {
            var self = this;
            this.subViews.forEach(function(view, i) {
                if(model === view.model) {
                    view.remove();
                    self.subViews.splice(i, 1);
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

    App.Views.CoreMyOrderView.CoreMyOrderStanfordItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        name: 'myorder',
        mod: 'stanford_item',
        initialize: function() {
            _.extend(this.bindingSources, {
                stanford: this.model.get('stanfordCard'),
                state: new Backbone.Model({
                    showPlans: false,
                    addMode: this.options.action === 'add'
                })
            });
            App.Views.CoreMyOrderView.CoreMyOrderItemView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            // initial_price can be only integer according Stanford card reload service limitation (Bug 30983)
            '.initial-price': 'value: integer(price), events: ["input"], restrictInput: "0123456789.,", kbdSwitcher: "numeric", pattern: /^\\d*$/',
            '.next': 'classes: {validated: stanford_validated, disabled: not(all(decimal(initial_price), select(stanford_validated, stanford_planId, true), stanford_number, stanford_captchaValue, stanford_captchaKey))}',
            '.view-1': 'toggle: not(state_showPlans)',
            '.view-2': 'toggle: state_showPlans',
            '.stanford-number': 'text: stanford_card_number',
            '.amount': 'text: currencyFormat(initial_price)',
            '.add-item': 'classes: {disabled: not(planId)}, text: select(state_addMode, _lp_MYORDER_ADD_ITEM, _lp_MYORDER_UPDATE_ITEM)'
        },
        computeds: {
            // used in an input element because we need to change price in product to keep a correct item restoring from a storage during payment process
            price: {
                deps: ['product'],
                get: function() {
                    return this.model.get_product().get('price');
                },
                set: function(value) {
                    value = parseInt(value) || 0;
                    this.model.get_product().set('price', value);
                }
            }
        },
        events: {
            'click .next': 'next',
            'click .back': 'back',
            'click .add-item': 'action'
        },
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderItemView.prototype.render.apply(this, arguments);

            var stanford = this.model.get('stanfordCard'),
                stanfordCard, stanfordPlans;

            stanfordCard = App.Views.GeneratorView.create('StanfordCard', {
                el: this.$('.card-wrapper'),
                mod: 'Reload',
                model: this.model.get('stanfordCard')
            });

            stanfordPlans = App.Views.GeneratorView.create('StanfordCard', {
                el: this.$('.plans'),
                mod: 'Plans',
                collection: stanford.get('plans')
            });

            this.subViews.push(stanfordCard);
            this.subViews.push(stanfordPlans);

            return this;
        },
        next: function() {
            var self = this,
                mainModel = App.Data.mainModel;

            if(this.hasPlans()) {
                self.setBinding('state_showPlans', true);
            } else {
                mainModel && mainModel.trigger('loadStarted');
                this.getBinding('$stanford').getPlans(true).then(function() {
                    self.setBinding('state_showPlans', self.hasPlans());
                    mainModel && mainModel.trigger('loadCompleted');
                });
            }
        },
        back: function() {
            this.setBinding('state_showPlans', false);
        },
        hasPlans: function() {
            var stanfordCard = this.model.get('stanfordCard');
            return stanfordCard.get('validated') && stanfordCard.get('plans').length;
        },
        action: function (event) {
            var check = this.model.check_order();

            if (check.status === 'OK') {
                if (this.getBinding('state_addMode')) {
                    App.Data.myorder.add(this.model);
                } else {
                    var index = App.Data.myorder.indexOf(this.model) - 1;
                    App.Data.myorder.remove(this.options.real);
                    App.Data.myorder.add(this.model, {at: index});
                }

                $('#popup .cancel').trigger('click');
            } else {
                App.Data.errors.alert(check.errorMsg); // user notification
            }
        },
        // override parent's update method to avoid re-rendering
        update: new Function()
    });

    return new (require('factory'))(stanfordcard_view.initViews.bind(stanfordcard_view), function() {
        App.Views.MyOrderView = {};
        App.Views.MyOrderView.MyOrderModifierView = App.Views.CoreMyOrderView.CoreMyOrderModifierView;
        App.Views.MyOrderView.MyOrderProductDiscountView = App.Views.CoreMyOrderView.CoreMyOrderProductDiscountView;
        App.Views.MyOrderView.MyOrderDiscountView = App.Views.CoreMyOrderView.CoreMyOrderDiscountView;
        App.Views.MyOrderView.MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView;
        App.Views.MyOrderView.MyOrderListView = App.Views.CoreMyOrderView.CoreMyOrderListView;
        App.Views.MyOrderView.MyOrderMatrixView = App.Views.CoreMyOrderView.CoreMyOrderMatrixView;
        App.Views.MyOrderView.MyOrderMatrixFooterView = App.Views.CoreMyOrderView.CoreMyOrderMatrixFooterView;
        App.Views.MyOrderView.MyOrderNoteView = App.Views.CoreMyOrderView.CoreMyOrderNoteView;
        App.Views.MyOrderView.MyOrderStanfordItemView = App.Views.CoreMyOrderView.CoreMyOrderStanfordItemView;
        App.Views.MyOrderView.MyOrderMatrixComboView = App.Views.CoreMyOrderView.CoreMyOrderMatrixComboView;
    });
});
