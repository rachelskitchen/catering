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

require.config({
    baseUrl: ".",
    paths: {
        jquery: "js/libs/jquery/jquery",
        jquery_ui_draggable: "js/libs/jquery/jquery.ui.draggable",
        jquery_alerts: "js/libs/jquery/jquery.alerts",
        jquery_gallery: 'js/libs/jquery/jquery.gallery',
        jquery_migrate: "js/libs/jquery/jquery-migrate.min",
        jquery_numbermask: "js/libs/jquery/jquery.number_mask",
        backbone: "js/libs/backbone",
        cssua: "js/libs/cssua",
        underscore: "js/libs/underscore",
        functions : "js/functions",
        async: "js/libs/require_async",
        about: "js/models/about",
        customers: "js/models/customers",
        childproducts: "js/models/childproducts",
        errors : "js/models/errors",
        myorder: "js/models/myorder",
        settings: "js/models/settings",
        timetable: "js/models/timetable",
        factory: "js/views/factory",
        list: "js/views/list",
        generator: "js/views/generator",
        tax: "js/models/tax",
        total: "js/models/total",
        categories: "js/models/categories",
        products: "js/models/products",
        modifiers: "js/models/modifiers",
        tip: "js/models/tip",
        card: "js/models/card",
        checkout: "js/models/checkout",
        geopoint: "js/common/geopoint",
        main_router: "js/routers/main",
        spinner: "js/spinner",
        log: "js/models/log",
        delivery: "js/models/delivery",
        delivery_addresses: "js/views/delivery_addresses",
        checkout_view: "js/views/checkout",
        categories_view: "js/views/categories",
        products_view: "js/views/products",
        modifiers_view: "js/views/modifiers",
        myorder_view: "js/views/myorder",
        quantity_view: "js/views/quantity",
        store_info_view: "js/views/store_info",
        total_view: "js/views/total",
        tips_view: "js/views/tips",
        card_view: "js/views/card",
        instructions_view: "js/views/instructions"
    },
    waitSeconds: 30,
    shim: {
        "jquery": {
            exports: "$"
        },
        "jquery_ui_draggable": {
            deps: ["jquery"],
            exports: "$.ui.draggable"
        },
        "jquery_alerts": {
            deps: ["jquery", "jquery_migrate", "jquery_ui_draggable"],
            exports: "$.alerts"
        },
        "jquery_migrate": {
            deps: ["jquery"],
            exports: "$.migrate"
        },
        "jquery_numbermask": {
            deps: ["jquery"],
            exports: "$.numbermask"
        },
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        "cssua": {
            exports: "cssua"
        },
        "underscore": {
            exports: "_"
        },
        "functions" : {
            deps: ["underscore", "jquery"]
        },
        "customers": {
            deps: ["backbone"]
        },
        "errors" : {
            deps: ["backbone", "functions"]
        },
        "myorder": {
            deps: ["backbone"]
        },
        "settings": {
            deps: ["backbone"]
        },
        "timetable": {
            deps: ["settings"]
        },
        "factory": {
            deps: ["backbone"]
        },
        "generator": {
            deps: ["backbone"]
        },
        "total": {
            deps: ["backbone"]
        },
        "categories": {
            deps: ["backbone"]
        },
        "products": {
            deps: ["backbone"]
        },
        "modifiers": {
            deps: ["backbone"]
        },
        "tip": {
            deps: ["backbone"]
        },
        "card": {
            deps: ["backbone"]
        },
        "checkout": {
            deps: ["backbone"]
        },
        "main_router": {
            deps: ["backbone"]
        },
        "spinner": {
            deps: ["jquery"]
        },
        "log": {
            deps: ["backbone"]
        },
        "delivery": {
            deps: ["backbone"]
        },
        "delivery_addresses": {
            deps: ["backbone", "factory"]
        },
        "checkout_view": {
            deps: ["backbone", "factory"]
        },
        "myorder_view": {
            deps: ["backbone", "factory"]
        },
        "total_view": {
            deps: ["backbone", "factory"]
        },
        "tips_view": {
            deps: ["backbone", "factory"]
        },
        "instructions_view": {
            deps: ["backbone", "factory"]
        }
    }
});

require(["jquery_alerts", "cssua", "functions", "errors", "myorder", "settings", "timetable", "log", "tax"], function() {
    'use strict';

    var nodes = document.querySelectorAll('html, body');
    var i = 0;
    for (; i < nodes.length; i++) {
        nodes[i].style.width = '100%';
        nodes[i].style.height = '100%';
        nodes[i].style.margin = '0';
    }

    App.Data.getSpinnerSize = getFontSize;
    document.querySelector('body').innerHTML = '<div class="ui-loader-default" style="width: 100%; height: 100%; font-size:' + getFontSize() + 'px !important" id="loader"></div>';
    var loader = document.querySelector('#loader');
    addSpinner.call(loader);
    loader.style.cssText += "background-color: rgba(170, 170, 170, .8); position: fixed;";

    // jquery `spinner` plugin
    $.fn.spinner = function() {
        this.each(addSpinner);
    };

    // init log object
    App.Data.log = new App.Models.Log({init: window.initErrors});

    // listen to ajax errors
    $(document).ajaxError(function(e, jqxhr, settings, exception) {
        App.Data.log.pushAjaxError(settings.url, jqxhr.state(), exception.toString());
    });

    App.init();

    // 'this' is HTMLElement
    function addSpinner() {
        var html = '<div class="ui-spinner">';
        html += '<div class="point1 point"></div>';
        html += '<div class="point2 point"></div>';
        html += '<div class="point3 point"></div>';
        html += '<div class="point4 point"></div>';
        html += '<div class="point5 point"></div>';
        html += '<div class="point6 point"></div>';
        html += '<div class="point7 point"></div>';
        html += '<div class="point8 point"></div>';
        html += '</div>';
        if('absolute' !== this.style.position) {
            this.style.position = 'relative';
        }
        this.innerHTML += html;
    }

    // define font-size for spinner
    function getFontSize() {
        var wCoef = document.documentElement.clientWidth / 640,
            hCoef = document.documentElement.clientHeight / 700,
            baseSize = 12;

        if (wCoef > hCoef)
            return Math.round(hCoef * baseSize * 1.5);
        else
            return Math.round(wCoef * baseSize * 1.5);
    }
});
