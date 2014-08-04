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

define(["backbone", "factory", 'modifiers_view'], function(Backbone) {
    'use strict';

    App.Views.ModifiersView.ModifiersMatrixView = App.Views.FactoryView.extend({
        name: 'modifiers',
        mod: 'matrix',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            var data = this.options.data,
                product = data.product,
                row = 'attribute_' + data.row +'_selected';

            this.listenTo(this.model, 'change:option', this.change.bind(this, data, product, row), this);
            this.listenTo(product, 'change:attribute_1_selected change:attribute_2_selected', this.disable_enable.bind(this, data, product), this);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);

            var model = {
                name: this.options.name
            };

            this.$el.html(this.template(model));
            return this;
        },
        change: function(data, product, row, model, value) {
            var id = this.options.id;

            if(value != id)
                return;

            product.set(row, id);
        },
        disable_enable: function(data, product, model) {
            var row = 'attribute_' + data.row +'_selected',
                selected = product.get(row),
                anotherRow = 'attribute_' + (data.row - 1 ? 1 : 2) +'_selected',
                anotherSelected = product.get(anotherRow),
                other = data.attributesOther[anotherSelected],
                id = this.options.id;

            if((selected === null && anotherSelected === null) || (Array.isArray(other) && other.indexOf(id) > -1) || selected === id)
                this.$el.prop('disabled', false);
            else
                this.$el.prop('disabled', true);
        }
    });

    App.Views.ModifiersView.ModifiersMatrixesView = App.Views.CoreModifiersView.CoreModifiersMatrixesView.extend({
        initialize: function() {
            this.model = new Backbone.Model;
            App.Views.CoreModifiersView.CoreModifiersMatrixesView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.ListView.prototype.initOrderSort.apply(this, arguments);
            App.Views.CoreModifiersView.CoreModifiersMatrixesView.prototype.render.apply(this, arguments);
            var select = this.$('.modifiers-list'),
                data = this.options.data,
                row = data.row,
                selected = data.product.get('attribute_' + row + '_selected');
            select.prepend(this.$('option[value=-1]')); // move to first
            !isNaN(parseInt(selected, 10)) && select.val(selected);
            return this;
        },
        events: {
            'change select': 'change'
        },
        addItem: function(data) {
            var view = App.Views.GeneratorView.create('Modifiers', {
                el: $('<option class="modifier"></option>'),
                mod: 'Matrix',
                data: data.data,
                id: data.id,
                name: data.name,
                model: this.model
            });
            view.$el.attr({
                'value': data.id,
                'data-sort': data.sort
            });
            App.Views.ListView.prototype.addItem.call(this, view, this.$('.modifiers-list'), data.sort);
            this.subViews.push(view);
        },
        change: function(e) {
            var data = this.options.data;
            if(e.target.value == -1)
                data.product.set('attribute_' + data.row +'_selected', null);
            else
                this.model.trigger('change:option', this.model, e.target.value);
        }
    });

    App.Views.ModifiersClassesView.ModifiersClassesMatrixesView = App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixesView.extend({
        addItem: function() {
            App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixesView.prototype.addItem.apply(this, arguments);
            this.$el.parents('.modifiers_table').show();
        }
    });

    App.Views.ModifiersClassesView.ModifiersClassesListView = App.Views.CoreModifiersClassesView.CoreModifiersClassesListView.extend({
        addItem: function() {
            App.Views.CoreModifiersClassesView.CoreModifiersClassesListView.prototype.addItem.apply(this, arguments);
            this.$el.parents('.modifiers_table').show();
        }
    });
});