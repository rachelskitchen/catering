define(["backbone", "factory", "instructions_view"], function(Backbone) {
    'use strict';

    App.Views.InstructionsView = {};

    App.Views.InstructionsView.InstructionsModifiersView = App.Views.CoreInstructionsView.CoreInstructionsModifiersView.extend({
        initialize: function() {
            App.Views.CoreInstructionsView.CoreInstructionsModifiersView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.position);
            this.position();
        },
        events: {
            'click .add_instructions': 'show_hide',
            'change .instructions': 'change_special'
        },
        position: function() {
            if (this.model.get_product().get('is_gift')) {
                this.$el.addClass('is_gift');
            } else {
                this.$el.removeClass('is_gift');
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
});