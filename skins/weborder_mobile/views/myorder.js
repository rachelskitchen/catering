define(["backbone", "myorder_view"], function(Backbone) {
    'use strict';

    App.Views.MyOrderView.MyOrderMatrixView = App.Views.CoreMyOrderView.CoreMyOrderMatrixView.extend({
        render: function() {
            App.Views.CoreMyOrderView.CoreMyOrderMatrixView.prototype.render.apply(this, arguments);
            var model = this.model,
                view;

            var sold_by_weight = this.model.get_product().get("sold_by_weight"),
                mod = sold_by_weight ? 'Weight' : 'Main';

            view = App.Views.GeneratorView.create('Quantity', {
                el: this.$('.quantity_info'),
                model: model,
                mod: mod
            });
            this.subViews.push(view);

            if(App.Data.settings.get('settings_system').special_requests_online) {
                view = App.Views.GeneratorView.create('Instructions', {
                    el: this.$('.product_instructions'),
                    model: model,
                    mod: 'Modifiers'
                });
                this.subViews.push(view);
            }

            return this;
        }
    });

    App.Views.MyOrderView.MyOrderItemView = App.Views.CoreMyOrderView.CoreMyOrderItemView.extend({
        editItem: function(e) {
            e.preventDefault();
            var index = this.model.collection.models.indexOf(this.model);
            App.Data.router.navigate('modifiers_edit/' + index, true);
        }
    });
});