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

define(["backbone", "list"], function(Backbone) {
    'use strict';

    /*
     * expected that template will look like following
     * <div>
     *     <div class='to-left'></div>
     *     <div class='wrapper'>
     *         <div class='items'>
     *             <div class='item'></div>
     *             ...
     *         </div>
     *     </div>
     *     <div class='to-right'></div>
     * </div>
     *
     * this.model      - model that can invoke `loadCompleted` event
     * this.collection - collection of some models
     * this.$wrapper   - jquery selector of element that has child HTMLElement-wrapper for items ($('.wrapper'))
     * this.$items     - jquery selector of element that is HTMLElement-wrapper for items ($('.items'))
     * this.$item      - jquery selector of element that is HTMLElement-wrapper for item ($('.item'))
     * this.$toLeft    - jquery selector of element that is HTMLElement-wrapper for slide-to-left button ($('.to-left'))
     * this.$toRight   - jquery selector of element that is HTMLElement-wrapper for slide-to-left button ($('.to-right'))
     *
     * All listed above properties should be set during extending of App.Views.SliderView class
     */
    App.Views.SliderView = App.Views.ListView.extend({
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'add', this.addItem, this);
            this.listener = this.create_slider.bind(this);
            $(window).on('resize', this.listener);
            this.listenTo(this.model, "loadCompleted", this.listener);
        },
        remove: function() {
            $(window).off('resize', this.listener);
            App.Views.ListView.prototype.remove.apply(this, arguments);
        },
        render: function() {
            App.Views.ListView.prototype.render.apply(this, arguments);
            this.collection.each(this.addItem.bind(this));
            this.collection.receiving && this.collection.receiving.then(this.selectFirst.bind(this));
            return this;
        },
        selectFirst: function() {
            this.$('input').first().click();
        },
        update_slider_render: function() {
            this.create_slider();
            if (this.$('input:checked').parent().hasClass('hide'))
                this.$('input').first().click();
        },
        addItem: function() {
            App.Views.ListView.prototype.addItem.apply(this, arguments);
            this.create_slider();
        },
        create_slider: function() {
            if(!this.$wrapper)
                return;

            if(typeof this.widthOffset == 'undefined')
                this.widthOffset = this.$el.width() - this.$wrapper.width();

            var slider = this.$el,
                sliderWidth = slider.width() - this.widthOffset,
                lis = this.$item.not(':hidden'),
                elemWidth = lis.outerWidth(true);

            if (sliderWidth <= 0)
                return;

            this.slider_count = Math.floor(sliderWidth / elemWidth);
            this.slider_elem_count = lis.length;
            this.slider_index = this.slider_index || 0;
            this.slider_elem_width = elemWidth;

            this.$wrapper.css('max-width', (elemWidth * Math.min(this.slider_count, this.slider_elem_count) - 1) + 'px'); // minus border and padding
            if (this.slider_elem_count < this.slider_count) {
                this.slider_index = 0;
            } else {
                this.slider_index = Math.min(this.slider_elem_count - this.slider_count, this.slider_index);
            }
            this.$items.css('left', -this.slider_index * this.slider_elem_width + 'px');

            this.update_slider();
        },
        update_slider: function() {
            var lis = this.$item.not(':hidden');

            if (this.slider_index === 0)
                this.$toLeft.hide();
            else
                this.$toLeft.show();

            if (this.slider_count + this.slider_index >= this.slider_elem_count)
                this.$toRight.hide();
            else
                this.$toRight.show();
        },
        slide_right: function() {
            var ul = this.$items;
            ul.css('left', -this.slider_index * this.slider_elem_width + 'px');
            this.slider_index++;
            ul.animate({
                left: "-=" + this.slider_elem_width
            });

            this.update_slider();
        },
        slide_left: function() {
            var ul = this.$items;
            ul.css('left', -this.slider_index * this.slider_elem_width + 'px');
            this.slider_index--;
            ul.animate({
                left: "+=" + this.slider_elem_width
            });

            this.update_slider();
        }
    });
});