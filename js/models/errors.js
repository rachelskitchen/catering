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

define(['backbone'], function(Backbone) {
    'use strict';

    App.Models.Errors = Backbone.Model.extend({
        defaults: {
            message: 'No alert message',
            reloadPage: false,
            errorServer: false,
            typeIcon: 'info',
            isConfirm: false,
            confirm: {
                ok: 'OK',
                cancel: 'Cancel',
                btnsSwap: false,
                cancelHide: false
            }
        },
        /**
         * Clear model (set default values).
         */
        clearModel: function() {
            this.set(this.defaults);
            var options = ['template', 'callback'];
            for (var i = 0; i < options.length; i++) {
                this.unset(options[i]);
            }
        },
        /**
         * User notification.
         *
         * @param {string} message Alert message.
         * @param {boolean} reloadPage If TRUE - reload page after pressing button.
         * @param {boolean} defaultView Use jQuery alert message.
         * @param {object} options Options of alert message:
         *      template: template ID (apply if uses custom alert message) (string);
         *      errorServer: server return HTTP status 200, but data.status is error (boolean);
         *      typeIcon: type of icon (info or warning) (string);
         *      isConfirm: if THUE - show confirm message (boolean);
         *      confirm: object for confirm message (two button) (object):
         *          ok: text of OK button (string);
         *          cancel: text of CANCEL button (string);
         *          btnsSwap: buttons swap (boolean);
         *          cancelHide: if TRUE - hide CANCEL button (boolean).
         *      callback: callback for confirm message (function).
         */
        alert: function(message, reloadPage, defaultView, options) {
            this.clearModel(); // clear model (set default values)
            if (options instanceof Object) this.set(options);
            var dView = (App.skin == App.Skins.WEBORDER || App.skin == App.Skins.RETAIL || (App.skin == App.Skins.WEBORDER_MOBILE && this.get('isConfirm'))) ?
                (defaultView === undefined) ? false : !!defaultView :
                true;
            this.set({
                message: message && message.toString() || this.defaults.message,
                reloadPage: !!reloadPage || false,
                defaultView: dView
            });
            // buttons (begin)
            var btnText1 = this.defaults.confirm.ok;
            var btnText2 = this.defaults.confirm.cancel;
            if (this.get('isConfirm')) {
                var confirm = this.get('confirm');
                if (confirm.ok) btnText1 = confirm.ok;
                if (confirm.cancel) btnText2 = confirm.cancel;
            }
            this.set({
                btnText1: btnText1,
                btnText2: btnText2
            });
            // buttons (end)
            this.trigger('alertMessage');
        }
    });
});