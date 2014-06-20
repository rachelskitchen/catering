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

    App.Views.DeliveryAddressesView = App.Views.FactoryView.extend({
        initialize: function() {
            this.model = App.Data.customer.toJSON();

            var settings = App.Data.settings.get('settings_system'),
                shipping_address = this.model.shipping_address,
                lastAddress;

            lastAddress = this.model.addresses.length &&
                          typeof this.model.addresses[this.model.addresses.length - 1].street_1 === 'string'
                            ? this.model.addresses[this.model.addresses.length - 1] : undefined;

            this.model.addresses = this.model.addresses.filter(getInitialAddresses);
            this.model.country = settings.address && settings.address.country;
            this.model.state = settings.address && settings.address.state ? (lastAddress ? lastAddress.state : settings.address.state) : null;
            this.model.states = getStates();
            this.model.street_1 = lastAddress ? lastAddress.street_1 : '';
            this.model.street_2 = lastAddress ? lastAddress.street_2 : '';
            this.model.city = lastAddress ? lastAddress.city : '';
            this.model.zipcode = lastAddress ? lastAddress.zipcode : '';

            this.otherAddress = {
                street_1: lastAddress ? lastAddress.street_1 : '',
                street_2: lastAddress ? lastAddress.street_2 : '',
                city: lastAddress ? lastAddress.city : '',
                zipcode: lastAddress ? lastAddress.zipcode : ''
            };
            if(this.model.country === 'US')
                this.otherAddress.state = this.model.state || undefined;

            // set listeners that format address fields
            this.events['focus input[name="city"]'] = this.focus.bind(this, 'City');
            this.events['blur input[name="city"]'] = this.blur.bind(this, 'City', this.changeCity);
            this.events['focus input[name="address_line1"]'] = this.focus.bind(this, 'ALine1');
            this.events['blur input[name="address_line1"]'] = this.blur.bind(this, 'ALine1', this.changeLine1);
            this.events['focus input[name="address_line2"]'] = this.focus.bind(this, 'ALine2');
            this.events['blur input[name="address_line2"]'] = this.blur.bind(this, 'ALine2', this.changeLine2);

            App.Views.FactoryView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.$el.html(this.template(this.model));
            return this;
        },
        events: {
            'change select.states': 'changeState',
            'change input[name="zip"]': 'changeZip'
        },
        changeLine1: function(e) {
            e.target.value = fistLetterToUpperCase(e.target.value);
            this.otherAddress.street_1 = e.target.value;
            this.trigger('update_address');
        },
        changeLine2: function(e) {
            e.target.value = fistLetterToUpperCase(e.target.value);
            this.otherAddress.street_2 = e.target.value;
            this.trigger('update_address');
        },
        changeCity: function(e) {
            e.target.value = fistLetterToUpperCase(e.target.value);
            this.otherAddress.city = e.target.value;
            this.trigger('update_address');
        },
        changeZip: function(e) {
            this.otherAddress.zipcode = e.target.value;
            this.trigger('update_address');
        },
        changeState: function(e) {
            this.otherAddress.state = e.target.value;
            this.trigger('update_address');
        },
        focus: function(name, event){
            var prev = null,
                format = 'format' + name,
                listen = 'listen' + name;
            this[format] = function() {
                if(event.target.value === prev)
                    return;

                try {
                    var start = event.target.selectionStart,
                        end = event.target.selectionEnd,
                        direction = event.target.selectionDirection;
                } catch(e) {
                    console.log('There is not selection API');
                }
                event.target.value = fistLetterToUpperCase(event.target.value);
                prev = event.target.value;
                try {
                    event.target.setSelectionRange(start, end, direction);
                } catch(e) {}
            };
            this[listen] = setInterval(this[format], 50);
        },
        blur: function(name, cb, event){
            var format = 'format' + name,
                listen = 'listen' + name;
            clearInterval(this['listen' + name]);
            delete this[format];
            delete this[listen];
            typeof cb === 'function' && cb.call(this, event);
        }
    });

    function getStates() {
        return {
            AL: 'Alabama',
            AK: 'Alaska',
            AZ: 'Arizona',
            AR: 'Arkansas',
            CA: 'California',
            CO: 'Colorado',
            CT: 'Connecticut',
            DE: 'Delaware',
            FL: 'Florida',
            GA: 'Georgia',
            HI: 'Hawaii',
            ID: 'Idaho',
            IL: 'Illinois',
            IN: 'Indiana',
            IA: 'Iowa',
            KS: 'Kansas',
            KY: 'Kentucky',
            LA: 'Louisiana',
            ME: 'Maine',
            MD: 'Maryland',
            MA: 'Massachusetts',
            MI: 'Michigan',
            MN: 'Minnesota',
            MS: 'Mississippi',
            MO: 'Missouri',
            MT: 'Montana',
            NE: 'Nebraska',
            NV: 'Nevada',
            NH: 'New Hampshire',
            NJ: 'New Jersey',
            NM: 'New Mexico',
            NY: 'New York',
            NC: 'North Carolina',
            ND: 'North Dakota',
            OH: 'Ohio',
            OK: 'Oklahoma',
            OR: 'Oregon',
            PA: 'Pennsylvania',
            RI: 'Rhode Island',
            SC: 'South Carolina',
            SD: 'South Dakota',
            TN: 'Tennessee',
            TX: 'Texas',
            UT: 'Utah',
            VT: 'Vermont',
            VA: 'Virginia',
            WA: 'Washington',
            WV: 'West Virginia',
            WI: 'Wisconsin',
            WY: 'Wyoming'
        };
    }

    function fistLetterToUpperCase(text) {
        return text.replace(/(^[a-z])|\s([a-z])/g, function(m, g1, g2){
            return g1 ? g1.toUpperCase() : ' ' + g2.toUpperCase();
        });
    }

    function getInitialAddresses(i) {
        return !i.street_1;
    }
});