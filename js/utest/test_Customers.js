define(['customers'], function() {
    describe("App.Models.Customer", function() {

        var model, def;

        beforeEach(function() {
            model = new App.Models.Customer();
        });

        it('Environment', function() {
            expect(App.Models.Customer).toBeDefined();
        });

        it("Create model", function() {
            expect(model.toJSON() instanceof Object).toEqual(true);
        });

        // App.Models.Customer function get_customer_name
        it("App.Models.Customer Function get_customer_name", function() {
            model.set({
                first_name: 'first',
                last_name: 'last'
            });
            model.get_customer_name(); // save current state model in storage (detected automatic)
            expect(model.get_customer_name()).toBe('first l.');
        });

        it('App.Models.Customer Function address_str.', function() {
            model.set({
               shipping_address: -1,
               addresses: [{
                 city: '',
                 country: '',
                 state: '',
                 street_1: '',
                 street_2: '',
                 zipcode: ''
               }]
            });

            this.address = deepClone(App.Data.settings.get('settings_system').address);
            App.Data.settings.get('settings_system').address = {};

            var address = model.get('addresses')[0];
            expect(model.address_str()).toBe('');

            address.street_1 = 'street_1';
            expect(model.address_str()).toBe('street_1');

            address.street_2 = 'street_2';
            expect(model.address_str()).toBe('street_1, street_2');

            address.city = 'city';
            expect(model.address_str()).toBe('street_1, street_2, city');

            address.state = 'state';
            expect(model.address_str()).toBe('street_1, street_2, city');

            App.Data.settings.get('settings_system').address = {state: 'some state'};
            expect(model.address_str()).toBe('street_1, street_2, city, state');

            address.zipcode = 'zipcode';
            expect(model.address_str()).toBe('street_1, street_2, city, state, zipcode');

            App.Data.settings.get('settings_system').address = deepClone(this.address);
        });

        it('App.Models.Customer Function _check_delivery_fields.', function() {
            model.set({
               addresses: [{
                 city: '',
                 country: '',
                 state: '',
                 street_1: '',
                 street_2: '',
                 zipcode: ''
               }]
            });

            this.address = deepClone(App.Data.settings.get('settings_system').address);
            var address = model.get('addresses')[0];
            App.Data.settings.get('settings_system').address = {};

            expect(model._check_delivery_fields()).toEqual([ 'Address Line 1', 'City', 'Zip Code' ]);

            App.Data.settings.get('settings_system').address = {state: 'some state'};
            expect(model._check_delivery_fields()).toEqual([ 'State', 'Address Line 1', 'City', 'Zip Code' ]);

            address.state = 'state';
            address.street_1 = 'st1';
            address.zipcode = 'zip';
            address.city = 'city';
            expect(model._check_delivery_fields().length).toBe(0);

            App.Data.settings.get('settings_system').address = deepClone(this.address);
        });

        describe('App.Models.Customer Function check.', function() {

            beforeEach(function() {
                model.set({
                   addresses: [{
                     city: '',
                     country: '',
                     state: '',
                     street_1: '',
                     street_2: '',
                     zipcode: ''
                   }]
                });

                this.skin = App.Data.settings.get('skin');
            });

            afterEach(function() {
                App.Data.settings.set('skin', this.skin);
            });

            it('check mlb fields. not delivery', function() {
                 App.Data.settings.set('skin', 'mlb');

                 expect(model.check().errorMsg.indexOf('Phone Number')).not.toBe(-1);
                 expect(model.check().status).toBe('ERROR_EMPTY_FIELDS');
                 expect(Array.isArray(model.check().errorList)).toBe(true);

                 model.set('phone', 'test phone');
                 expect(model.check().errorMsg.indexOf('Phone Number')).toBe(-1);

                 expect(model.check().errorMsg.indexOf('Email')).not.toBe(-1);

                 model.set('email', 'incorrect email');
                 expect(model.check().errorMsg.indexOf('Email')).not.toBe(-1);

                 model.set('email', 'test@test.test');
                 expect(model.check().status).toBe('OK');
            });

            it('check paypal fields. not delivery', function() {
                 App.Data.settings.set('skin', 'paypal');

                 expect(model.check().errorMsg.indexOf('Phone Number')).not.toBe(-1);

                 model.set('phone', 'test phone');
                 expect(model.check().status).toBe('OK');
            });

            it('check weborder fields. not delivery', function() {
                 App.Data.settings.set('skin', 'weborder');

                 expect(model.check().errorMsg.indexOf('Phone Number')).not.toBe(-1);

                 model.set('phone', 'test phone');
                 expect(model.check().errorMsg.indexOf('Phone Number')).toBe(-1);

                 expect(model.check().errorMsg.indexOf('Email')).not.toBe(-1);

                 model.set('email', 'incorrect email');
                 expect(model.check().errorMsg.indexOf('Email')).not.toBe(-1);

                 model.set('email', 'test@test.test');
                 expect(model.check().errorMsg.indexOf('Email')).toBe(-1);

                 expect(model.check().errorMsg.indexOf('First Name')).not.toBe(-1);

                 model.set('first_name', 'test name');
                 expect(model.check().errorMsg.indexOf('First Name')).toBe(-1);

                 expect(model.check().errorMsg.indexOf('Last Name')).not.toBe(-1);

                 model.set('last_name', 'test name');
                 expect(model.check().status).toBe('OK');
            });

            it('check weborder_mobile fields. not delivery', function() {
                 App.Data.settings.set('skin', 'weborder_mobile');

                 expect(model.check().errorMsg.indexOf('Phone Number')).not.toBe(-1);

                 model.set('phone', 'test phone');
                 expect(model.check().errorMsg.indexOf('Phone Number')).toBe(-1);

                 expect(model.check().errorMsg.indexOf('Email')).not.toBe(-1);

                 model.set('email', 'incorrect email');
                 expect(model.check().errorMsg.indexOf('Email')).not.toBe(-1);

                 model.set('email', 'test@test.test');
                 expect(model.check().errorMsg.indexOf('Email')).toBe(-1);

                 expect(model.check().errorMsg.indexOf('First Name')).not.toBe(-1);

                 model.set('first_name', 'test name');
                 expect(model.check().errorMsg.indexOf('First Name')).toBe(-1);

                 expect(model.check().errorMsg.indexOf('Last Name')).not.toBe(-1);

                 model.set('last_name', 'test name');
                 expect(model.check().status).toBe('OK');
            });

            it('check paypal fields delivery', function() {
                 App.Data.settings.set('skin', 'paypal');
                 model.set({
                     phone: 'test phone',
                     shipping_address: -1
                 });
                 var array = ['delivery error'];
                 spyOn(model, '_check_delivery_fields').and.returnValue(array);

                 expect(model.check('DINING_OPTION_DELIVERY').errorMsg.indexOf('delivery error')).not.toBe(-1);

                 array.pop();
                 expect(model.check().status).toBe('OK');
            });
        });


        describe('App.Models.Customer Function validate_address.', function() {
            var settings = {},
                address = [{
                 address: 'a1'
               },{
                 address: 'a2'
               }],
               result = [{
                   geometry: {
                        location: {
                            lat: function() { return 1; },
                            lng: function() { return 2; }
                        }
                   }
               }],
               args, argsGeo, func, dist = 6,
               returnSelf = function(e) {
                   return e === undefined ? 'none arguments' : e;
               };

            beforeEach(function() {
                model.set({
                   addresses: address,
                   shipping_address: -1
                });

                this.settings = deepClone(App.Data.settings.get('settings_system'));
                App.Data.settings.get('settings_system').address.coordinates = {
                            lat: 10,
                            lng: 20
                        };
                App.Data.settings.get('settings_system').max_delivery_distance = 5;
                App.Data.settings.get('settings_system').distance_mearsure = 'mi';

                this.google = window.google;
                this.GeoPoint = window.GeoPoint;

                GeoPoint = function() {
                    argsGeo = Array.prototype.slice.apply(arguments);
                    return this;
                };
                GeoPoint.prototype.getDistanceMi = function() {};
                GeoPoint.prototype.getDistanceKm = function() {};                               

                google = {
                    maps: {
                        Geocoder: function() {},
                        GeocoderStatus: {
                            OK: 'ok'
                        }
                    }
                };

                google.maps.Geocoder.prototype.geocode = function(){
                    args = arguments;
                    func();
                };

                func = function() { throw 'error' };
            });

            afterEach(function() {
                window.google = this.google;
                window.GeoPoint = this.GeoPoint;
                App.Data.settings.set('settings_system', deepClone(this.settings));
            });

            it('shipping other address', function() {
                expect(model.validate_address(returnSelf, returnSelf)).toBe(MSG.ERROR_DELIVERY_ADDRESS);
                expect(args[0].address).toBe(address[1].address);
            });

            it('shipping exicting address with index 0', function() {
                model.set('shipping_address', 0);
                model.validate_address(returnSelf, returnSelf);
                expect(args[0].address).toBe(address[0].address);
            });

            it('call callback with error status', function() {
                model.validate_address(returnSelf, returnSelf);
                expect(args[1]('', 'ERROR')).toBe(MSG.ERROR_DELIVERY_ADDRESS);
            });

            it('call callback with ok status and long distance', function() {
                spyOn(GeoPoint.prototype, 'getDistanceMi').and.callFake(function() {
                    return dist;
                });
                dist = 6;

                model.validate_address(returnSelf, returnSelf);
                expect(args[1](result, google.maps.GeocoderStatus.OK)).toBe(MSG.ERROR_DELIVERY_EXCEEDED);
                expect(argsGeo).toEqual([10, 20]);
                expect(GeoPoint.prototype.getDistanceMi).toHaveBeenCalledWith(1,2);
            });

            it('call callback with ok status and long distance', function() {
                spyOn(GeoPoint.prototype, 'getDistanceMi').and.callFake(function() {
                    return dist;
                });
                dist = 4;

                model.validate_address(returnSelf, returnSelf);
                expect(args[1](result, google.maps.GeocoderStatus.OK)).toBe('none arguments');
                expect(argsGeo).toEqual([10, 20]);
                expect(GeoPoint.prototype.getDistanceMi).toHaveBeenCalledWith(1,2);
            });

            describe('Measurement of max distance is kilometers', function() {
                beforeEach(function() {
                    App.Data.settings.get('settings_system').distance_mearsure = 'km';
                    GeoPoint.prototype.getDistanceKm = function() {};
                });
                afterEach(function() {
                    App.Data.settings.get('settings_system').distance_mearsure = 'mi';
                });
                it('call callback with error status and long distance', function() {
                    spyOn(GeoPoint.prototype, 'getDistanceKm').and.callFake(function() {
                        return dist;
                    });
                    dist = 6;

                    model.validate_address(returnSelf, returnSelf);
                    expect(args[1](result, google.maps.GeocoderStatus.OK)).toBe(MSG.ERROR_DELIVERY_EXCEEDED);
                    expect(argsGeo).toEqual([10, 20]);
                    expect(GeoPoint.prototype.getDistanceKm).toHaveBeenCalledWith(1,2);
                });

                it('call callback with ok status and short distance', function() {
                    spyOn(GeoPoint.prototype, 'getDistanceKm').and.callFake(function() {
                        return dist;
                    });
                    dist = 4;

                    model.validate_address(returnSelf, returnSelf);
                    expect(args[1](result, google.maps.GeocoderStatus.OK)).toBe('none arguments');
                    expect(argsGeo).toEqual([10, 20]);
                    expect(GeoPoint.prototype.getDistanceKm).toHaveBeenCalledWith(1,2);
                });
            })
        });
    });
});