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

define(['backbone', 'factory', 'generator', 'list'], function(Backbone) {
    'use strict';

    App.Views.CoreEstablishmentsView = {};

    App.Views.CoreEstablishmentsView.CoreEstablishmentsMainView = App.Views.FactoryView.extend({
        name: 'establishments',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(App.Data.establishments, 'hideEstsView', this.back); // the "Go Back" button was clicked
        },
        render: function() {
            var type = this.model.get('isMobileVersion') ? 'MOBILE' : 'DESKTOP';
            if (type === 'DESKTOP') this.model.set('showFooter', true);
            this.model.set('CHOOSE_BRAND', MSG['ESTABLISHMENTS_CHOOSE_BRAND_' + type].replace('%s', this.collection.getBrandName()));
            this.model.set('PROCEED_BUTTON', MSG.ESTABLISHMENTS_PROCEED_BUTTON);
            this.model.set('BACK_BUTTON', MSG.ESTABLISHMENTS_BACK_BUTTON);
            this.model.set('ALERT_MESSAGE', MSG['ESTABLISHMENTS_ALERT_MESSAGE_' + type]);
            this.model.set('ALERT_PROCEED_BUTTON', MSG['ESTABLISHMENTS_ALERT_PROCEED_BUTTON_' + type]);
            this.model.set('ALERT_BACK_BUTTON', MSG['ESTABLISHMENTS_ALERT_BACK_BUTTON_' + type]);
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.viewSelect = App.Views.GeneratorView.create('CoreEstablishments', {
                mod: 'Select',
                el: this.$('.establishments_select'),
                collection: this.collection
            }, 'ContentEstablishmentsSelect');
            this.subViews.push(this.viewSelect);
            return this;
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
            this.removeFromDOMTree(); // remove a view from DOM
        },
        /**
        * The "Proceed" button was clicked.
        */
        proceed: function() {
            var self = this,
                message,
                selectedEstablishmentID = this.$('select').val(),
                estExist = function() {
                    self.collection.trigger('changeEstablishment', selectedEstablishmentID);
                    self.back(); // the "Go Back" button was clicked
                },
                estNotExist = function() {
                    self.collection.trigger('changeEstablishment', selectedEstablishmentID);
                    self.removeFromDOMTree(); // remove a view from DOM
                };
            App.Data.selectEstablishmentMode = false;
            if (this.collection.getEstablishmentID()) { // get a establishment's ID
                if (this.model.get('needShowAlert')) {
                    if (this.model.get('isMobileVersion')) {
                        message = '<div class="establishments_alert_mobile">' +
                            '<p>' + MSG.ESTABLISHMENTS_ALERT_MESSAGE_TITLE_MOBILE + '</p>' +
                            '<p>' + this.model.get('ALERT_MESSAGE') + '</p>' +
                            '<p>' + MSG.ESTABLISHMENTS_ALERT_MESSAGE_QUESTION_MOBILE + '</p>' +
                        '</div>';
                    } else {
                        message = this.model.get('ALERT_MESSAGE');
                    }
                    App.Data.errors.alert(message, false, false, {
                        isConfirm: true,
                        confirm: {
                            ok: this.model.get('ALERT_PROCEED_BUTTON'),
                            cancel: this.model.get('ALERT_BACK_BUTTON'),
                            btnsSwap: true
                        },
                        callback: function(result) {
                            if (result) estExist();
                        }
                    }); // user notification
                } else {
                    estExist();
                }
            } else {
                estNotExist();
            }
        }
    });

    App.Views.CoreEstablishmentsView.CoreEstablishmentsSelectView = App.Views.ListView.extend({
        name: 'establishments',
        mod: 'select',
        initialize: function() {
            App.Views.ListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'add', this.addItem, this);
        },
        render: function() {
            App.Views.ListView.prototype.render.apply(this, arguments);
            this.collection.each(this.addItem.bind(this)); // add a item to the select menu
            return this;
        },
        /**
        * Add a item to the select menu.
        */
        addItem: function(model) {
            var currentEstablishment = this.collection.getEstablishmentID(); // get a establishment's ID
            if (currentEstablishment != model.get('id') && model.get('system_settings').online_and_app_orders) {
                this.viewSelectItem = App.Views.GeneratorView.create('CoreEstablishments', {
                    mod: 'SelectItem',
                    el: Backbone.$('<option value="' + model.get('id') + '"> </option>'),
                    model: model
                }, 'ContentEstablishmentsSelectItem' + model.get('id'));
                this.subViews.push(this.viewSelectItem);
                this.$('select').append(this.viewSelectItem.el);
            }
        }
    });

    App.Views.CoreEstablishmentsView.CoreEstablishmentsSelectItemView = App.Views.FactoryView.extend({
        name: 'establishments',
        mod: 'select_item'
    });

    return new (require('factory'))(function() {
        App.Views.EstablishmentsView = {};
        App.Views.EstablishmentsView.EstablishmentsMainView = App.Views.CoreEstablishmentsView.CoreEstablishmentsMainView;
    });
});