define(["backbone", "factory", "generator", "store_info_view"], function(Backbone) {
    'use strict';

    App.Views.StoreInfoView = {};

    App.Views.StoreInfoView.StoreInfoAboutView = App.Views.FactoryView.extend({
        name: 'store_info',
        mod: 'about',
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.$('.gallery').gallery({
                images: this.model.get('images'),
                animate: true,
                circle: true
            });
            loadSpinner(this.$('.about-image'));
            this.$('.about_content').contentarrow();
            return this;
        },
        remove: function() {
            this.$('.about_content').contentarrow('destroy');
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        }
    });

    App.Views.StoreInfoView.StoreInfoMapView = App.Views.CoreStoreInfoView.CoreStoreInfoMainView.extend({
        name: 'store_info',
        mod: 'map',
        render: function() {
            this.model = new Backbone.Model(this.infoDetailed());
            App.Views.CoreStoreInfoView.CoreStoreInfoMainView.prototype.render.apply(this, arguments);
            this.map(true, true, true);
            this.$('.info_map_wrapper').contentarrow();
        }
    });
});