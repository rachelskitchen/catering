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

    App.Views.CoreStoreInfoView = {};

    App.Views.CoreStoreInfoView.CoreStoreInfoMainView = App.Views.FactoryView.extend({
        initialize: function() {
            this.listenTo(this.collection, 'change:selected', this.onStoreSelected);
            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        map: function(zoomControl, panControl, mapTypeControl) {
            var settings = App.Settings,
                self = this;

            this.mapData = {
                loadLib: Backbone.$.Deferred()
            };
            self.$(".view_larger_map").hide();
            self.$("#mapBox").hide();
            settings.geolocation_load.done(function() {require(["async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true"], function() {
                self.$("#mapBox").show();
                var address = settings.address,
                    title = settings.business_name || '',
                    coords = new google.maps.LatLng(address.coordinates.lat, address.coordinates.lng),
                    // popup = new google.maps.InfoWindow({
                    //     content: '<div id="googlemaps_popup">' +
                    //         '<div> <strong>' + title + '</strong> </div>' +
                    //         '<div>' + address.full_address + '</div>' +
                    //         '</div>' + (((!_.isArray(settings.delivery_post_code_lookup) || !settings.delivery_post_code_lookup[0]) && _.isArray(settings.delivery_geojson) && settings.delivery_geojson[0]) ?
                    //         '<div> *Delivery area is marked with grey</div>': ''),
                    //     position: coords
                    // }),
                    map = new google.maps.Map(self.$('#mapBox')[0], {
                        center: coords,
                        zoom: 18,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        zoomControl: !!zoomControl,
                        zoomControlOptions: {
                            style: 'LARGE'
                        },
                        streetViewControl: false,
                        panControl: !cssua.ua.mobile,
                        mapTypeControl: !!mapTypeControl,
                        mapTypeControlOptions: {
                            mapTypeIds: [
                                google.maps.MapTypeId.HYBRID,
                                google.maps.MapTypeId.ROADMAP,
                                google.maps.MapTypeId.SATELLITE,
                                google.maps.MapTypeId.TERRAIN
                            ]
                        }
                    });

                self.mapData.map = map;
                self.mapData.loadLib.resolve();
                self.addMarkers();

                if ((!_.isArray(settings.delivery_post_code_lookup) || !settings.delivery_post_code_lookup[0]) && _.isArray(settings.delivery_geojson) && settings.delivery_geojson[0]) {
                    try {
                        map.data.addGeoJson(JSON.parse(settings.delivery_geojson[1]));
                        map.data.setStyle({"strokeWeight": 1});
                    } catch (e) {
                        console.error("Can't parse delivery area GeoJson: " + e);
                    }
                }

                var mapurl = setInterval(function() {
                    if (typeof map === "object" && typeof map.mapUrl !== "undefined" && typeof map.mapUrl === "string") {
                        self.$(".view_larger_map").show();
                        self.$(".view_larger_map .map_url").text(settings.business_name);
                        self.$(".view_larger_map .map_url").attr("href", map.mapUrl.replace("ll=", "q="));
                        clearInterval(mapurl);
                    }
                }, 50);
            });});

        },
        infoDetailed: function() {
            var settings = App.Data.settings,
                settings_system = settings.get('settings_system'),
                address = settings_system.address,
                address_line1 = [],
                address_line2 = [],
                region = address.getRegion(),
                timetable = this.model.getHoursOnWeek();

            if(address instanceof Object) {
                address.line_1 && address_line1.push(address.line_1);
                address.line_2 && address_line1.push(address.line_2);
                address.city && address_line2.push(address.city);
                region && address_line2.push(region);
                address.postal_code && address_line2.push(address.postal_code);
            }

            if(address_line2.length > 1)
                address_line2[0] += ',';

            return {
                logo: settings_system.logo_img ? settings.get('host') + settings_system.logo_img : null,
                phone: settings_system.phone,
                email: settings_system.email,
                access_to_location: settings_system.about_access_to_location,
                address: {
                    business_name: settings_system.business_name,
                    line1: address_line1.join(', '),
                    line2: address_line2.join(' ')
                },
                timetable: timetable,
                phoneFormat: function(phone) {
                    if(phone.length < 10) {
                        return phone;
                    }
                    var matches = phone.match(/^(\+?\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
                    if(matches !== null) {
                        return matches.slice(1).join('.');
                    } else {
                        return phone;
                    }
                }
            };
        },
        addMarkers: function() {
            var stores = this.collection,
                self = this;

            self.markers = {};

            stores.request.then(function() {
                stores.each(function(store) {
                    var _store = store.toJSON(),
                        color = _store.selected ? self.activePinColor : self.regularPinColor,
                        scale = _store.selected ? 0.3 : 0.2,
                        address = [_store.line_1, _store.city, (_store.state ? _store.state : _store.province), _store.zipcode],
                        zIndex = _store.selected ? self.activeMarkerZIndex : self.regularMarkerZIndex,
                        coords, marker, popup;

                    coords = new google.maps.LatLng(_store.latitude, _store.longitude),
                    marker = new google.maps.Marker({
                        position: coords,
                        map: self.mapData.map,
                        title: _store.name,
                        icon: getPin(color, scale),
                        zIndex: zIndex
                    });

                    popup = new google.maps.InfoWindow({
                        content: '<div id="googlemaps_popup">' +
                                    '<div class="bold">' + _store.name + '</div>' +
                                    '<div>' + address.join(', ') + '</div>' +
                                 '</div>',
                        position: coords
                    });

                    if (_store.selected) {
                        popup.open(self.mapData.map, marker);
                    }

                    google.maps.event.addListener(marker, 'click', function() {
                        store.set('selected', true);
                    });

                    self.markers[store.id] = {
                        marker: marker,
                        popup: popup
                    };

                    google.maps.event.addListener(popup, "domready", function() {
                        self.$("#googlemaps_popup").parent().parent().css({
                            height: "auto",
                            overflow: "hidden",
                            width: "auto"
                        });
                        // button "Close" in popup window (hack for Android Default Browser) (begin)
                        var block_with_popup_image = self.$("#mapBox > div > div > div > div > div > div > div > img").parent();
                        block_with_popup_image.empty();
                        block_with_popup_image.append('<div style="position: absolute; background: url(\'https://maps.gstatic.com/mapfiles/api-3/images/mapcnt3.png\') 13px 13px no-repeat; width: 59px; height: 492px; top: -348px; left: -13px;"> </div>');
                        // button "Close" in popup window (hack for Android Default Browser) (end)
                    });
                });
            });
        },
        onStoreSelected: function(model, value) {
            var markerData = this.markers[model.get('id')],
                color = value ? this.activePinColor : this.regularPinColor,
                scale = value ? 0.3 : 0.2;

            if (markerData) {
                markerData.marker.setIcon(getPin(color, scale));

                if (value) {
                    this.mapData.map.setCenter(markerData.marker.getPosition());
                    markerData.popup.open(this.mapData.map, markerData.marker);
                    markerData.marker.setZIndex(this.activeMarkerZIndex);
                } else {
                    markerData.popup.close();
                    markerData.popup.setMap(null);    // unbind from map.
                    markerData.popup.setAnchor(null); // unbind from anchor
                    markerData.marker.setZIndex(this.regularMarkerZIndex);
                }
            };
        },
        regularPinColor: '#5f6266',
        activePinColor: '#ff0000',
        regularMarkerZIndex: 200,
        activeMarkerZIndex: 201
    });

    function getPin(color, scale) {
        return {
            path: 'M244.4,9.5c4.7,1.1,9.5,1.9,14,3.4c29.8,10.2,47.7,40.1,43.2,71.5c-3.2,22.4-12.9,42.1-25,60.9c-10.9,17-25.4,31-38.9,46.5c-9.4-11.1-18.8-21.7-27.5-32.8c-14.1-18.2-25.8-37.9-32.8-60.1c-7.5-23.6-5.4-45.9,10.6-65.7c10.5-13.1,24.3-20.7,41-23c1.1-0.1,2.1-0.5,3.1-0.7C236.3,9.5,240.4,9.5,244.4,9.5z M237.4,44.9c-16.8,0.4-29,13.6-28.7,30.7c0.4,16.1,14,28.4,31,27.9c15.2-0.4,27.6-14.3,27.3-30.5C266.7,57.4,253.1,44.5,237.4,44.9z',
            fillColor: color,
            fillOpacity: 1,
            scale: scale || 0.2,
            strokeColor: color,
            strokeWeight: 1,
            anchor: new google.maps.Point(238, 192)
        };
    }

    return new (require('factory'))();
});
