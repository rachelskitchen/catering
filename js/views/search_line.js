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

define(["backbone", "factory"], function() {
    'use strict';

    App.Views.CoreSearchLineView = {};

    App.Views.CoreSearchLineView.CoreSearchLineMainView = App.Views.FactoryView.extend({
        name: 'search_line',
        mod: 'main',
        bindings: {
            ':el': 'classes: {collapsed: collapsed}',
            '.search-input': 'value: dummyString, valueTimeout: searchString, params: {timeout: 1500}, events: ["input", "blur", "change"]'
        },
        events: {
            'click .cancel-input': 'onCancel'
        },
        onEnterListeners: {
            '.cancel-input': 'onCancel'
        },
        onCancel: function() {
            this.model.empty_search_line();
        }
    });

    return new (require('factory'))(function() {
        App.Views.SearchLineView = {};
        App.Views.SearchLineView.SearchLineMainView = App.Views.CoreSearchLineView.CoreSearchLineMainView;
    });
});