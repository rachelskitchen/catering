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
        render: function() {
            var type = this.model.get('isMobileVersion') ? 'MOBILE' : 'DESKTOP';
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
                message;
            if (this.model.get('isMobileVersion')) {
                message = '<div class="establishments_alert_mobile">' +
                    '<p>' + MSG.ESTABLISHMENTS_ALERT_MESSAGE_TITLE_MOBILE + '</p>' +
                    '<p>' + this.model.get('ALERT_MESSAGE') + '</p>' +
                    '<p>' + MSG.ESTABLISHMENTS_ALERT_MESSAGE_QUESTION_MOBILE + '</p>' +
                '</div>';
            } else {
                message = this.model.get('ALERT_MESSAGE');
            }
            tmpl_alert_message({
                message: message,
                reload_page: false,
                is_confirm: true,
                confirm: {
                    ok: this.model.get('ALERT_PROCEED_BUTTON'),
                    cancel: this.model.get('ALERT_BACK_BUTTON')
                },
                callback: function(result) {
                    if (result) {
                        var selectedEstablishmentID = self.$('select').val();
                        if (self.collection.getEstablishmentID() === undefined) { // get a establishment's ID
                            self.collection.trigger('changeEstablishment', selectedEstablishmentID);
                            self.removeFromDOMTree(); // remove a view from DOM
                        } else {
                            self.collection.trigger('resetEstablishmentData');
                            self.collection.trigger('changeEstablishment', selectedEstablishmentID);
                            self.back(); // the "Go Back" button was clicked
                        }
                    }
                }
            }); // user customized alerts for Weborder skin
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
            if (currentEstablishment != model.get('id')) {
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
});