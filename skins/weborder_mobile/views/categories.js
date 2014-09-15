define(["backbone", 'factory', 'generator', 'list'], function(Backbone) {

  App.Views.CategoriesView.CategoriesItemView = App.Views.LazyItemView.extend({
        name: 'categories',
        mod: 'item',
        initialize: function() {
            App.Views.ItemView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:active', this.show_hide);
            this.show_hide();
        },
        render: function() {
            var self = this;
            var model = self.model.toJSON();
            model.hide_images = App.Data.settings.get('settings_system').hide_images;
            self.$el.html(self.template(model));
            return this;
        },
        events: {
            "click": "showProducts"
        },
        showProducts: function(e) {
            e.preventDefault();
            var id = this.model.get('id');
            App.Data.router.navigate("products/" + id, true);
        },
        show_hide: function() {
            if (!this.model.get('active')) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
        }
    });

    App.Views.CategoriesView.CategoriesMainView = App.Views.LazyListView.extend({
        name: 'categories',
        mod: 'main',
        initialize: function() {
            App.Views.LazyListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'load_complete', this.render, this);
        },
        render: function() {
            App.Views.LazyListView.prototype.render.apply(this, arguments);           
            return this;
        },
        addItem: function(model) {
            var view = App.Views.GeneratorView.create('Categories', {
                el: $('<li></li>'),
                mod: 'Item',
                model: model
            }, model.cid);
            //trace("AddItem=>",model.get('name'),model.cid, model.escape('parent_sort'), model.escape('sort'), model.get("sort_val"));
            App.Views.LazyListView.prototype.addItem.call(this, view, this.$('.categories'));
            this.subViews.push(view);
        }
    });
});
   