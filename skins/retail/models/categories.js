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

define(['categories'], function(Backbone) {
    'use strict';

    var coreCategories = App.Collections.Categories,
        Categories = coreCategories.extend({
            setSelected: function(selected) {
                this.selected = selected;
                this.trigger('change:selected', this, selected);
            },
            setParentSelected: function(parent_selected) {
                this.parent_selected = parent_selected;
                this.trigger('change:parent_selected', this, parent_selected);
            }
        });

    App.Collections.Categories = Categories
});