define(["backbone", "factory", "instructions_view"], function(Backbone) {
    'use strict';

    App.Views.InstructionsView = {};

    App.Views.InstructionsView.InstructionsModifiersView = App.Views.CoreInstructionsView.CoreInstructionsModifiersView.extend({
        render: function() {
            var self = this;
            App.Views.CoreInstructionsView.CoreInstructionsModifiersView.prototype.render.apply(this, arguments);
            /* Bug 5278 */
            this.$('textarea').on('touchstart', function() {
               var $self = $(this);
               setTimeout(function() {
                   var $scroll = $self.parents('.ps-container');
                    if ($self.position().top + $self.outerHeight() > $scroll.height()) {
                        $scroll.scrollTop($scroll.scrollTop() + $self.position().top + $self.outerHeight() - $scroll.height());
                    }
                    $self[0].scrollIntoView();
                    if (!isIEMobile() && !isAndroidWebKit()) {
                       $scroll.perfectScrollbar('update');
                    }
                    $self.focus();
               },500);
            });
            /* end Bug 5278 */
        }
    });
});