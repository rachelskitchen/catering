define(["backbone", "factory", "generator", "list", 'products_view'], function(Backbone) {
    'use strict';

    App.Views.ProductView.ProductModifiersView = App.Views.CoreProductView.CoreProductModifiersView.extend({
        render: function() {
           App.Views.CoreProductView.CoreProductModifiersView.prototype.render.apply(this, arguments);
           this.product.get('is_gift') && this.$el.addClass('is_gift');
        }
    });
});