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

define(["instructions_view"], function(instructions_view) {
    'use strict';

    var InstructionsModifiersView = App.Views.CoreInstructionsView.CoreInstructionsModifiersView.extend({
        initialize: function() {
            App.Views.CoreInstructionsView.CoreInstructionsModifiersView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.position);
            this.listenTo(this.model, 'change:special', this.update_show, this);
            this.position();
        },
        events: {
            'click .add_instructions': 'show_hide',
            'change .instructions': 'change_special'
        },
        position: function() {
            var product = this.model.get_product(),
                addBtn = this.$('.add_instructions');
            if (product.get('is_gift')) {
                this.$el.addClass('is_gift');
            } else {
                this.$el.removeClass('is_gift');
            }

            if(product.isParent()) {
                addBtn.addClass('parent-product');
            } else {
                addBtn.removeClass('parent-product');
            }
        },
        update_show: function() {
            var block = this.$('.instruction_block'),
                button = this.$('.add_instructions');

            if (!block.is(':visible')) {
                block.show();
                button.html('Remove Special Instructions');
            this.$el.trigger('change_height');
            }
        },
        show_hide: function() {
            var block = this.$('.instruction_block'),
                button = this.$('.add_instructions');

            if (!block.is(':visible')) {
                block.show();
                button.html('Remove Special Instructions');
            } else {
                block.hide();
                button.html('Add Special Instructions');
                this.model.set('special', '', {silent : true});
                this.$('.instructions').val('');
            }
            this.$el.trigger('change_height');
        },
        render: function() {
            var model = this.model.toJSON(),
                product = this.model.get_product();
            model.sold_by_weight = product.get("sold_by_weight");
            this.$el.html(this.template(model));

            var block = this.$('.instruction_block'),
                button = this.$('.add_instructions'),
                modifiers = this.model.get_modifiers();

            if(modifiers instanceof Backbone.Collection && modifiers.length == 0)
                this.$('.note').addClass('no-modifiers');

            if (this.model.get('special')) {
                block.show();
                button.html('Remove Special Instructions');
            }
        }
    });

    return new (require('factory'))(instructions_view.initViews.bind(instructions_view), function() {
        App.Views.InstructionsView = {};
        App.Views.InstructionsView.InstructionsModifiersView = InstructionsModifiersView;
    });
});