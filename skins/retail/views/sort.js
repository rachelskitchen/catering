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

    var SortItemView = App.Views.FactoryView.extend({
        name: 'sort',
        mod: 'item',
        className: 'sort-item',
        bindings: {
            ':el': 'classes: {active: selected}, attr: {tabindex: 0}'
        },
        events: {
            'click': 'select'
        },
        onEnterListeners: {
            ':el': 'select'
        },
        select: function() {
            this.model.set('selected', true);
        }
    });

    var SortItemsView = App.Views.FactoryView.extend({
        name: 'sort',
        mod: 'items',
        itemView: SortItemView,
        bindings: {
            ':el': 'outsideTouch: ui_collapsed, classes: {collapsed: ui_collapsed}, attr: {tabindex: 0}',
            '.sort-items': 'collection: $collection, itemView: "itemView"'
        },
        bindingSources: {
            ui: function() {
                return new Backbone.Model({collapsed: true});
            }
        },
        events: {
            'click': 'visibilityControl',
            'onOutsideTouch': 'hide'
        },
        onEnterListeners: {
            ':el': 'visibilityControl'
        },
        visibilityControl: function () {
            this.setBinding('ui_collapsed', !this.getBinding('ui_collapsed'));
        },
        hide: function() {
            this.setBinding('ui_collapsed', true);
        }
    });

    return new (require('factory'))(function() {
        App.Views.SortView = {};
        App.Views.SortView.SortItemsView = SortItemsView;
    });
});