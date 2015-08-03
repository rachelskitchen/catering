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

    var HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        bindings: {
           '.title': 'text:page_title'
        }
    });

    var HeaderTabsView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'tabs',
        tagName: 'ul',
        bindings: {
            ':el': "attr: {'data-active-tab': tab}",
            '[data-tab="0"]': "classes: {'font-color2': equal(0, tab)}",
            '[data-tab="1"]': "classes: {'font-color2': equal(1, tab)}",
            '[data-tab="2"]': "classes: {'font-color2': equal(2, tab)}",
        },
        events: {
            'click li': 'onTab'
        },
        onTab: function(e) {
            var tab = Backbone.$(e.target).data('tab');
            this.model.set('tab', tab);
        }
    });

    var HeaderMaintenanceView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'maintenance'
    });

    return new (require('factory'))(function() {
        App.Views.HeaderView = {};
        App.Views.HeaderView.HeaderMainView = HeaderMainView;
        App.Views.HeaderView.HeaderTabsView = HeaderTabsView;
        App.Views.HeaderView.HeaderMaintenanceView = HeaderMaintenanceView;
    });
});