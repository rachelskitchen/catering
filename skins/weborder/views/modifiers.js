define(["backbone", "factory", 'modifiers_view'], function(Backbone) {
    'use strict';

    App.Views.ModifiersClassesView.ModifiersClassesMatrixesView = App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixesView.extend({
        addItem: function() {
            App.Views.CoreModifiersClassesView.CoreModifiersClassesMatrixesView.prototype.addItem.apply(this, arguments);
            this.$el.parents('.modifiers_table').show();
        }
    });

    App.Views.ModifiersClassesView.ModifiersClassesListView = App.Views.CoreModifiersClassesView.CoreModifiersClassesListView.extend({
        addItem: function() {
            App.Views.CoreModifiersClassesView.CoreModifiersClassesListView.prototype.addItem.apply(this, arguments);
            this.$el.parents('.modifiers_table').show();
        }
    });
});