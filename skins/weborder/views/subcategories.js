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

define(["generator", "list"], function() {
    'use strict';

    var SubCategorySelectView = App.Views.ItemView.extend({
        name: 'subcategory',
        mod: 'select',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:active', this.show_hide);
            this.$black_box = Backbone.$('<div></div>'); // container for option elements
            this.show_hide();
        },
        show_hide: function() {
            if (!this.model.get('active') || this.model.get('parent_name') !== this.options.value) {
                this.$el.appendTo(this.$black_box);
            } else {
                this.options.parent.append(this.$el);
            }
        }
    });

    var SubCategoriesSelectView = App.Views.ListView.extend({
        name: 'subcategories',
        mod: 'select',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.listenTo(this.collection, 'change:parent_selected', this.parent_change);
            this.listenTo(this.collection, 'show_subcategory', this.show);
            this.listenTo(this.options.search, 'onSearchComplete', this.hide, this);
        },
        events: {
            'change select' : 'select_change'
        },
        parent_change: function(model, value) {
            var self = this,
                view,
                select = this.$('select');

            this.subViews.removeFromDOMTree();
            //self.$('select option').not(':first').remove();
            this.collection.sortEx('sortNumbers', 'sort').forEach(function(el) {
                view = App.Views.GeneratorView.create('SubCategory', {
                    mod: 'Select',
                    model: el,
                    value: value,
                    el: '<option value=' + el.get('id') + '></option>',
                    parent: select
                });
                self.subViews.push(view);
            });
        },
        select_change: function(e) {
            var el = $(e.currentTarget),
                val = el.val() * 1;

            this.collection.selected = val;
            this.collection.trigger('change:selected', this.collection, val);
        },
        show: function() {
            this.$("select").removeAttr("disabled");
            this.$(".select-wrapper").removeClass("disabled");
        },
        hide: function() {
            this.$("select").attr("disabled", "disabled");
            this.$(".select-wrapper").addClass("disabled");
        }
    });

    return new (require('factory'))(function() {
        App.Views.SubCategoryView = {};
        App.Views.SubCategoriesView = {};
        App.Views.SubCategoryView.SubCategorySelectView = SubCategorySelectView;
        App.Views.SubCategoriesView.SubCategoriesSelectView = SubCategoriesSelectView;
    });
});