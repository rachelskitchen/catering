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

define(["./tree", "./filters"], function(tree_view, filters_view) {
    'use strict';

    var SidebarMainView = App.Views.FactoryView.extend({
        name: 'sidebar',
        mod: 'main',
        bindings: {
            '.categories': 'updateContent: categories',
            '.filters': 'updateContent: filtersSet'
        },
        computeds: {
            categories: {
                deps: ['$categoriesTree'],
                get: function(categoriesTree) {
                    return {
                        name: 'Tree',
                        mod: 'Categories',
                        className: 'categories-tree',
                        collection: categoriesTree,
                        viewId: 0,
                        subViewIndex: 0
                    };
                }
            },
            filtersSet: {
                deps: ['curProductsSet_value'],
                get: function(productsSet) {
                    return {
                        name: 'Filter',
                        mod: 'Set',
                        model: productsSet,
                        collection: productsSet.get('filters'),
                        viewId: productsSet.id,
                        subViewIndex: 1
                    };
                }
            }
        }
    });

    return new (require('factory'))(tree_view.initViews.bind(tree_view), filters_view.initViews.bind(filters_view), function() {
        App.Views.SidebarView = {};
        App.Views.SidebarView.SidebarMainView = SidebarMainView;
    });
});