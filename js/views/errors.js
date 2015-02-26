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

    App.Views.CoreErrorsView = {};

    App.Views.CoreErrorsView.CoreErrorsMainView = App.Views.FactoryView.extend({
        name: 'errors',
        mod: 'main',
        initialize: function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'alertMessage', this.alertMessage); // user notification
            this.listenTo(this.model, 'hideAlertMessage', this.removeFromDOMTree); // remove view from DOM tree
            this.alertMessage(); // user notification
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            return this;
        },
        /**
         * User notification.
         *
         * @param {object} options Options of alert message:
         *      message: alert message;
         *      reload_page: if TRUE - reload page after pressing button;
         *      defaultView: use jQuery alert message;
         *      template: template ID;
         *      type: type of icon;
         *      is_confirm: if THUE - show confirm message;
         *      confirm: object for confirm message (two button):
         *          ok: text of OK button;
         *          cancel: text of CANCEL button;
         *          cancel_hide: if TRUE - hide CANCEL button;
         *      callback: callback for confirm message.
         */
        alertMessage: function() {
            var options = this.model.toJSON(),
                NO_MESSAGE = 'No alert message';

            this.model.clearOptions(); // clear options

            /*
            if (!options.defaultView && (App.skin == App.Skins.WEBORDER || App.skin == App.Skins.RETAIL))
                return customAlertMessage(options); // custom alert message
            */
            defaultAlertMessage(options); // jQuery alert message

            /**
             * Default alert message.
             */
            function defaultAlertMessage(options) {
                /*
                if (options.is_confirm) {
                    var confirm = options.confirm || {};
                    jConfirm(options.message || NO_MESSAGE, confirm.ok || 'OK', confirm.cancel || 'Cancel', options.callback);
                    confirm.cancel_hide && $('#popup_cancel').hide();
                } else {
                    jAlert(options.message, 'OK');
                }
                */
                // setStyles(); // settings of styles for alert message
                setMinWidth(); // setting of minimum width for the block
                /*
                centrePositionAlert(); // centering of alert message

                $(window).on('resize', centrePositionAlert); // centering of alert message
                $('#popup_ok').click(function() {
                    $(window).off('resize', centrePositionAlert); // centering of alert message
                    options.reload_page && window.location.reload();
                });
                */

                /**
                 * Setting of minimum width for the block.
                 */
                function setMinWidth() {
                    var wndWidth = $(window).width(),
                        wndHeight =  $(window).height(),
                        alert = this.$('#popup_container'),
                        // alert = $('#popup_container'),
                        alertWidth = alert.width(),
                        borderWidth = alert.outerWidth() - alert.width(),
                        minWidth = (wndHeight > wndWidth) ? wndWidth : wndHeight;

                    minWidth -= borderWidth;

                    debugger;
                    if (alertWidth < minWidth) {
                        alert.css('min-width', alertWidth);
                    } else {
                        alert.css('min-width', minWidth);
                    }
                }
                /**
                 * Settings of styles for alert message.
                 */
                function setStyles() {
                    var alert = $('#popup_container');
                    alert.find('#popup_panel > input[type="button"]').css({
                        'cursor': 'pointer',
                        'padding': '3px 20px'
                    });
                }
            }
            /**
             * Custom alert message.
             */
            function customAlertMessage(options) {
                var alert = $('#alert'),
                    confirm = options.confirm || {},
                    template = options.template ? options.template : 'alert';

                if ( $('#' + template + '-template' ).length == 0) {
                    defaultAlertMessage(options);
                    return;
                }

                if (alert.length == 0) {
                    alert = $('<div id="alert"> </div>').appendTo('body');
                }

                var data = {
                    icon_type: options.is_confirm ? 'warning' : options.type || 'info',
                    message: options.message || NO_MESSAGE,
                    is_confirm: options.is_confirm,
                    btnText1: confirm.ok || 'OK',
                    btnText2: confirm.cancel || 'Cancel'
                };

                var tmpl = template_helper2(template + '-template'); // helper of template for PayPal
                alert.html(tmpl(data));
                alert.addClass('ui-visible');
                $(".alert_block").addClass("alert-background");

                if (options.is_confirm) {
                    $('.btnOk', alert).on('click', function() { options.callback && options.callback(true); });
                    $('.btnCancel,.cancel', alert).on('click', function() { options.callback && options.callback(false); });
                    confirm.cancel_hide && $('.btnCancel', alert).hide();
                }

                $('.btnOk,.btnCancel,.cancel', alert).on('click', function() {
                    $('.alert_block').removeClass('alert-background');
                    alert.removeClass('ui-visible');
                    options.reload_page && window.location.reload();
                });

                return alert;
            }
        }
    });
});