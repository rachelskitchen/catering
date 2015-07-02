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

    var ItemView = App.Views.FactoryView.extend({
        afterRender: function(sort) {
            this.$el.attr('data-sort', sort);
            loadSpinner(this.$("img"));
        }
    });

    var ListView = App.Views.FactoryView.extend({
        render: function() {
            this.initOrderSort();
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            return this;
        },
        addItem: function(view, parent, sort, sortedEl) {
            var index;
            sortedEl = sortedEl || '';

            if (sort == undefined) {
                parent.append(view.el);
                return;
            }

            this.orderSort.push(sort);
            this.orderSort.sort(function(x, y) {
                x = parseFloat(x, 10);
                y = parseFloat(y, 10);
                return x < y ? -1 : x > y ? 1 : 0;
            });
            index = this.orderSort.indexOf(sort);
            if(index == 0) {
                parent.prepend(view.el);
            } else if(index == this.orderSort.length - 1) {
                parent.append(view.el);
            } else {
                parent.children(sortedEl + '[data-sort="' + this.orderSort[index + 1] + '"]').first().before(view.el);
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
            this.subViews.sort(function(mx, my) {
                var x = mx.model.get(attr);
                var y = my.model.get(attr);
                var result = x < y ? -1 : x > y ? 1 : 0;
                if (result == 0 && attr != 'name') {
                    //for equal attributes sort models by attr 'name':
                    x = mx.model.get('name');
                    y = my.model.get('name');
                    result = x < y ? -1 : x > y ? 1 : 0;
                    return result; // 'asc' always
                }
                return order ? -1 * result : result;
            });
            this.subViews.reduce(function(x, y) {
                x.$el.after(y.$el);
                return y;
            });
        }
    });

    var LazyItemView = App.Views.FactoryView.extend({
    });

    var LazyListView = App.Views.FactoryView.extend({
        initialize: function() {
            this.content_elem = this.options.content_elem || "#content";
            this.parent_elem = this.options.parent_elem || "ul";
            this.list_elem = this.options.list_elem || "li";
            this.image_url_key = this.options.image_url_key || "image"; //it's name of image property in a model
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'sort', this.sort);           
        },
        render: function(sortedModels) {
            this.sortedModels = sortedModels ? sortedModels : this.collection.models;
            this.resetScroll();
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            setTimeout((function() {
                this.sortedModels.forEach(this.addItem.bind(this));
                this.onScroll();
                this.trigger('itemsInserted'); // need trigger event to notify when items is inserted to DOM
                $(this.content_elem).on('scroll', this.onScroll.bind(this));
            }).bind(this), 0);
            return this;
        },
        addItem: function(view) {
            this.$(this.parent_elem).append(view.el);
            this.sortedSpinnersIndexById[view.model.cid] = this.index++;
            view.$el.addClass('lazy_item_' + view.model.cid);
        },
        resetScroll: function() {
            this.sortedSpinnersIndexById = {};
            this.index = 0;
        },
        onScroll: function(event) {
            var scrollTop = $(this.content_elem).scrollTop(),
                rowHeight = this.$(this.list_elem).outerHeight(),
                contentHeight = $(this.content_elem).outerHeight();

            var startIndex = Math.round(scrollTop/rowHeight);
            var endIndex = startIndex + Math.round(contentHeight/rowHeight);

            if (isNaN(startIndex) || isNaN(endIndex))
                return;

            startIndex > 0 && startIndex--; //expand the upper bound of shown spinners (it's for reliability)
            // Expand the bottom bound of shown spinners/images up to 6 items more.
            if (endIndex + 6 > this.sortedModels.length-1)
                endIndex = this.sortedModels.length-1;
            else
                endIndex += 6;

            //trace("startIndex=", startIndex, "endIndex = ", endIndex);
            for (var i = 0; i < this.sortedModels.length; i++) {

                var listElem = this.$('.lazy_item_' + this.sortedModels[i].cid),
                    img = listElem.find('img');

                if (i >= startIndex && i <= endIndex && !img.attr('src')) {

                    var model = this.sortedModels[i];

                    img.attr('src', model.get("logo_url_final") ? model.get("logo_url_final") : model.get(this.image_url_key));
                    loadSpinner(img, {spinner: true, anim: true});
                }
            }
        },
        sort: function() {
            var list = [];
            this.resetScroll();
            this.sortedModels.forEach(function(model) {
                // list.push($('.lazy_item_' + model.cid, $(this.parent_elem)));
                list.push(this.$('.lazy_item_' + model.cid));
                this.sortedSpinnersIndexById[model.cid] = this.index++;
            }, this);

            // $(this.parent_elem).append(list);
            this.$(this.parent_elem).append(list);

            this.onScroll();
        },
        culcImageSize: function(model) {
            if (!this.preferWidth || !this.preferHeight) {
                // this.preferWidth = Math.round($("#content .img").width());
                // this.preferHeight = Math.round($("#content .img").height());
                this.preferWidth = Math.round(this.$('.img').width());
                this.preferHeight = Math.round(this.$('.img').height());
            }

            var logo_url = model.get(this.image_url_key);
            var options = '?options={"size":[' + this.preferWidth + "," +  this.preferHeight + "]}";
            var logo_url_sized = logo_url + options;

            if (App.Data.settings.get_img_default() != logo_url) {
                logo_url = logo_url_sized;
            }
            model.set("logo_url_final", logo_url);
        }
    });

    return new (require('factory'))(function() {
        App.Views.ItemView = ItemView;
        App.Views.ListView = ListView;
        App.Views.LazyItemView = LazyItemView;
        App.Views.LazyListView = LazyListView;
    });
});