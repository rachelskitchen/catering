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

define(['backbone', 'factory', 'generator'], function(Backbone) {
    'use strict';
    App.Views.CoreEstablishmentsView = {};
    App.Views.CoreEstablishmentsView.CoreEstablishmentsMainView = App.Views.FactoryView.extend({
        name: 'establishments',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.model.set('brandName', this.collection.getBrandName()); // get a brand name
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            var viewSelect = App.Views.GeneratorView.create('CoreEstablishments', {
                mod: 'Select',
                el: this.$('.select-wrapper'),
                collection: this.collection
            }, 'core_establishments_select_view');
            this.subViews.push(viewSelect);
            return this;
        },
        remove: function() {
            App.Views.FactoryView.prototype.remove.apply(this, arguments);
        },
        events: {
            'click button[name=back]': 'back',
            'click button[name=proceed]': 'proceed'
        },
        /**
        * The "Go Back" button was clicked.
        */
        back: function() {
            this.collection.trigger('clickButtonBack');
            this.remove();
        },
        /**
        * The "Proceed" button was clicked.
        */
        proceed: function() {
            var self = this;
            tmpl_alert_message({
                message: 'If you choose a different store location, your order will be canceled. Cancel Order?',
                reload_page: false,
                is_confirm: true,
                confirm: {
                    ok: 'Proceed',
                    cancel: 'Go Back'
                },
                callback: function(result) {
                    if (result) {
                        var selectedEstablishmentID = self.$('select').val();
                        if (App.Data.settings.get('establishment') !== selectedEstablishmentID) {
                            $('#loader').show();
                            if (App.Data.settings.get('establishment') === null) {
                                App.Data.establishments.trigger('changeEstablishment', selectedEstablishmentID);
                                self.remove();
                            } else {
                                delete App.Data.router;
                                delete App.Data.categories;
                                delete App.Data.AboutModel;
                                delete App.Data.mainModel.get('cart').collection;
                                delete App.Data.mainModel.get('header').collection;
                                delete App.Data.mainModel.get('header').model;
                                $('link[href$="colors.css"]').remove();
                                $('.main-container').remove();
                                App.Data.establishments.trigger('changeEstablishment', selectedEstablishmentID);
                                self.back(); // the "Go Back" button was clicked
                            }
                        } else {
                            self.back(); // the "Go Back" button was clicked
                        }
                    }
                }
            });
        }
    });
    App.Views.CoreEstablishmentsView.CoreEstablishmentsSelectView = App.Views.FactoryView.extend({
        name: 'establishments',
        mod: 'select',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.collection.each(this.addItem.bind(this)); // add a item to the select menu
            return this;
        },
        /**
        * Add a item to the select menu.
        */
        addItem: function(model) {
            this.$('select').append('<option value="' + model.get('id') + '">' + model.get('name') + ', ' + model.get('line_1') + ', ' + model.get('city_name') + '</option>');
        }
    });
});