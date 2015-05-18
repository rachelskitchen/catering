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
        map: function(zoomControl, panControl, mapTypeControl) {
            var settings = App.Data.settings.get("settings_system"),
                self = this;

            self.$(".view_larger_map").hide();
            self.$("#mapBox").hide();
            settings.geolocation_load.done(function() {require(["async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true"], function() {
                self.$("#mapBox").show();
                var address = settings.address,
                    title = settings.business_name || '',
                    coords = new google.maps.LatLng(address.coordinates.lat, address.coordinates.lng),
                    popup = new google.maps.InfoWindow({
                        content: '<div id="googlemaps_popup">' +
                            '<div> <strong>' + title + '</strong> </div>' +
                            '<div>' + address.full_address + '</div>' +
                            '</div>' + (((!_.isArray(settings.delivery_post_code_lookup) || !settings.delivery_post_code_lookup[0]) && _.isArray(settings.delivery_geojson) && settings.delivery_geojson[0]) ?
                            '<div> *Delivery area is marked with grey</div>': ''),
                        position: coords
                    }),
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
                    }),

                    marker = new google.maps.Marker({
                        position: coords,
                        map: map,
                        title: title
                    });

                if ((!_.isArray(settings.delivery_post_code_lookup) || !settings.delivery_post_code_lookup[0]) && _.isArray(settings.delivery_geojson) && settings.delivery_geojson[0]) {
                    try {
                        map.data.addGeoJson(JSON.parse(settings.delivery_geojson[1]));
                        map.data.setStyle({"strokeWeight": 1});
                    } catch (e) {
                        console.error("Can't parse delivery area GeoJson: " + e);
                    }
                }

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

                google.maps.event.addListener(marker, 'click', function() {
                    popup.open(map, this);
                });

                setTimeout(function() {
                    popup.open(map, marker);
                }, 800);
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
                timetable_on_week = this.model.get_timetable_on_week(),
                timetable;

            if(address instanceof Object) {
                address.line_1 && address_line1.push(address.line_1);
                address.line_2 && address_line1.push(address.line_2);
                address.city && address_line2.push(address.city);
                region && address_line2.push(region);
                address.postal_code && address_line2.push(address.postal_code);
            }

            if(address_line2.length > 1)
                address_line2[0] += ',';

            if(timetable_on_week !== null && Object.keys(timetable_on_week).length > 1) {
                timetable = [];
                var today = App.Data.timetables.base().getDay();
                for(var i = today; i < today + 7; i++) {
                    var weekDay = this.model.get_day_of_week(i % 7);
                    timetable.push({
                        weekDay: _loc['DAYS_OF_WEEK'][weekDay],
                        hours: timetable_on_week[weekDay]
                    });
                }
            }

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
        }
    });

    return new (require('factory'))();
});
