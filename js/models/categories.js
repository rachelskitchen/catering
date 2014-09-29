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

define(["backbone", "collection_sort"], function(Backbone) {
    'use strict';

    App.Models.Category = Backbone.Model.extend({
        defaults: {
            description: '',
            id: null,
            image: App.Data.settings.get_img_default(),
            name: null,
            parent_name: null,
            parent_sort: null,
            sort: null,
            sort_val: null,
            img: App.Data.settings.get("img_path"),
            active: true
        }
    });

    App.Collections.Categories = App.Collections.CollectionSort.extend({
        model: App.Models.Category,
        selected: null,
        parent_selected: null,
        sortStrategy: "sortNumbers",
        sortKey: "sort_val",
        sortOrder: "asc", //or "desc"
        img: App.Data.settings.get("img_path"),
        /**
        * Get categories from backend.
        */
        get_categories: function() {
            var self = this;
            var dfd = $.Deferred();
            $.ajax({
                url: App.Data.settings.get("host") + "/weborders/product_categories/",
                data: {
                    establishment: App.Data.settings.get("establishment")
                },
                dataType: "json",
                successResp: function(data) {
                    if (data.length) {
                        self.selected = 0;
                        self.parent_selected = 0;
                    }
                    for (var i=0; i<data.length; i++) {
                        var category = data[i];
                        if (!category.image || category.image === "") {
                            category.image = App.Data.settings.get_img_default();
                        }
                        category.sort_val = parseInt(category.parent_sort || 0) * 1000 + parseInt(category.sort || 0);
                        self.add(category);
                    }
                    dfd.resolve();
                },
                error: function() {
                    App.Data.errors.alert(MSG.ERROR_CATEGORY_LOAD, true); // user notification
                }
            });
            return dfd;
        },
        /**
        * set category as inactive. Fired prom product collection, when all product in category became inactive
        */
        set_inactive: function(id) {
            this.where({id: id}).forEach(function(el) {
                el.set('active', false);
            });
        }
    });
});