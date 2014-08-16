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

define(['backbone'], function(Backbone) {
    App.Views.FactoryView = Backbone.View.extend({
        constructor: function() {
            this.subViews = [];
            this.subViews.remove = function() {
                while(this.length > 0) {
                    var view = this.shift();
                    view instanceof Backbone.View && view.remove();
                };
            };
            this.subViews.removeFromDOMTree = function() {
                while(this.length > 0) {
                    var view = this.shift();
                    view instanceof Backbone.View && view.removeFromDOMTree();
                };
            };
            return Backbone.View.prototype.constructor.apply(this, arguments);
        },
        initialize: function() {
            this.template = template_helper(this.name, this.mod);
            this.render();
            App.Data.devMode && this.$el.attr("data-tmpl", this.name + "_" + this.mod + "-template");
        },
        render: function() {
            this.$el.html(this.template(this.model ? (this.model.toJSON ? this.model.toJSON() : this.model) : undefined));
            return this;
        },
        remove: function() {
            this.subViews.remove();
            return Backbone.View.prototype.remove.apply(this, arguments);
        },
        removeFromDOMTree: function() {
            this.$el.detach();
        },
        /*
         * fix for Bug 12265
         * caret is visible over all layouts on the page in ios safari
         */
        iOSSafariCaretFix: function() {
            if(!(cssua.ua.ios && cssua.ua.webkit))
                return;

            var data = this.$('.ios-safari-caret-fix');

            // show input if user clicks on another input
            data.on('blur', '.ios-safari-caret:hidden', function() {
                $(this).show();
            });

            data.on('scroll', function() {
                var dataTop = data.offset().top,
                    dataHeight = data.height();

                // show hidden inputs if they are inside of visible area
                $('.ios-safari-caret:hidden', data).each(function() {
                    var field = $(this),
                        fieldTop = field.parent().offset().top,
                        fieldHeight = field.height();

                    if(dataTop < fieldTop + fieldHeight && dataTop + dataHeight > fieldTop)
                        field.show();
                });

                // if input is in focus and outside of visible area it should be hidden
                $('.ios-safari-caret:focus:visible', data).each(function() {
                    var field = $(this),
                        fieldTop = field.parent().offset().top,
                        fieldHeight = field.height();

                    if(dataTop > fieldTop + fieldHeight / 2 || dataTop + dataHeight < fieldTop)
                        field.hide();
                });
            });
        }
    });
});