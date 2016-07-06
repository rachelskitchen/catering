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

define(["factory"], function() {
    'use strict';

    var TreeCategoryView = App.Views.FactoryView.extend({
        name: 'tree',
        mod: 'category',
        tagName: 'li',
        className: 'tree-item',
        initialize: function() {
            this.itemView = this.constructor;
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        bindings: {
            '.name': 'text: name, classes: {active: selected}, attr: {tabindex: select(selected, -1, 0)}',
            '.subtree': 'collection: items, itemView: "itemView"',
            ':el': 'classes: {"has-subtree": length(items), "no-subtree": not(length(items)), collapsed: collapsed}'
        },
        events: {
            'click .name:not(.active)': 'onClick'
        },
        onEnterListeners: {
            '.name:not(.active)': 'onClick'
        },
        onClick: function(event) {
            event.stopPropagation();
            // if item contains subtree need to change 'collapsed' attribute
            // otherwise need to update 'selected' attribute
            var attr = this.model.get('items').length ? 'collapsed' : 'selected';
            this.model.set(attr, !this.model.get(attr));
            this.appData.searchLine.empty_search_line();
        }
    });

    var TreeCategoriesView = App.Views.FactoryView.extend({
        name: 'tree',
        mod: 'categories',
        itemView: TreeCategoryView,
        bindings: {
            '.tree': 'collection: $collection, itemView: "itemView", toggle: not(ui_collapsed)',
            '.tree-title': 'classes: {collapsed: ui_collapsed}'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({collapsed: false});
            }
        },
        events: {
            'click .tree-title': 'onClick'
        },
        onEnterListeners: {
            '.tree-title': 'onClick'
        },
        onClick: function(event) {
            event.stopPropagation();
            var $ui =  this.getBinding('$ui');
            $ui.set('collapsed', !$ui.get('collapsed'));
        }
    });

    return new (require('factory'))(function() {
        App.Views.TreeView = {};
        App.Views.TreeView.TreeCategoriesView = TreeCategoriesView;
    });
});