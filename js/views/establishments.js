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

define(['backbone', 'factory'], function(Backbone) {
    'use strict';
    App.Views.CoreEstablishmentsView = {};
    App.Views.CoreEstablishmentsView.CoreEstablishmentsMainView = App.Views.FactoryView.extend({
        name: 'establishments',
        mod: 'main',
        initialize: function() {
            this.model = {};
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.model.brandName = this.collection.getBrandName(); // get a brand name
            this.model.clientName = App.Data.mainModel.get('clientName');
            $(this.el).html(this.template(this.model));
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            var view = new App.Views.CoreEstablishmentsView.CoreEstablishmentsSelectView({collection: this.collection});
            this.$('.establishments_select').append(view.el);
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
            App.Data.mainModel.set('isBlurContent', false);
            this.remove();
        },
        /**
        * The "Proceed" button was clicked.
        */
        proceed: function() {
            var model = {};
            model.selectedEstablishmentID = this.$('select').val();
            var view = new App.Views.CoreEstablishmentsView.CoreEstablishmentsConfirmationView({model: model});
            this.$el.append(view.el);
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
            this.collection.each(this.addItem.bind(this));
            return this;
        },
        /**
        * Add a item to the select menu.
        */
        addItem: function(model) {
            this.$('select').append('<option value="' + model.get('id') + '">' + model.get('name') + ', ' + model.get('line_1') + ', ' + model.get('city_name') + '</option>');
        }
    });
    App.Views.CoreEstablishmentsView.CoreEstablishmentsConfirmationView = App.Views.FactoryView.extend({
        name: 'establishments',
        mod: 'confirmation',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            return this;
        },
        events: {
            'click button[name=back_confirm]': 'back',
            'click button[name=proceed_confirm]': 'proceed'
        },
        /**
        * The "Go Back" button was clicked.
        */
        back: function() {
            this.remove();
        },
        /**
        * The "Proceed" button was clicked.
        */
        proceed: function() {
            var moveAddress = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
            var paramsAddress = '';
            var params = parse_get_params(); // get GET-parameters from address line
            if (empty_object(params)) { // check object (empty or not empty)
                paramsAddress += '?establishment=' + this.model.selectedEstablishmentID;
            } else {
                var issetEstablishment = false;
                for (var i in params) {
                    var param = '';
                    if (i !== 'establishment') {
                        param = i + '=' + params[i];
                    } else {
                        issetEstablishment = true;
                        param = i + '=' + this.model.selectedEstablishmentID;
                    }
                    if (paramsAddress === '') {
                        paramsAddress += '?';
                    } else {
                        paramsAddress += '&';
                    }
                    paramsAddress += param;
                }
                if (!issetEstablishment) paramsAddress += '&establishment=' + this.model.selectedEstablishmentID;
            }
            moveAddress += paramsAddress;
            window.location.href = moveAddress;
        }
    });
});