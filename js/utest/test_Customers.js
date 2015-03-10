define(['customers', 'revel_api'], function() {
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

        it('First Name and Last Name contains gaps at the beginning and at the end of both values', function() {
            model.set({
                first_name: ' firstName ',
                last_name: ' lastName '
            });
            expect(model.get('first_name')).toBe('firstName');
            expect(model.get('last_name')).toBe('lastName');
        });

        it("Call syncWithRevelAPI() method", function() {
            spyOn(model, 'syncWithRevelAPI');
            model.initialize();
            expect(model.syncWithRevelAPI).toHaveBeenCalled();
        });

        // App.Models.Customer function get_customer_name
        describe("Call get_customer_name() method:", function() {
            var testValues = [null, undefined, '', true, 123, {}, NaN, Infinity, -Infinity, -0, 0, 2.23],
                first_name, last_name;

            // save original values for first_name, last_name properties
            beforeEach(function() {
                first_name = model.get('first_name');
                last_name = model.get('last_name');

            });

            it("1. 'first_name' and 'last_name' are valid string data.", function() {
                model.set({first_name: 'firstName', last_name: 'lastName'});
                expect(model.get_customer_name()).toBe('firstName l.');
            });

            it("2. 'first_name' is invalid string data (null, undefined, empty string, not string type data). 'last_name' is valid string data.", function() {
                testValues.forEach(function(first_name) {
                    model.set({first_name: first_name, last_name: 'lastName'});
                    expect(model.get_customer_name()).toBe(' l.');
                });
            });

            it("3. 'first_name' is valid string data. 'last_name' is invalid string data (null, undefined, empty string, not string type data).", function() {
                var firstName = 'firstName';
                testValues.forEach(function(last_name) {
                    model.set({first_name: firstName, last_name: last_name});
                    expect(model.get_customer_name()).toBe(firstName);
                });
            });

            it("4. 'first_name' and 'last_name' are invalid string data (null, undefined, empty string, not string type data).", function() {
                testValues.forEach(function(first_name) {
                    testValues.forEach(function(last_name) {
                        model.set({first_name: first_name, last_name: last_name});
                        expect(model.get_customer_name()).toBe('');
                    });
                });
            });

            // restore original values for first_name, last_name properties
            afterEach(function() {
                model.set('first_name', first_name);
                model.set('last_name', last_name);
            });
        });

        it("Call saveCustomer() method", function() {
            spyOn(window, 'setData');
            model.saveCustomer();
            expect(window.setData).toHaveBeenCalledWith('customer', model);
        });

        describe("Call loadCustomer() method:", function() {
            var values = [1, '', 'asd', true, undefined, null, NaN, -Infinity, {}],
                get, getData;

            beforeEach(function() {
                get = spyOn(model, 'get'),
                getData = spyOn(window, 'getData');
                spyOn(model, 'set');
            });

            function mainWorkflow(value) {
                getData.and.returnValue(value);
                model.loadCustomer();
                expect(window.getData).toHaveBeenCalledWith('customer');
                expect(model.set).toHaveBeenCalledWith(value instanceof Object ? value : {});
                expect(model.get).toHaveBeenCalledWith('shipping_services');
            }

            it("1. 'shipping_services' isn't array", function() {
                values.forEach(function(shipping_services) {
                    get.and.returnValue(shipping_services);
                    values.forEach(function(value) {
                        mainWorkflow(value);
                        expect(model.set).not.toHaveBeenCalledWith('load_shipping_status', 'restoring', {silent: true});
                    });
                });
            });

            it("2. 'shipping_services' is empty array", function() {
                values.forEach(function(shipping_services) {
                    get.and.returnValue([]);
                    values.forEach(function(value) {
                        mainWorkflow(value);
                        expect(model.get).not.toHaveBeenCalledWith('shipping_selected');
                        expect(model.set).not.toHaveBeenCalledWith('load_shipping_status', 'restoring', {silent: true});
                    });
                });
            });

            it("3. 'shipping_services' isn't empty array, shipping_selected == -1", function() {
                values.forEach(function(shipping_services) {
                    get.and.callFake(function(param){
                        if(param == 'shipping_services') {
                            return [1]; // emulate this.get('shipping_services') result
                        } else if(param == 'shipping_selected') {
                            return -1; // emulate this.get('shipping_selected') result
                        }
                    });
                    values.forEach(function(value) {
                        mainWorkflow(value);
                        expect(model.get).toHaveBeenCalledWith('shipping_selected');
                        expect(model.set).not.toHaveBeenCalledWith('load_shipping_status', 'restoring', {silent: true});
                    });
                });
            });

            it("4. 'shipping_services' isn't empty array, shipping_selected > -1", function() {
                values.forEach(function(shipping_services) {
                    get.and.callFake(function(param){
                        if(param == 'shipping_services') {
                            return [1]; // emulate this.get('shipping_services') result
                        } else if(param == 'shipping_selected') {
                            return 0; // emulate this.get('shipping_selected') result
                        }
                    });
                    values.forEach(function(value) {
                        mainWorkflow(value);
                        expect(model.get).toHaveBeenCalledWith('shipping_selected');
                        expect(model.set).toHaveBeenCalledWith('load_shipping_status', 'restoring', {silent: true});
                    });
                });
            });
        });

        it("Call saveAddresses() method", function() {
            spyOn(model, 'get').and.returnValue(1);
            spyOn(window, 'setData');
            spyOn(Backbone, 'Model').and.returnValue({});
            model.saveAddresses();
            expect(model.get).toHaveBeenCalledWith('addresses');
            expect(Backbone.Model).toHaveBeenCalledWith({addresses: 1});
            expect(window.setData).toHaveBeenCalledWith('address', {}, true);
        });

        describe("Call loadAddresses() method:", function() {
            var values = [null, undefined, 12, NaN, Infinity, '12', '', 0, 1.223],
                getData;

            beforeEach(function() {
                getData = spyOn(window, 'getData');
                spyOn(model, 'set');
            });

            it("1. 'address' isn't object", function() {
                values.forEach(function(value) {
                    getData.and.returnValue(value);
                    model.loadAddresses();
                    expect(window.getData).toHaveBeenCalledWith('address', true);
                    expect(model.set).toHaveBeenCalledWith('addresses', []);
                });
            });

            it("2. 'address' is object, address.addresses is not array", function() {
                values.forEach(function(value) {
                    getData.and.returnValue({addresses: value});
                    model.loadAddresses();
                    expect(window.getData).toHaveBeenCalledWith('address', true);
                    expect(model.set).toHaveBeenCalledWith('addresses', []);
                });
            });

            it("3. 'address' is object, address.addresses is array with items > 1", function() {
                var arr = [1,2];
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', arr);
            });

            it("4. 'address' is object, address.addresses is array with one item, App.skin == App.Skins.RETAIL", function() {
                var arr = [1]
                    appCache = App;
                App = {skin: true, Skins: {RETAIL: true}};
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', arr);
                App = appCache;
            });


            it("5. 'address' is object, address.addresses is array with one item, App.skin != App.Skins.RETAIL, data.addresses[0].country == App.Settings.address.country", function() {
                var arr = [{country: true}]
                    appCache = App;
                App = {skin: true, Skins: {RETAIL: false}, Settings: {address: {country: true}}};
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', arr);
                App = appCache;
            });

            it("6. 'address' is object, address.addresses is array with one item, App.skin != App.Skins.RETAIL, data.addresses[0].country != App.Settings.address.country", function() {
                var arr = [{country: true}],
                    appCache = App;
                App = {skin: true, Skins: {RETAIL: false}, Settings: {address: {country: false}}};
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', []);
                App = appCache;
            });
        });

        describe("Call address_str() method:", function() {
            var get;

            beforeEach(function() {
                get = spyOn(model, 'get');
            });

            it("1. 'addresses' isn't array", function() {
                var values = [1, 0, -2, 2.087, NaN, Infinity, {}, new Function, 'asd', '', true, false, null, undefined];
                values.forEach(function(value) {
                    get.and.returnValue(value);
                    expect(model.address_str()).toEqual('');
                    expect(model.get).toHaveBeenCalledWith('addresses');
                });
            });

            it("2. 'addresses' is empty array", function() {
                get.and.returnValue([]);
                expect(model.address_str()).toEqual('');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("3. 'addresses' is array with one item", function() {
                get.and.returnValue([{street_1: 1}]);
                expect(model.address_str()).toEqual('1');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("4. 'addresses' is array with length > 1", function() {
                get.and.returnValue([{street_1: 1}, {street_1: 2}]);
                expect(model.address_str()).toEqual('2');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("5. App.Settings.address.state is present", function() {
                var values = {
                    street_1: 'street_1',
                    street_2: 'street_2',
                    city: 'city',
                    state: 'state',
                    zipcode: 'zipcode'
                }, appCache = App,
                obj;

                App = {Settings: {address: {state: true}}};

                get.and.returnValue([values]);
                expect(model.address_str()).toEqual(Object.keys(values).join(', '));
                App = appCache;
            });

            it("6. App.Settings.address.state isn't present", function() {
                var values = {
                    street_1: 'street_1',
                    street_2: 'street_2',
                    city: 'city',
                    state: 'state',
                    zipcode: 'zipcode'
                }, appCache = App, keys = Object.keys(values);

                App = {Settings: {address: {state: true}}};
                keys.splice(3, 0);
                get.and.returnValue([values]);
                expect(model.address_str()).toEqual(keys.join(', '));
                App = appCache;
            });
        });

        describe("Call syncWithRevelAPI() method:", function() {
            var getModel, listenToModel,
                RevelAPI = new App.Models.RevelAPI({customer: new App.Models.Customer});

            beforeEach(function() {
                getModel = spyOn(model, 'get');
                listenToModel = spyOn(model, 'listenTo');
            });

            it("'RevelAPI' isn't present. Shouldn't be synced.", function() {
                getModel.and.returnValue(null);
                spyOn(RevelAPI, 'get');
                spyOn(RevelAPI, 'listenTo');
                model.syncWithRevelAPI();
                expect(model.get).toHaveBeenCalledWith('RevelAPI');
                expect(RevelAPI.get).not.toHaveBeenCalled();
                expect(RevelAPI.listenTo).not.toHaveBeenCalled();
            });

            it("'RevelAPI' is present and not available. Shouldn't be synced.", function() {
                getModel.and.returnValue(RevelAPI);
                spyOn(RevelAPI, 'isAvailable').and.returnValue(false);
                spyOn(RevelAPI, 'get');
                spyOn(RevelAPI, 'listenTo');
                model.syncWithRevelAPI();
                expect(model.get).toHaveBeenCalledWith('RevelAPI');
                expect(RevelAPI.get).not.toHaveBeenCalled();
                expect(RevelAPI.listenTo).not.toHaveBeenCalled();
            });

            it("'RevelAPI' is present and available. Should be synced.", function() {
                getModel.and.returnValue(RevelAPI);
                spyOn(RevelAPI, 'isAvailable').and.returnValue(true);
                spyOn(RevelAPI, 'listenTo');
                model.syncWithRevelAPI();
                expect(model.get).toHaveBeenCalledWith('RevelAPI');
                expect(model.listenTo).toHaveBeenCalled();
                expect(RevelAPI.listenTo).toHaveBeenCalled();
            });
        });
/*
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
*/
    });
});