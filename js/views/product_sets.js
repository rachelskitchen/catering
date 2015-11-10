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
    // ProductListItemView -> user clicks on a product -> MyOrderMatrixComboView ->
    //             -> ProductSetsListView -> [ ProductSetsItemView  ->
    //                             -> ComboListView  -> [ ComboItemView ]  ]

    App.Views.CoreComboView = {};

    App.Views.CoreComboView.CoreComboItemView = App.Views.ItemView.extend({
        name: 'combo',
        mod: 'item',
        events: {
            'click .customize': 'customize',
            'change input': 'change'
        },
        bindings: {
            '.mdf_quantity select': 'value: decimal(_product_quantity)',
            '.customize ': "classes:{hide:not(is_modifiers)}"
        },
        computeds: {
            is_modifiers: function() {
                return this.orderProduct.get_modifiers().length > 0;
            }
        },
        initialize: function() {
            this.orderProduct = this.options.parent;
            this.extendBindingSources({_product: this.orderProduct });
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:selected', this.update, this);
        },
        render: function() {
            var model = this.model.toJSON(),
                productSet = this.options.productSet;
            model.currency_symbol = App.Settings.currency_symbol;
            model.price = round_monetary_currency(model.price);
            model.slength = model.price.length;
            model.name = this.model.escape('name');

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

            //this.afterRender(model.sort);
            this.update();
            //this.update_free();

            return this;
        },
        customize: function(event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var self = this,
                isStanfordItem = App.Data.is_stanford_mode && this.model.get('is_gift');

            //find real product from the productSet:
            var real_product = this.options.productSet.get('order_products').findWhere({id_product: this.options.parent.get('id_product')});
            var clone = real_product.clone();

            App.Data.mainModel.set('popup', {
                modelName: 'MyOrder',
                mod: isStanfordItem ? 'StanfordItem' : 'Matrix',
                className: isStanfordItem ? 'stanford-reload-item' : '',
                model: clone,
                real: real_product,
                action: 'update',
                action_callback: function() {
                    //return back to the combo root product view:
                    App.Data.mainModel.set('popup', {
                            modelName: 'MyOrder',
                            mod: 'MatrixCombo',
                            cache_id: self.options.myorder_root.get('id_product')
                        });
                }
            });
        },
        change: function(e, stat) {
            trace("event change !")
            if(!App.Settings.online_orders) {
                return;
            }
            var productSet = this.options.productSet;
            var el = $(e.currentTarget),
                checked = el.prop('checked'),
                exactAmount = productSet.get('maximum_amount');
            if (el.attr('type') !== 'checkbox') {
                if (stat !== undefined) {
                    this.model.set('selected', stat);
                } else {
                    el.parents('.modifiers-list').find('input').not(el).trigger('change', [false]);
                    this.model.set('selected', checked);
                }
            } else {
                if(checked && exactAmount > 0 && productSet.get_selected_qty() >= exactAmount) {
                    return el.prop('checked', false);
                }
                this.model.set('selected', checked);
            }

            if (this.model.get('selected') == false) {
                //this.model.unset('free_amount');
                this.model.unset('max_price_amount');
            }
        },
        update: function() {
            var quantity;
            if(this.model.get('selected')) {
                this.$('input').attr('checked', 'checked');
                this.$('.input').addClass('checked');

                if (App.Settings.enable_quantity_modifiers) {
                    this.$(".mdf_quantity").css("display", "inline-block");

                    this.$('.mdf_quantity option:selected').removeAttr('selected');
                    quantity = this.options.parent.get('quantity');
                    if (quantity > 0) {
                        this.$(".mdf_quantity select").val(quantity);
                    }
                }
                this.$(".split-qty-wrapper").addClass('single')
            }
            else {
                this.$('input').removeAttr('checked');
                this.$('.input').removeClass('checked');
                this.$(".mdf_quantity").hide();
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
                el: $('<li class="modifier"></li>'),
                mod: 'Item',
                model: model.get('product'),
                parent: model, // TBD: exclude it, posible future errors !!!
                type: this.options.type,
                productSet: this.options.productSet,
                myorder_root: this.options.myorder_root //root combo instance of App.Models.Myorder model
            });
            App.Views.ListView.prototype.addItem.call(this, view, this.$('.modifiers'), model.get('sort'), 'li');
            this.subViews.push(view);
        }
    });

    App.Views.CoreProductSetsView = {};

    App.Views.CoreProductSetsView.CoreProductSetsItemView = App.Views.ItemView.extend({
        name: 'product_sets',
        mod: 'item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.controlCheckboxes, this);
        },
        render: function() {
            var model = this.model.toJSON(),
                amount_free = 0, //model.amount_free,
                isAdmin = false, //model.admin_modifier,
                isPrice = false, //model.amount_free_is_dollars,
                currency = App.Data.settings.get('settings_system').currency_symbol,
                view;

            model.type = 0;
            model.free_modifiers = '';
            //model.name = 'Select products ...';

            if(amount_free && !isAdmin)
                model.free_modifiers = isPrice ? MSG.FREE_MODIFIERS_PRICE.replace('%s', currency + amount_free)
                    : amount_free == 1 ? MSG.FREE_MODIFIERS_QUANTITY1 : MSG.FREE_MODIFIERS_QUANTITY.replace('%s', amount_free);

            this.$el.html(this.template(model));

            var view = App.Views.GeneratorView.create('Combo', {
                el: this.$('.modifier_class_list'),
                mod: 'List',
                collection: this.model.get('order_products'),
                type: 0,
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
            var checked = this.subViews[0].$el.find('input:checked').parent(),
                unchecked = this.subViews[0].$el.find('input:not(:checked)').parent(),
                maximumAmount = this.model.get('maximum_amount');
            if(!this.type && maximumAmount > 0 && this.model.get_selected_qty() >= maximumAmount) {
                checked.fadeTo(100, 1);
                checked.removeClass('fade-out');
                unchecked.fadeTo(100, 0.5);
                unchecked.addClass('fade-out');
            } else {
                checked.fadeTo(100, 1);
                unchecked.fadeTo(100, 1);
                checked.removeClass('fade-out');
                unchecked.removeClass('fade-out');
            }
        }
    });

    App.Views.CoreProductSetsView.CoreProductSetsListView = App.Views.ListView.extend({
        name: 'product_sets',
        mod: 'list',
        initialize: function() {
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