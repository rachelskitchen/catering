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

define(["backbone", "factory", 'generator', 'list'], function(Backbone) {
    'use strict';

    // Combo matrix creation workflow:
    // ProductListItemView -> user clicks on a product ->
    //                     -> { MyOrderMatrixComboView ->
    //                                -> { ProductModifiersComboView }
    //                                -> { ProductSetsListView ->
    //                                        -> [ ProductSetsItemView  ->
    //                                                     -> { ComboListView  ->
    //                                                              [ ComboItemView ... ] }
    //                                             ...
    //                                           ]
    //                                   }
    //                                -> { MyOrderMatrixFooterComboView }
    //                        }

    App.Views.CoreComboView = {};

    App.Views.CoreComboView.CoreComboItemView = App.Views.ItemView.extend({
        name: 'combo',
        mod: 'item',
        events: {
            'click .customize': 'customize',
            'click .checkbox': 'change',
            'click .title': 'change'
        },
        bindings: {
            '.mdf_quantity select': 'value: decimal(quantity)',
            '.customize ': "classes:{hide:any(not(selected), not(is_modifiers))}",
            '.cost': "classes: {hide: any(not(selected), not(is_modifiers))}",
            '.price': "text: currencyFormat(modifiers_sum)",
        },
        computeds: {
            is_modifiers: function() {
                return this.model.get_modifiers().length > 0;
            },
            modifiers_sum: {
                deps: ['modifiers'],
                get: function() {
                    return this.model.get_sum_of_modifiers();
                }
            }
        },
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.startListening();
        },
        startListening: function() {
            this.listenTo(this.model, 'change:selected', this.update, this);
            this.listenTo(this.model, 'change:quantity', this.update, this);
            this.listenTo(this.model.get_modifiers(), 'modifiers_changed', this.update, this);
            this.listenTo(this.model, 'model_changed', this.reinit_new_model, this);
        },
        reinit_new_model: function() {
            //this.model (reference) for this view has been changed, so reinit the view.
            this.model = this.options.productSet.get('order_products').findWhere({id_product: this.model.get('id_product')});;
            this.stopListening();
            this.startListening();
            this.applyBindings();
            this.check_model();
        },
        render: function() {
            var model = this.model.toJSON(),
                product = this.model.get('product'),
                productSet = this.options.productSet;
            model.currency_symbol = App.Settings.currency_symbol;

            model.price = round_monetary_currency(this.model.get_sum_of_modifiers());

            model.slength = model.price.length;
            model.name =  product.escape('name');

            this.$el.html(this.template(model));

            var option_el, max_quantity,
                exact_amount = productSet.get("maximum_amount"),
                mdf_quantity_el = this.$(".mdf_quantity select");

            if (!exact_amount) {
                max_quantity = 5; //default value
            }
            else {
                max_quantity = exact_amount;
            }
            for (var i=1; i <= max_quantity; i++) {
                option_el = $('<option>').val(i).text("x" + i);
                mdf_quantity_el.append(option_el);
            }

            this.update();
            return this;
        },
        customize: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var self = this,
                isStanfordItem = App.Data.is_stanford_mode && this.model.get('is_gift');

            var clone = this.model.clone();
            App.Data.mainModel.set('popup', {
                modelName: 'MyOrder',
                mod: isStanfordItem ? 'StanfordItem' : 'Matrix',
                className: isStanfordItem ? 'stanford-reload-item' : '',
                model: clone,
                combo_child: true,
                real: this.model,
                action: 'update',
                action_callback: function() {
                    //return back to the combo root product view:
                    App.Data.mainModel.set('popup', {
                            modelName: 'MyOrder',
                            mod: 'MatrixCombo',
                            cache_id: self.options.myorder_root.get('id_product')
                        });
                    self.model.trigger("model_changed");
                }
            });
        },
        change: function(e, stat) {
            e.stopImmediatePropagation();
            e.preventDefault();

            if(!App.Settings.online_orders) {
                return;
            }
            var productSet = this.options.productSet;
            var el = $(".checkbox", $(e.currentTarget).parent()),
                checked = el.attr('checked') == "checked" ? false : true,
                exactAmount = productSet.get('maximum_amount');

            if(checked && exactAmount > 0 && productSet.get_selected_qty() >= exactAmount) {
                return;
            }
            this.model.set('selected', checked);
            this.$('.input').attr('checked', checked ? 'checked' : false);
            if (checked && this.model.check_order().status != 'OK') {
                this.$(".customize").click();
            }
        },
        update: function() {
            var quantity;
            if(this.model.get('selected')) {
                this.$('.input').attr('checked', 'checked');

                if (App.Settings.enable_quantity_modifiers) {
                    this.$(".mdf_quantity").css("display", "inline-block");

                    this.$('.mdf_quantity option:selected').removeAttr('selected');
                    quantity = this.model.get('quantity');
                    if (quantity > 0) {
                        this.$(".mdf_quantity select").val(quantity);
                    }
                }
                this.$(".split-qty-wrapper").addClass('single')
            }
            else {
                this.$('.input').attr('checked', false);
                this.$(".mdf_quantity").hide();
            }
            this.options.myorder_root.trigger('combo_product_change');
            this.model.trigger('change:modifiers');
        },
        check_model: function() {
            var checked = this.$(".checkbox").attr('checked') == "checked" ? true : false;
            if (checked && this.model.check_order().status != 'OK') {
                this.$(".checkbox").click(); //return back to the unchecked state
            }
        }
    });

    App.Views.CoreComboView.CoreComboListView = App.Views.ListView.extend({
        name: 'combo',
        mod: 'list',
        render: function() {
            this.model = {
                name: this.options.productSet.get('name')
            };
            App.Views.ListView.prototype.render.apply(this, arguments);
            this.collection.each(this.addItem.bind(this));
            return this;
        },
        addItem: function(model) {
            var view = App.Views.GeneratorView.create('Combo', {
                el: $('<li class="combo_item"></li>'),
                mod: 'Item',
                model: model,
                type: this.options.type,
                productSet: this.options.productSet,
                myorder_root: this.options.myorder_root //root combo instance of App.Models.Myorder model
            });
            App.Views.ListView.prototype.addItem.call(this, view, this.$('.product_set_list'), model.get('sort'), 'li');
            this.subViews.push(view);
        }
    });

    App.Views.CoreProductSetsView = {};

    App.Views.CoreProductSetsView.CoreProductSetsItemView = App.Views.ItemView.extend({
        name: 'product_sets',
        mod: 'item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('order_products'), 'change', this.controlCheckboxes, this);
        },
        render: function() {
            var model = this.model.toJSON(),
                currency = App.Data.settings.get('settings_system').currency_symbol,
                view;
            model.type = 0;
            this.$el.html(this.template(model));

            var view = App.Views.GeneratorView.create('Combo', {
                el: this.$('.modifier_class_list'),
                mod: 'List',
                collection: this.model.get('order_products'),
                type: 0, //checkboxes
                productSet: this.model,
                myorder_root: this.options.myorder_root //root combo product instance of App.Models.Myorder model
            });

            this.afterRender(this.model.escape('sort'));
            this.subViews.push(view);

            this.controlCheckboxes();
            return this;
        },
        controlCheckboxes: function() {
            if(!this.subViews[0])
                return;
            var checked = this.subViews[0].$el.find('.input[checked=checked]').parent(),
                unchecked = this.subViews[0].$el.find('.input').not("[checked=checked]").parent(),
                maximumAmount = this.model.get('maximum_amount');
            if(!this.type && maximumAmount > 0 && this.model.get_selected_qty() >= maximumAmount) {
                checked.removeClass('fade-out');
                unchecked.addClass('fade-out');
            } else {
                checked.removeClass('fade-out');
                unchecked.removeClass('fade-out');
            }
        }
    });

    App.Views.CoreProductSetsView.CoreProductSetsListView = App.Views.ListView.extend({
        name: 'product_sets',
        mod: 'list',
        initialize: function() {
            this.model.set('combo_name', this.model.get('product').get('name'));
            App.Views.ListView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.ListView.prototype.render.apply(this, arguments);
            this.collection && this.collection.each(this.addItem.bind(this));

            this.$el.parents('.modifiers_table').show();
            return this;
        },
        addItem: function(model) {
            var view = App.Views.GeneratorView.create('ProductSets', {
                el: $('<div class="modifier_class_wrapper"></div>'),
                mod: 'Item',
                model: model,
                myorder_root: this.model //root combo instance of App.Models.Myorder model
            });
            App.Views.ListView.prototype.addItem.call(this, view, this.$('.modifier_classes'), model.escape('sort'));
            this.subViews.push(view);
        }
    });

    return new (require('factory'))(function() {
        App.Views.ComboView = {};
        App.Views.ProductSetsView = {};
        App.Views.ComboView.ComboItemView = App.Views.CoreComboView.CoreComboItemView;
        App.Views.ComboView.ComboListView = App.Views.CoreComboView.CoreComboListView;
        App.Views.ProductSetsView.ProductSetsListView = App.Views.CoreProductSetsView.CoreProductSetsListView;
        App.Views.ProductSetsView.ProductSetsItemView = App.Views.CoreProductSetsView.CoreProductSetsItemView;
    });
});