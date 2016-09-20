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

define(['./notification'], function(notification_view) {
	'use strict';

	var NotificationMainView = App.Views.FactoryView.extend({
		name: 'notification',
		mod: 'main',
		className: 'notification-box text-left category-bg primary-border',
		initialize: function() {
			App.Views.FactoryView.prototype.initialize.apply(this, arguments);

			var self = this;
			setTimeout(function() {
				self.close();
			}, 4000);
		},
		render: function() {
			App.Views.FactoryView.prototype.render.apply(this, arguments);
			this.show();
		},
		bindings: {
			'.image': 'classes: {hide: not(getImage)}, attr: {src: getImage}',
			'.title': 'toggle: getTitle, text: getTitle',
			'.text': 'toggle: getText, text: getText'
		},
		computeds: {
			getImage: function() {
				return this.getBinding('image') || '';
			},
			getTitle: function() {
				return this.getBinding('title') || '';
			},
			getText: function() {
				return this.getBinding('text') || '';
			}
		},
		events: {
			'click .close': 'close'
		},
		show: function() {
			var self = this;
			setTimeout(function() {
				self.$el.addClass('shown');
			}, 10);
		},
		close: function() {
			var self = this;

			this.$el.removeClass('shown');

			setTimeout(function() {
				self.remove();
			}, 600);
		}
	});

	return new (require('factory'))(function() {
		App.Views.NotificationView = {};
		App.Views.NotificationView.NotificationMainView = NotificationMainView;

		App.NotificationManager = (function() {
			var _instance = null,
				_defaults = {
					mod: 'Main',
					model: new Backbone.Model({})
				};

			return {
				create: function(options) {
					var options = options || {};
					options = _.extend(_defaults, options);

					// remove existing view
					_instance instanceof Backbone.View && _instance.remove();

					// create new view and append it to body
					_instance = new App.Views.GeneratorView.create('Notification', options);
					Backbone.$('body').append(_instance.el);

					return _instance;
				}
			}
		})();
	});
});
