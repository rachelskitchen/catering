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

define(["backbone", "factory", "generator"], function(Backbone) {
    'use strict';

    App.Views.HeaderView = {};

    App.Views.HeaderView.HeaderMainView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:page_title', this.updateTitle);
        },
        updateTitle: function() {
            this.$('h1').text(this.model.get('page_title'));
        }
    });

    App.Views.HeaderView.HeaderOneButtonView = App.Views.HeaderView.HeaderMainView.extend({
        name: 'header',
        mod: 'one_button',
        initialize: function() {
            App.Views.HeaderView.HeaderMainView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:back_title', this.updateBackTitle, this);
            this.listenTo(this.model, 'change:page_title', this.showBtn, this);
        },
        render: function() {
            App.Views.HeaderView.HeaderMainView.prototype.render.apply(this, arguments);
            this.showBtn();
            return this;
        },
        events: {
            "click .leftBtn": "back"
        },
        updateBackTitle: function() {
            this.$('.leftBtn span').text(this.model.get('back_title'));
        },
        back: function() {
            var back = this.model.get('back');
            typeof back == 'function' && back();
        },
        showBtn: function() {
            // bug 13280
            this.model.get('page_title') && this.$('.leftBtn').show();
        }
    });

    App.Views.HeaderView.HeaderTwoButtonView = App.Views.HeaderView.HeaderOneButtonView.extend({
        name: 'header',
        mod: 'two_button',
        initialize: function() {
            App.Views.HeaderView.HeaderOneButtonView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:forward_title', this.updateForwardTitle);
        },
        events: {
            "click .leftBtn": "back",
            "click .rightBtn": "forward"
        },
        updateForwardTitle: function() {
            this.$('.rightBtn span').text(this.model.get('forward_title'));
        },
        forward: function(e) {
            if (!$(e.currentTarget).hasClass('disabled')) {
                var forward = this.model.get('forward');
                typeof forward == 'function' && forward();
            }
        },
        showBtn: function() {
            if(!this.model.get('page_title'))
                return;
            App.Views.HeaderView.HeaderOneButtonView.prototype.showBtn.apply(this, arguments);
            this.$('.rightBtn').show();
        }
    });

    App.Views.HeaderView.HeaderModifiersView = App.Views.HeaderView.HeaderTwoButtonView.extend({
        name: 'header',
        mod: 'two_button',
        render: function() {
            App.Views.HeaderView.HeaderTwoButtonView.prototype.render.apply(this, arguments);
            this.listenTo(this.model.get('order').get('product'), 'change:attribute_1_selected change:attribute_2_selected', this.update);
            this.update();
        },
        events: {
            "click .leftBtn": "back",
            "click .rightBtn": "forward"
        },
        update: function() {
            if (this.model.get('order').get('product').check_selected()) {
                this.$('.rightBtn').removeClass('disabled');
            } else {
                this.$('.rightBtn').addClass('disabled');
            }
        }
    });

    App.Views.HeaderView.HeaderLocationView = App.Views.HeaderView.HeaderTwoButtonView.extend({
        name: 'header',
        mod: 'two_button',
        render: function() {
            App.Views.HeaderView.HeaderTwoButtonView.prototype.render.apply(this, arguments);
            var second_button = this.$('.header_block_button_right');
            second_button.hide();
            App.Data.settings.get("settings_system").geolocation_load.done(function() {
                second_button.show();
            });
        }
    });

    App.Views.HeaderView.HeaderMaintenanceView = App.Views.FactoryView.extend({
        name: 'header',
        mod: 'maintenance'
    });
});