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

define(["backbone", "geopoint"], function(Backbone) {
    'use strict';

    App.Models.Customer = Backbone.Model.extend({
        defaults: {
            first_name: "",
            last_name: "",
            phone: "",
            email: "",
            id: null,
            addresses: [],
            shipping_address: null,
            shipping_services: [],
            shipping_selected: -1,
            load_shipping_status: ""
            /**
             * address - from function address_str. available only for other addresses
             * city
             * country
             * state
             * street_1
             * street_2
             * zipcode
             */
        },
        /**
         * Get customer name in the format "Smith M.".
         */
        get_customer_name : function() {
            return this.get('first_name') + this.get('last_name').trim().replace(/(\w).*/, function(m, g) {return ' ' + g + '.';});
        },
        saveCustomer: function() {
            setData('customer', this);
        },
        loadCustomer: function() {
            this.set(getData('customer'));
        },
        saveAddresses: function() {
            setData('address', new Backbone.Model({addresses: this.get('addresses')}), true);
        },
        loadAddresses: function() {
            var data = getData('address', true);
            this.set('addresses', data instanceof Object ? (data.addresses || []) : []);
        },
        address_str: function() {
            var addresses = this.get('addresses'),
                settings = App.Data.settings.get('settings_system'),
                str = [];
            addresses = addresses[addresses.length - 1];

            addresses.street_1 && str.push(addresses.street_1);
            addresses.street_2 && str.push(addresses.street_2);
            addresses.city && str.push(addresses.city);
            settings.address && settings.address.state && str.push(addresses.state);
            addresses.zipcode && str.push(addresses.zipcode);

            return str.join(', ');
        },
        _check_delivery_fields: function() {
            var settings = App.Data.settings.get('settings_system'),
                empty = [],
                address = this.get('addresses'),
                req = {
                    state: 'State',
                    province: 'Province',
                    street_1: 'Address Line 1',
                    city: 'City',
                    zipcode: 'Zip Code'
                };

            address = address[address.length -1];

            // if not USA exclude state property
            if(settings.address && !settings.address.state)
                delete req.state;

            if(settings.address && address.country != 'CA')
                delete req.province;

            for(var i in req) {
                !address[i] && empty.push(req[i]);
            }

            return empty;
        },
        check: function(dining_option) {
            var err = [];

            !this.get('first_name') && err.push('First Name');
            !this.get('last_name') && err.push('Last Name');
            !EMAIL_VALIDATION_REGEXP.test(this.get('email')) && err.push('Email');
            !this.get('phone') && err.push('Phone Number');

            if (dining_option === 'DINING_OPTION_DELIVERY' && this.get('shipping_address') === -1) {
                err = err.concat(this._check_delivery_fields());
            }

            if (err.length) {
                return {
                    status: "ERROR_EMPTY_FIELDS",
                    errorMsg: MSG.ERROR_EMPTY_NOT_VALID_DATA.replace(/%s/, err.join(', ')),
                    errorList: err
                };
            }

            return {
                status: "OK"
            };
        },
        validate_address: function(success, error) {
            try {
                var geocoder = new google.maps.Geocoder(),
                    settings = App.Data.settings.get('settings_system'),
                    lat, lon,
                    address = this.get('addresses'),
                    shipping_address = this.get('shipping_address') === -1 ? address.length - 1 : this.get('shipping_address');

                address = address[shipping_address].address;

                geocoder.geocode({"address": address}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        var location = results[0]['geometry']['location'],
                            store_location = settings.address.coordinates,
                            geopoint, dist;

                        lat = location.lat();
                        lon = location.lng();
                        geopoint = new GeoPoint(store_location.lat, store_location.lng);
                        dist = typeof settings.distance_mearsure == 'string' && /^km$/i.test(settings.distance_mearsure)
                            ? geopoint.getDistanceKm(lat, lon)
                            : geopoint.getDistanceMi(lat, lon);

                        if(settings.max_delivery_distance >= dist) {
                            return success();
                        } else {
                            return error(MSG.ERROR_DELIVERY_EXCEEDED);
                        }
                    } else {
                        return error(MSG.ERROR_DELIVERY_ADDRESS);
                    }
                });
            } catch(e) {
                return error(MSG.ERROR_DELIVERY_ADDRESS);
            }
        },
        get_shipping_services: function() {
            var self = this,       
                data = {}, 
                address = this.get('addresses'), 
                shipping_addr_index = this.get('shipping_address') === -1 ? address.length - 1 : this.get('shipping_address');
            
            if (!address.length)
                return;

            data.address = address[shipping_addr_index];
            data.items = [];
            data.establishment = App.Data.settings.get("establishment");
            App.Data.myorder.each(function(model) {
                data.items.push(model.item_submit());
            });

            this.set("shipping_services", [], {silent: true});
            this.set("load_shipping_status", "pending", {silent: true});
            this.trigger("change:shipping_services");                               

           var data_json = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: App.Data.settings.get("host") + "/weborders/shipping_options/",
                data: data_json,
                dataType: "json",
                success: function(response) {
                    switch (response.status) {
                        case "OK":
                            self.set("shipping_services", response.data, {silent: true});
                            self.set("load_shipping_status", "resolved", {silent: true});
                            self.trigger("change:shipping_services");                            
                            break;
                        default: 
                            onError(self);                           
                    }
                },
                error: function() {
                    onError(self);
                },
                complete: function() {                                   
                }
            });

            function onError(self) {
                setTimeout(function() {
                    self.set("load_shipping_status", "resolved", {silent: true});
                    self.trigger("change:shipping_services"); 
                }, 300);
            }
        }
    });
});