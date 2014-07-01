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


/**
 *
 * @class GeoPoint
 * @classdesc Geolocation point class
 * @param {Number} lat Latitude
 * @param {Number} lon Longitude
 * @returns {GeoPoint} GeoPoint object
 *
 * @summary latitude and logitude must be a number
 * -90 <= latitude <= 90
 * -180 <= logitude <= 180
 */
function GeoPoint( lat, lon ){
    var def = {
        lat: 0,
        lon: 0
    };
    $.extend(this, def);

    if ( this.check( lat, lon ) ) {
        this.lat = lat;
        this.lon = lon;
    }
}
/**
 * Check correct latitude and longitude
 *
 * @param {Number} lat Latitude
 * @param {Number} lon Longitude
 * @returns {Boolean} True if latitude and logitude is correct, false if incorrect
 */
GeoPoint.prototype.check = function( lat, lon ) {
    if ( isNumber(lat) && isNumber(lon) && lat <=90 && lat >= -90 && lon <= 180 && lon >= -180 ) return true;
    return false;
};

/**
 * Check correct geo object
 *
 * @param {GeoPoint} geo GeoPoint object
 * @returns {Boolean} True if geo is GeoPoint object, false if incorrect
 */
GeoPoint.prototype.checkGeo = function( geo ) {
    if ( geo instanceof GeoPoint ) return true;
    return false;
};

/**
 * Set object position
 *
 * @param {Number} lat Latitude
 * @param {Number} lon Longitude
 * @returns {Boolean} True if successfully set, false if there was an error.
 */
GeoPoint.prototype.setPosition = function( lat, lon ) {
    if ( this.check( lat, lon ) ) {
        this.lat = lat;
        this.lon = lon;
        return true;
    }
    return false;
};

/**
 * Get distance between two geo point in Miles
 *
 * @param {(Number | GeoPoint)} arguments[0] Latitude or GeoPoint object
 * @param {Undefined | Number} arguments[1] Longitude or Undefined if first argument is GeoPoint object
 * @returns {Number} Distance in miles, 0 if geo is incorrect
 */
GeoPoint.prototype.getDistanceMi = function( geo ) {
    return this.getDistanceKm.apply(this, arguments) * 0.6213712;
};

/**
 * Get distance between two geo point in Kilometer
 *
 * @param {(Number | GeoPoint)} arguments[0] Latitude or GeoPoint object
 * @param {Undefined | Number} arguments[1] Longitude or Undefined if first argument is GeoPoint object
 * @returns {Number} Distance in kilometer, 0 if geo is incorrect
 */
GeoPoint.prototype.getDistanceKm = function( geo ) {
    var geo2;
    if (this.checkGeo(geo)) {
        geo2 = geo;
    } else if (this.check(arguments[0], arguments[1])) {
        geo2 = new GeoPoint(arguments[0], arguments[1]);
    } else {
        return 0;
    }
    var lat1 = this._deg2rad(this.lat),
        lon1 = this._deg2rad(this.lon),
        lat2 = this._deg2rad(geo2.lat),
        lon2 = this._deg2rad(geo2.lon),

        R = 6371, // Radius of the earth in km

        x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2),
        y = (lat2 - lat1),
        d = Math.sqrt(x * x + y * y) * R;

    return d;
};

/**
 * Transform degrees to radians
 *
 * @param {Number} deg Degrees
 * @returns {Number} Radians from degrees
 */
GeoPoint.prototype._deg2rad = function(deg) {
    return deg * (Math.PI / 180);
};