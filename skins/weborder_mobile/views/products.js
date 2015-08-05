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

define(["products_view"], function(products_view) {
    'use strict';

    var ProductModifiersView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'modifiers',
        bindings: {
            '.test': 'text: editPrice(currencyFormat(initial_price))'
        },
        bindingFilters: {
            editPrice: function(priceString) {
                return priceString.replace(/(\d{1,3}(\.\d{0,2})?)/,'<span>$1</span>');
            }
        },
        initialize: function() {
            this.product = this.model.get_product();
            this.modifiers = this.model.get_modifiers();
            this.giftCardPriceRegStr = '^\\d{0,3}(\\.\\d{0,2})?$';
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:initial_price', this.update_price, this);
        },
        events: {
            'change .gift_card_number': 'gift_change',
            'change .gift_card_price': 'gift_price_change'
        },
        render: function() {
            var model = this.product.toJSON(),
                settings = App.Data.settings;

            model.hide_images = settings.get('settings_system').hide_images;
            model.currency_symbol = settings.get('settings_system').currency_symbol;
            model.price = round_monetary_currency(this.model.get('initial_price'));
            model.price_length = model.price.length;
            model.not_size = this.modifiers && this.modifiers.getSizeModel() === undefined;
            model.uom = App.Data.settings.get("settings_system").scales.default_weighing_unit;
            model.images = Array.isArray(model.images) ? model.images : [];

            if (App.skin == App.Skins.RETAIL && model.images[0] == settings.get_img_default()) {
                model.images[0] = settings.get_img_default(2); //to load noneMatrix.png
            }

            this.gift_price = model.is_gift && model.not_size;

            this.$el.html(this.template(model));

            if (model.is_gift) {
                inputTypeMask(this.$('.gift_card_number'), /^(\d|-){0,255}$/, '', 'numeric');
            }
            if (this.gift_price) {
                inputTypeMask(this.$('.gift_card_price'), new RegExp(this.giftCardPriceRegStr), '', 'float');
            }

            if (App.skin == App.Skins.RETAIL)
                this.$('.img').attr('data-default-index', 2);
            loadSpinner(this.$('.img'));

            return this;
        },
        gift_change: function(e) {
            this.product.set('gift_card_number', e.currentTarget.value);
        },
        gift_price_change: function(e) {
            var newPrice = e.currentTarget.value,
                formatPrice = parseFloat(newPrice),
                pattern = new RegExp(this.giftCardPriceRegStr.replace(/(.*)0(.*)0(.*)/, '$11$22$3').replace(/[\(\)\?]/g, ''));

            if(!isNaN(formatPrice)) {
                this.model.set('initial_price', formatPrice);
                this.product.set('price', formatPrice);
            }

            // If input field value does not match "XX.XX" need format it.
            // Also need restore previos (or 0.00 if it was unset) value if new value is '.'.
            if(!pattern.test(newPrice)) {
                e.currentTarget.value = round_monetary_currency(this.model.get('initial_price'));
            }
        },
        update_price: function() {
            var dt = this.$('dt'),
                initial_price = round_monetary_currency(this.model.get('initial_price'));

            if (dt.length) {
                dt.prop('className', dt.prop('className').replace(/(\s+)?s\d+(?=\s|$)/, ''));
                dt.addClass('s' + initial_price.length);
            }

            if (this.gift_price) {
                this.$('.price').val(initial_price);
            } else {
                this.$('.price').text(initial_price);
            }
        }
    });

    // App.Views.CoreProductView.CoreProductModifiersView.extend({
        /*render: function() {
            App.Views.CoreProductView.CoreProductModifiersView.prototype.render.apply(this, arguments);
            $('img', this.$el).attr('src', this.product.get("logo_url_final") ? this.product.get("logo_url_final") : this.product.get("image"));
            this.product.get('is_gift') && this.$el.addClass('is_gift');
        }*/
    // });

    var ProductListItemView = App.Views.FactoryView.extend({
        name: 'product',
        mod: 'list_item',
        tagName: 'li',
        bindings: {
            ':el': 'toggle: active',
            '.title': 'text: name',
            '.desc': 'text: description, toggle: not(_system_settings_hide_products_description)',
            '.price': 'text: select(sold_by_weight, weightFormat(price), currencyFormat(price))'
        },
        events: {
            "click": "showModifiers"
        },
        showModifiers: function(e) {
            e.preventDefault();
            var id_category = this.model.get('id_category'),
                id = this.model.get('id');
            App.Data.router.navigate("modifiers/" + id_category + "/" + id, true);
        }
    });

    var ProductListView = App.Views.LazyListView.extend({
        name: 'product',
        mod: 'list'
    });

    var ProductSearchListView = ProductListView.extend({
        name: 'product',
        mod: 'list',
        initialize: function() {
            this.defaultCollection = this.collection;
            setTimeout(this.swipeDetectInitialize.bind(this), 0);
            ProductListView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.options.search, 'onSearchComplete', this.update_table, this);
            this.listenTo(this.model, 'change:isShow', this.update_search_line, this);
            this.showSearchLine();
        },
        swipeDetectInitialize: function() {
            var self = this;
            this.swipe_surface = this.$el[0];
            this.swipe_up_threshold = this.$("li").outerHeight() * 2;
            this.lastScrollTop = this.swipe_surface.scrollTop;
            swipe_detect(this.swipe_surface,  function(swipedir){
                    //swipedir contains either "none", "left", "right", "up", or "down"
                    if (swipedir =='down') {
                        var is_show = self.model.get('isShow') == true;
                        if (!is_show && self.swipe_surface.scrollTop <= self.swipe_up_threshold * 2) {
                           self.model.set('isShow', true);
                        }
                    }
                });
        },
        onScroll: function(event) {
            if (this.swipe_surface.scrollTop != 0) {//don't loose a focus on the list initialization phase
                setTimeout(function(){
                    $("#search-input").blur();//remove the focus out from search bar on scrolling
                }, 0);
            }

            if (!this.scrollTimer && this.model.get('isShow') && this.lastScrollTop < this.swipe_surface.scrollTop &&
                 this.swipe_surface.scrollTop > this.swipe_up_threshold) {
                this.scrollTimer = setTimeout((function(){
                    this.scrollTimer = null;
                    if (!$("#search-input").is(':focus') && this.model.get("searchString").length > 0
                        && this.swipe_surface.scrollTop > this.swipe_up_threshold) {  //don't hide the input which is in focus or close to the top of the scroll
                        this.model.set('isShow', false);
                    }
                }).bind(this), 4000);
            }
            this.lastScrollTop = this.swipe_surface.scrollTop;
            App.Views.LazyListView.prototype.onScroll.apply(this, arguments);
        },
        killScrollTimer: function() {
            if (this.scrollTimer) {
                clearTimeout(this.scrollTimer);
                this.scrollTimer = null;
            }
        },
        update_search_line: function(){
            this.model.get('isShow') ? this.showSearchLine() : this.hideSearchLine();
        },
        showSearchLine: function() {
            this.killScrollTimer();
            $('.content.search_list').animate({top: "8.7em"}, 300);
            $('.content .search_wrap').animate({top: "0em"}, 300);
        },
        hideSearchLine: function() {
            this.killScrollTimer();
            $('.content.search_list').animate({top: "0em"}, 400);
            $('.content .search_wrap').animate({top: "-8.7em"}, 400);
        },
        update_table: function(model) {
            this.collection = model ? model.get('products') : this.defaultCollection;
            this.render();
        }
    });

    return new (require('factory'))(products_view.initViews.bind(products_view), function() {
        App.Views.ProductView.ProductModifiersView = ProductModifiersView;
        App.Views.ProductView.ProductListItemView = ProductListItemView;
        App.Views.ProductView.ProductListView = ProductListView;
        App.Views.ProductView.ProductSearchListView = ProductSearchListView;
    });
});