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

    App.Views.CoreComboView = {};

    App.Views.CoreComboView.CoreComboItemView = App.Views.ItemView.extend({
        name: 'combo',
        mod: 'item',
        events: {
            'change input': 'change'
        },
        bindings: {
            '.mdf_quantity select': 'value: decimal(quantity)',
        },
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:selected', this.update, this);
        },
        render: function() {
            var model = this.model.toJSON(),
                modifierBlock = this.options.modifierClass;
            model.currency_symbol = App.Settings.currency_symbol;
            model.price = round_monetary_currency(model.price);
            model.slength = model.price.length;
            
            model.name = this.model.escape('name');
            
            this.$el.html(this.template(model));

            var option_el, max_quantity,
                maximum_amount = modifierBlock.get("maximum_amount"),
                mdf_quantity_el = this.$(".mdf_quantity select");

            if (!maximum_amount) {
                max_quantity = 5; //default value
            }
            else {
                if (App.Settings.enable_split_modifiers) {
                    max_quantity = maximum_amount * 2;
                }
                else {
                    max_quantity = maximum_amount;
                }
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
        change: function(e, stat) {
            if(!App.Settings.online_orders) {
                return;
            }
            var modifierBlock = this.options.modifierClass;
            var el = $(e.currentTarget),
                checked = el.prop('checked'),
                maximumAmount = modifierBlock.get('maximum_amount');
            if (el.attr('type') !== 'checkbox') {
                if (stat !== undefined) {
                    this.model.set('selected', stat);
                } else {
                    el.parents('.modifiers-list').find('input').not(el).trigger('change', [false]);
                    this.model.set('selected', checked);
                }
            } else {
                if(checked && maximumAmount > 0 && modifierBlock.get('modifiers').get_selected_qty() >= maximumAmount) {
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
            if(this.model.get('selected')) {
                this.$('input').attr('checked', 'checked');
                this.$('.input').addClass('checked');

                if (App.Settings.enable_quantity_modifiers) {
                    this.$(".mdf_quantity").css("display", "inline-block");

                    this.$('.mdf_quantity option:selected').removeAttr('selected');
                    if (this.model.get('quantity') > 0) {
                        this.$(".mdf_quantity select").val(this.model.get('quantity'));
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
                name: this.options.modifierClass.get('name')
            };
            App.Views.ListView.prototype.render.apply(this, arguments);
            this.collection.each(this.addItem.bind(this));
            return this;
        },
        addItem: function(model) {
            var view = App.Views.GeneratorView.create('Modifiers', {
                el: $('<li class="modifier"></li>'),
                mod: 'Item',
                model: model,
                type: this.options.type,
                modifierClass: this.options.modifierClass
            });
            App.Views.ListView.prototype.addItem.call(this, view, this.$('.modifiers'), model.get('sort'), 'li');
            this.subViews.push(view);
        }
    });    

    App.Views.CoreModifiersClassesView = {};

    App.Views.CoreModifiersClassesView.CoreModifiersClassesItemView = App.Views.ItemView.extend({
        name: 'modifiers_classes',
        mod: 'item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.controlCheckboxes, this);
        },
        remove: function() {
            App.Views.ItemView.prototype.remove.apply(this, arguments);
        },
        render: function() {
            var model = this.model.toJSON(),
                amount_free = model.amount_free,
                isAdmin = model.admin_modifier,
                isPrice = model.amount_free_is_dollars,
                currency = App.Data.settings.get('settings_system').currency_symbol,
                view;

            model.type = 0;
            model.free_modifiers = '';

            if(this.model.get('admin_modifier') && this.model.get('admin_mod_key') === 'SIZE') {
                this.type = SIZE;
                model.type = 1;
            } else if (this.model.get('admin_modifier') && this.model.get('admin_mod_key') === 'SPECIAL') {
                this.type = SPECIAL;
                model.name = 'Select special request';
                model.type = 2;
            }

            if(amount_free && !isAdmin)
                model.free_modifiers = isPrice ? MSG.FREE_MODIFIERS_PRICE.replace('%s', currency + amount_free)
                    : amount_free == 1 ? MSG.FREE_MODIFIERS_QUANTITY1 : MSG.FREE_MODIFIERS_QUANTITY.replace('%s', amount_free);

            this.$el.html(this.template(model));

            var view = App.Views.GeneratorView.create('Modifiers', {
                el: this.$('.modifier_class_list'),
                mod: 'List',
                collection: this.model.get('modifiers'),
                type: this.type,
                modifierClass: this.model
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
            if(!this.type && maximumAmount > 0 && this.model.get('modifiers').get_selected_qty() >= maximumAmount) {
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

    App.Views.CoreModifiersClassesView.CoreModifiersClassesListView = App.Views.ListView.extend({
        name: 'modifiers_classes',
        mod: 'list',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get_modifiers(), 'add', this.addItem, this);
        },
        render: function() {
            var modifiers = this.model.get_modifiers();
            App.Views.ListView.prototype.render.apply(this, arguments);
            modifiers && modifiers.each(this.addItem.bind(this));
            return this;
        },
        addItem: function(model) {
            if(model.get('admin_modifier') && model.get('admin_mod_key') === SPECIAL && !App.Data.settings.get('settings_system').special_requests_online) return;
            var view = App.Views.GeneratorView.create('ModifiersClasses', {
                el: $('<div class="modifier_class_wrapper"></div>'),
                mod: 'Item',
                model: model
            });
            App.Views.ListView.prototype.addItem.call(this, view, this.$('.modifier_classes'), model.escape('sort'));
            this.subViews.push(view);
        }
    });

    return new (require('factory'))(function() {
        App.Views.ModifiersView = {};
        App.Views.ModifiersClassesView = {};
        App.Views.ModifiersView.ModifiersItemView = App.Views.CoreModifiersView.CoreModifiersItemView;
        App.Views.ModifiersView.ModifiersMatrixView = App.Views.CoreModifiersView.CoreModifiersMatrixView;
        App.Views.ModifiersView.ModifiersListView = App.Views.CoreModifiersView.CoreModifiersListView;
        App.Views.ModifiersView.ModifiersMatrixesView = App.Views.CoreModifiersView.CoreModifiersMatrixesView;
        App.Views.ModifiersClassesView.ModifiersClassesItemView = App.Views.CoreModifiersClassesView.CoreModifiersClassesItemView;
        App.Views.ModifiersClassesView.ModifiersClassesMatrixView = App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixView;
        App.Views.ModifiersClassesView.ModifiersClassesListView = App.Views.CoreModifiersClassesView.CoreModifiersClassesListView;
        App.Views.ModifiersClassesView.ModifiersClassesMatrixesView = App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixesView;
    });
});