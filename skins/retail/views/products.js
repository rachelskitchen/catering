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

define(["backbone", "factory", "generator", 'products_view'], function(Backbone) {
    'use strict';

    App.Views.ProductView.ProductListItemView = App.Views.CoreProductView.CoreProductListItemView.extend({
        showModifiers: function() {
            var myorder = new App.Models.Myorder(),
                def = myorder.add_empty(this.model.get('id'), this.model.get('id_category'));

            $('#main-spinner').css('font-size', App.Data.getSpinnerSize() + 'px').addClass('ui-visible');
            def.then(function() {
                $('#main-spinner').removeClass('ui-visible');
                App.Data.mainModel.set('popup', {
                    modelName: 'MyOrder',
                    mod: 'Matrix',
                    model: myorder.clone(),
                    action: 'add'
                });
            });
        },
        show_hide: function() {
            this.parent = this.parent && this.parent.length ? this.parent : this.$el.parent();
            if (!this.model.get('active')) {
                this.$el.detach();
            } else {
                this.parent.append(this.$el);
            }
        }
    });

    App.Views.ProductView.ProductModifiersView = App.Views.CoreProductView.CoreProductModifiersView.extend({
        render: function() {
            App.Views.CoreProductView.CoreProductModifiersView.prototype.render.apply(this, arguments);
            this.showImage({
                currentTarget: this.$('.gallery > li:first')
            });
            return this;
        },
        events: function() {
            var parent = App.Views.CoreProductView.CoreProductModifiersView.prototype.events;
            return $.extend(parent, {
                'click li[data-index]': 'showImage'
            });
        },
        showImage: function(event) {
            var images = this.model.get('product').get('images'),
                li = $(event.currentTarget),
                index = li.attr('data-index'),
                image = this.$('.large');
            image.attr('src', images[index]);
            loadSpinner(image);
            this.$('.gallery > li').removeClass('active');
            li.addClass('active');
        }
    });
});
