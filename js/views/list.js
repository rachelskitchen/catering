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

define(["backbone", "factory"], function(Backbone) {
    'use strict';

    App.Views.ItemView = App.Views.FactoryView.extend({
        afterRender: function(sort) {
            this.$el.attr('data-sort', sort);
            loadSpinner(this.$("img"));
        }
    });

    App.Views.ListView = App.Views.FactoryView.extend({
        render: function() {
            this.initOrderSort();
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            return this;
        },
        addItem: function(view, parent, sort, sortedEl) {
            var index;
            sortedEl = sortedEl || '';
            this.orderSort.push(sort);
            this.orderSort.sort(function(x, y) {
                x = parseInt(x, 10);
                y = parseInt(y, 10);
                return x < y ? -1 : x > y ? 1 : 0;
            });
            index = this.orderSort.indexOf(sort);
            if(index == 0) {
                parent.prepend(view.el);
            } else if(index == this.orderSort.length - 1) {
                parent.append(view.el);
            } else {
                this.$(parent).children(sortedEl + '[data-sort=' + this.orderSort[index + 1] + ']').first().before(view.el);
            }
        },
        initOrderSort: function() {
            this.orderSort = [];
        },
        /*
         * orders:
         * 0 - asc
         * 1 - desc
         */
        sortItems: function(attr, order) {
            this.subViews.sort(function(x, y) {
                x = x.model.get(attr);
                y = y.model.get(attr);
                var result = x < y ? -1 : x > y ? 1 : 0;
                return order ? -1 * result : result;
            });
            this.subViews.reduce(function(x, y) {
                x.$el.after(y.$el);
                return y;
            });
        }
    });
});