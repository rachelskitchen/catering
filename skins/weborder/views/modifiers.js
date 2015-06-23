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

define(["modifiers_view"], function(modifiers_view) {
    'use strict';

    var ModifiersItemView = App.Views.CoreModifiersView.CoreModifiersItemView.extend({
        bindings: {
            '.mdf_spacer': 'css:{width:mdf_width}'
        },
        computeds: {
            mdf_width: {
                deps: ["_system_settings_enable_split_modifiers", "_system_settings_enable_quantity_modifiers"],
                get: function(enable_split_modifiers, enable_quantity_modifiers) {
                    var is_split_selector = enable_split_modifiers ||  this.isSize() || this.isSpecial();
                    var is_quantity_selector = enable_quantity_modifiers ||  this.isSize() || this.isSpecial();
                    return (is_split_selector * 55 + is_quantity_selector * 83) + "px";
                }
            }
        }
    });

    var ModifiersClassesMatrixesView = App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixesView.extend({
        addItem: function() {
            App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixesView.prototype.addItem.apply(this, arguments);
            this.$el.parents('.modifiers_table').show();
        }
    });

    var ModifiersClassesListView = App.Views.CoreModifiersClassesView.CoreModifiersClassesListView.extend({
        addItem: function() {
            App.Views.CoreModifiersClassesView.CoreModifiersClassesListView.prototype.addItem.apply(this, arguments);
            this.$el.parents('.modifiers_table').show();
        }
    });

    return new (require('factory'))(modifiers_view.initViews.bind(modifiers_view), function() {
        App.Views.ModifiersView.ModifiersItemView = ModifiersItemView;
        App.Views.ModifiersClassesView.ModifiersClassesMatrixesView = ModifiersClassesMatrixesView;
        App.Views.ModifiersClassesView.ModifiersClassesListView = ModifiersClassesListView;
    });
});