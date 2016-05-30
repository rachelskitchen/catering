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

define(["store_info_view"], function(store_info_view) {
    'use strict';

    var StoreInfoMainView = App.Views.FactoryView.extend({
        name: 'store_info',
        mod: 'main',
        bindings: {
            '.desc': 'toggle: _system_settings_about_description, html: format("<p>$1</p>", handleDescriptions(_system_settings_about_description))',
            '.business-name': 'text: _system_settings_business_name',
            '.address-line1': 'text: line1',
            '.address-line2': 'text: line2',
            '.phone': 'toggle: _system_settings_phone',
            '.phone-number': 'text: _system_settings_phone, attr: {href: format("tel:$1", _system_settings_phone)}',
            '.email-wrap': 'toggle: _system_settings_email',
            '.email': 'text: _system_settings_email, attr: {href: format("mail:$1", _system_settings_email)}',
            '.access': 'toggle: _system_settings_about_access_to_location',
            '.access-info': 'text: _system_settings_about_access_to_location',
        },
        bindingFilters: {
            handleDescriptions: function(desc) {
                return desc.replace(/[\n\r]+/g, '</p><p>');
            }
        },
        computeds: {
            line1: {
                deps: ['_system_settings_address'],
                get: function(address) {
                    var line1 = address.line_1,
                        line2 = address.line_2;
                    return line2 ? line1 + ', ' + line2 : line1;
                }
            },
            line2: {
                deps: ['_system_settings_address'],
                get: function(address) {
                    return address.city + ', ' + address.getRegion() + ' ' + address.postal_code;
                }
            }
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            if (App.Settings.about_images.length > 0) {
                var gallery = App.Views.GeneratorView.create('StoreInfo', {
                    mod: 'Gallery',
                    el: this.$('.gallery'),
                    model: this.options.about
                });
                this.subViews.push(gallery);
            }
            return this;
        }
    });

    var StoreInfoImagePoint = App.Views.FactoryView.extend({
        name: 'store_info',
        mod: 'image_point',
        tagName: 'li',
        className: 'image-point primary-border',
        bindings: {
            ':el': 'classes: {selected: selected}'
        },
        events: {
            'click': 'select'
        },
        select: function() {
            this.model.set('selected', true);
        }
    });

    var StoreInfoGalleryView = App.Views.FactoryView.extend({
        name: 'store_info',
        mod: 'gallery',
        bindings: {
            '.points': 'collection: $points, itemView: "imagePoint"',
            '.syncer': 'gallery: curIndex, galleryEl: ".images", events: ["onScroll"]'
        },
        imagePoint: StoreInfoImagePoint,
        bindingHandlers: {
            galleryEl: {},
            gallery: {
                init: function($el, value, bindings, context) {
                    var $gallery = this.view.$(context.galleryEl),
                        self = this;
                    this.curIndex = value;
                    $gallery.gallery({onScroll: function(curIndex) {
                        self.curIndex = curIndex
                        $el.trigger('onScroll');
                    }});
                },
                get: function() {
                    return this.curIndex;
                },
                set: function($el, value) {
                    $el.gallery({scrollTo: value});
                }
            }
        },
        bindingSources: {
            points: function() {
                var points = new Backbone.Collection();
                points.listenTo(points, 'change:selected', function(model, value) {
                    if (value) {
                        points.where({selected: true}).forEach(function(item) {
                            item.set('selected', item === model);
                        });
                    }
                    points.trigger('update');
                });
                return points;
            }
        },
        computeds: {
            curIndex: {
                deps: ['$points'],
                get: function(points) {
                    var selected = points.findWhere({selected: true});
                    return selected ? selected.get('index') : 0;
                },
                set: function(value) {
                    var model = this.getBinding('$points').findWhere({index: value});
                    model && model.set('selected', true);
                }
            }
        },
        initialize:  function() {
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
            this.getBinding('$points').reset(this.model.get('images').map(function(image, index) {
                return {
                    selected: !index,
                    index: index
                }
            }));
        },
        render: function() {
            App.Views.FactoryView.prototype.render.apply(this, arguments);
            this.$('.images').gallery({
                images: this.model.get('images'),
                animate: true,
                circle: true
            });
            return this;
        }
    });

    var StoreInfoStoreItemView = App.Views.FactoryView.extend({
        name: 'store_info',
        mod: 'store_item',
        tagName: 'li',
        className: 'store-item',
        events: {
            'click': 'select'
        },
        bindings: {
            '.radio': 'classes: {checked: selected}',
            '.line-1': 'text: line1',
            '.line-2': 'text: line2',
            '.name': 'text: name'
        },
        computeds: {
            line1: {
                deps: ['line_1', 'line_2'],
                get: function(line_1, line_2) {
                    return line_2 ? line_1 + ', ' + line_2 : line_1;
                }
            },
            line2: {
                deps: ['city', 'region', 'zipcode'],
                get: function(city, region, zipcode) {
                    return city + ', ' + region + ' ' + zipcode;
                }
            }
        },
        select: function() {
            this.model.set('selected', true);
        }
    });

    var StoreInfoMapView = App.Views.CoreStoreInfoView.CoreStoreInfoMainView.extend({
        name: 'store_info',
        mod: 'map',
        storeView: StoreInfoStoreItemView,
        bindings: {
            '.stores-list': 'collection: $collection, itemView: "storeView"',
            '.show-delivery-area': 'toggle: ui_isDeliveryAreaGeoJSON'
        },
        events: {
            'click .show-delivery-area': 'focusOnDeliveryArea'
        },
        render: function() {
            App.Views.CoreStoreInfoView.CoreStoreInfoMainView.prototype.render.apply(this, arguments);
            this.map(true, true, true);
            return this;
        }
    });

    return new (require('factory'))(store_info_view.initViews.bind(store_info_view), function() {
        App.Views.StoreInfoView = {};
        App.Views.StoreInfoView.StoreInfoMainView = StoreInfoMainView;
        App.Views.StoreInfoView.StoreInfoGalleryView = StoreInfoGalleryView;
        App.Views.StoreInfoView.StoreInfoMapView = StoreInfoMapView;
    });
});