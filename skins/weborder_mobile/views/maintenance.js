define(["backbone", "factory"], function(Backbone) {
    'use strict';

    App.Views.MaintenanceView = {};

    App.Views.MaintenanceView.MaintenanceMainView = App.Views.FactoryView.extend({
        name: 'maintenance',
        mod: 'main'
    });

});