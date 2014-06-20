define(["backbone", "factory", "generator", "list"], function(Backbone) {
    'use strict';

    App.Views.SubCategoryView = {};

    App.Views.SubCategoryView.SubCategorySelectView = App.Views.ItemView.extend({
        name: 'subcategory',
        mod: 'select',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:active', this.show_hide);
            this.$black_box = Backbone.$('<div></div>'); // container for option elements
            this.show_hide();
        },
        show_hide: function() {
            if (!this.model.get('active') || this.model.get('parent_name') !== this.options.value) {
                this.$el.appendTo(this.$black_box);
            } else {
                this.options.parent.append(this.$el);
            }
        }
    });

    App.Views.SubCategoriesView = {};

    App.Views.SubCategoriesView.SubCategoriesSelectView = App.Views.ListView.extend({
        name: 'subcategories',
        mod: 'select',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.listenTo(this.collection, 'change:parent_selected', this.parent_change);
        },
        events: {
            'change select' : 'select_change'
        },
        parent_change: function(model, value) {
            var self = this,
                view,
                select = this.$('select');

            this.subViews.removeFromDOMTree();
            //self.$('select option').not(':first').remove();
            this.collection.each(function(el) {
                view = App.Views.GeneratorView.create('SubCategory', {
                    mod: 'Select',
                    model: el,
                    value: value,
                    el: '<option value=' + el.get('id') + '></option>',
                    parent: select
                });
                self.subViews.push(view);
            });
        },
        select_change: function(e) {
            var el = $(e.currentTarget),
                val = el.val() * 1;

            this.collection.selected = val;
            this.collection.trigger('change:selected', this.collection, val);
        }
    });
});