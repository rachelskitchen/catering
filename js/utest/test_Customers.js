define(['customers',  'js/utest/data/Customer'], function(customers, data) {

    describe("App.Models.Customer", function() {

        var model, def, customer1;

        beforeEach(function() {
            model = new App.Models.Customer();
            def = deepClone(data.defaults);
            customer1 = deepClone(data.customer1);
        });

        it('Environment', function() {
            expect(App.Models.Customer).toBeDefined();
        });

        it("Create model", function() {
            expect(model.toJSON()).toEqual(def);
        });

        it('initialize()', function() {
            // test trim
            model.set({
                first_name: ' firstName ',
                last_name: ' lastName '
            });
            expect(model.get('first_name')).toBe('firstName');
            expect(model.get('last_name')).toBe('lastName');

            // test default value
            model.set({
                first_name: 12312,
                last_name: 123123
            });
            expect(model.get('first_name')).toBe(model.defaults.first_name);
            expect(model.get('last_name')).toBe(model.defaults.last_name);

            //  test initialization of inner state
            var page_visibility = require('page_visibility');
            spyOn(model, 'setAddressesIndexes');
            spyOn(model, 'listenTo');
            spyOn(model, 'setCustomerFromCookie');
            spyOn(page_visibility, 'on');

            model.initialize();
            expect(model.setAddressesIndexes).toHaveBeenCalled();
            expect(model.listenTo).toHaveBeenCalled();
            expect(model.setCustomerFromCookie).toHaveBeenCalled();
            expect(page_visibility.on).toHaveBeenCalled();

        });

        // App.Models.Customer function get_customer_name
        describe("get_customer_name()", function() {
            var testValues = [null, undefined, '', true, 123, {}, NaN, Infinity, -Infinity, -0, 0, 2.23],
                first_name, last_name;

            // save original values for first_name, last_name properties
            beforeEach(function() {
                first_name = model.get('first_name');
                last_name = model.get('last_name');

            });

            it("`first_name` and `last_name` are valid string data.", function() {
                model.set({first_name: 'firstName', last_name: 'lastName'});
                expect(model.get_customer_name()).toBe('firstName l.');
            });

            it("`first_name` is invalid string data, `last_name` is valid string data.", function() {
                testValues.forEach(function(first_name) {
                    model.set({first_name: first_name, last_name: 'lastName'});
                    expect(model.get_customer_name()).toBe(' l.');
                });
            });

            it("`first_name` is valid string data, `last_name` is invalid string data", function() {
                var firstName = 'firstName';
                testValues.forEach(function(last_name) {
                    model.set({first_name: firstName, last_name: last_name});
                    expect(model.get_customer_name()).toBe(firstName);
                });
            });

            it("`first_name` and `last_name` are invalid string data", function() {
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

        it("saveCustomer()", function() {
            spyOn(window, 'setData');
            model.saveCustomer();
            expect(window.setData).toHaveBeenCalledWith('customer', model);
        });

        describe("loadCustomer()", function() {
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

            it("`shipping_services` isn't array", function() {
                values.forEach(function(shipping_services) {
                    get.and.returnValue(shipping_services);
                    values.forEach(function(value) {
                        mainWorkflow(value);
                        expect(model.get).not.toHaveBeenCalledWith('shipping_selected');
                        expect(model.set).not.toHaveBeenCalledWith('load_shipping_status', 'restoring', {silent: true});
                    });
                });
            });

            it("`shipping_services` is empty array", function() {
                get.and.returnValue([]);
                values.forEach(function(value) {
                    mainWorkflow(value);
                    expect(model.get).not.toHaveBeenCalledWith('shipping_selected');
                    expect(model.set).not.toHaveBeenCalledWith('load_shipping_status', 'restoring', {silent: true});
                });
            });

            it("`shipping_services` isn't empty array, `shipping_selected` == -1", function() {
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

            it("`shipping_services` isn't empty array, `shipping_selected` > -1", function() {
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

        it("saveAddresses()", function() {
            spyOn(model, 'get').and.returnValue(1);
            spyOn(window, 'setData');
            spyOn(Backbone, 'Model').and.returnValue({});
            model.saveAddresses();
            expect(model.get).toHaveBeenCalledWith('addresses');
            expect(Backbone.Model).toHaveBeenCalledWith({addresses: 1});
            expect(window.setData).toHaveBeenCalledWith('address', {}, true);
        });

        describe("loadAddresses()", function() {
            var values = [null, undefined, 12, NaN, Infinity, '12', '', 0, 1.223],
                getData, appCache;

            beforeEach(function() {
                getData = spyOn(window, 'getData');
                spyOn(model, 'set');
                appCache = App;
            });

            afterEach(function(){
                App = appCache;
            });

            it("`address` isn't object", function() {
                values.forEach(function(value) {
                    getData.and.returnValue(value);
                    model.loadAddresses();
                    expect(window.getData).toHaveBeenCalledWith('address', true);
                    expect(model.set).toHaveBeenCalledWith('addresses', []);
                });
            });

            it("`address` is object, `address.addresses` is not array", function() {
                values.forEach(function(value) {
                    getData.and.returnValue({addresses: value});
                    model.loadAddresses();
                    expect(window.getData).toHaveBeenCalledWith('address', true);
                    expect(model.set).toHaveBeenCalledWith('addresses', []);
                });
            });

            it("`address` is object, `address.addresses` is array with items > 1", function() {
                var arr = [1,2,3];
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', arr);
            });

            it("`address` is object, `address.addresses` is array with one item, `App.skin` == `App.Skins.RETAIL`", function() {
                var arr = [1];
                App = {skin: true, Skins: {RETAIL: true}};
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', arr);
            });


            it("`address` is object, `address.addresses` is array with one item, `App.skin` != `App.Skins.RETAIL`, `data.addresses[0].country` == `App.Settings.address.country`", function() {
                var arr = [{country: true}];
                App = {skin: true, Skins: {RETAIL: false}, Settings: {address: {country: true}}};
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', arr);
            });

            it("`address` is object, `address.addresses` is array with one item, `App.skin` != `App.Skins.RETAIL`, `data.addresses[0].country` != `App.Settings.address.country`", function() {
                var arr = [{country: true}];
                App = {skin: true, Skins: {RETAIL: false}, Settings: {address: {country: false}}};
                getData.and.returnValue({addresses: arr});
                model.loadAddresses();
                expect(window.getData).toHaveBeenCalledWith('address', true);
                expect(model.set).toHaveBeenCalledWith('addresses', []);
            });
        });

        describe("address_str()", function() {
            var get, appCache;

            beforeEach(function() {
                get = spyOn(model, 'get');
                appCache = App;
            });

            afterEach(function(){
                App = appCache;
            });

            it("`addresses` isn't array", function() {
                var values = [1, 0, -2, 2.087, NaN, Infinity, {}, new Function, 'asd', '', true, false, null, undefined];
                values.forEach(function(value) {
                    get.and.returnValue(value);
                    expect(model.address_str()).toEqual('');
                    expect(model.get).toHaveBeenCalledWith('addresses');
                });
            });

            it("`addresses` is empty array", function() {
                get.and.returnValue([]);
                expect(model.address_str()).toEqual('');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("`addresses` is array with one item", function() {
                get.and.returnValue([{street_1: 1}]);
                expect(model.address_str()).toEqual('1');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("`addresses` is array with length > 1", function() {
                get.and.returnValue([{street_1: 1}, {street_1: 2}]);
                expect(model.address_str()).toEqual('2');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("`addresses` is array with length > 1, `index` param is correct", function() {
                get.and.returnValue([{street_1: 1}, {street_1: 2}]);
                expect(model.address_str(0)).toEqual('1');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("`addresses` is array with length > 1, `index` param is incorrect", function() {
                get.and.returnValue([{street_1: 1}, {street_1: 2}]);
                expect(model.address_str(2)).toEqual('');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("`App.Settings.address.state` exists", function() {
                var values = {
                    street_1: 'street_1',
                    street_2: 'street_2',
                    city: 'city',
                    state: 'state',
                    zipcode: 'zipcode'
                };

                App = {Settings: {address: {state: true}}};

                get.and.returnValue([values]);
                expect(model.address_str()).toEqual(Object.keys(values).join(', '));
            });

            it("`App.Settings.address.state` doesn't exist", function() {
                var values = {
                    street_1: 'street_1',
                    street_2: 'street_2',
                    city: 'city',
                    state: 'state',
                    zipcode: 'zipcode'
                }, keys = Object.keys(values);

                App = {Settings: {address: {state: true}}};
                keys.splice(3, 0);
                get.and.returnValue([values]);
                expect(model.address_str()).toEqual(keys.join(', '));
            });
        });

        describe("_check_delivery_fields()", function() {
            var address;

            beforeEach(function() {
                address = deepClone(App.Data.settings.get('settings_system').address);
            });

            afterEach(function() {
                App.Data.settings.get('settings_system').address = deepClone(address);
            });

            it("Address is correctly filled out", function() {
                model.set('addresses', customer1.addresses);
                expect(model._check_delivery_fields().length).toBe(0);
            });

            it("Address isn't filled out, country is US", function() {
                model.set({
                   addresses: [{
                     city: '',
                     country: 'US',
                     state: '',
                     province: '',
                     street_1: '',
                     street_2: '',
                     zipcode: ''
                   }]
                });
                expect(model._check_delivery_fields()).toEqual([ 'Address Line 1', 'City', 'State', 'Zip Code' ]);
            });

            it("Address isn't filled out, country is CA", function() {
                model.set({
                   addresses: [{
                     city: '',
                     country: 'CA',
                     state: '',
                     province: '',
                     street_1: '',
                     street_2: '',
                     zipcode: ''
                   }]
                });
                expect(model._check_delivery_fields()).toEqual([ 'Address Line 1', 'City', 'Province', 'Zip Code' ]);
            });

            it("Address isn't filled out, country is neither US nor CA", function() {
                model.set({
                   addresses: [{
                     city: '',
                     country: 'EN',
                     state: '',
                     province: '',
                     street_1: '',
                     street_2: '',
                     zipcode: ''
                   }]
                });
                expect(model._check_delivery_fields()).toEqual([ 'Address Line 1', 'City', 'Zip Code' ]);
            });
        });

        describe("check()", function() {
            var skin;

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

                skin = App.Data.settings.get('skin');
            });

            afterEach(function() {
                App.Data.settings.set('skin', skin);
            });

            it("`first_name` is empty", function() {
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_FIRST_NAME)).not.toBe(-1);
            });

            it("`first_name` isn't empty", function() {
                model.set('first_name', 'test name');
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_FIRST_NAME)).toBe(-1);
            });

            it("`last_name` is empty", function() {
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_LAST_NAME)).not.toBe(-1);
            });

            it("`last_name` isn't empty", function() {
                model.set('last_name', 'test name');
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_LAST_NAME)).toBe(-1);
            });

            it("`email` is empty", function() {
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_EMAIL)).not.toBe(-1);
            });

            it("`email` is invalid", function() {
                model.set('email', 'test');
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_EMAIL)).not.toBe(-1);
            });

            it("`email` is valid", function() {
                model.set('email', 'test@revelsystems.com');
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_EMAIL)).toBe(-1);
            });

            it("`phone` is empty", function() {
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_PHONE)).not.toBe(-1);
            });

            it("`phone` isn't empty", function() {
                model.set('phone', '8236487234');
                expect(model.check().errorMsg.indexOf(_loc.CHECKOUT_PHONE)).toBe(-1);
            });

            it("need to check address fields", function() {
                var dining_option = 'dining_option';
                spyOn(model, 'isNewAddressSelected').and.returnValue(true);
                spyOn(model, '_check_delivery_fields');
                model.check(dining_option);
                expect(model.isNewAddressSelected).toHaveBeenCalledWith(dining_option);
                expect(model._check_delivery_fields).toHaveBeenCalled();
            });

            it("do not need to check address fields", function() {
                var dining_option = 'dining_option';
                spyOn(model, 'isNewAddressSelected').and.returnValue(false);
                spyOn(model, '_check_delivery_fields');
                model.check(dining_option);
                expect(model.isNewAddressSelected).toHaveBeenCalledWith(dining_option);
                expect(model._check_delivery_fields).not.toHaveBeenCalled();
            });
        });

        describe("get_shipping_services()", function() {
            var ajaxOpts,
                ajaxMock = (function(ajax) {
                    return function() {
                        ajaxOpts = arguments[0];
                        return ajax.apply(window, arguments);
                    };
                })(Backbone.$.ajax.bind(Backbone.$));

            beforeEach(function() {
                ajaxOpts = undefined;
                spyOn(model, 'resetShippingServices');
                spyOn(model, 'trigger');
                spyOn(Backbone.$, 'ajax').and.callFake(ajaxMock);
                App.Data.myorder = new Backbone.Collection();
                model.set('addresses', customer1.addresses);
            });

            it("`addresses` is not set", function() {
                model.set('addresses', []);
                expect(model.get_shipping_services()).toBeUndefined();
            });

            it("`load_shipping_status` is 'restoring'", function() {
                model.set('load_shipping_status', 'restoring');
                model.get_shipping_services();

                expect(Backbone.$.ajax).not.toHaveBeenCalled();
                expect(model.resetShippingServices).not.toHaveBeenCalled();
                expect(model.get('load_shipping_status')).toBe('resolved');
                expect(model.trigger).toHaveBeenCalledWith('change:shipping_services');
            });

            it("`jqXHR` param is passed", function() {
                var def = Backbone.$.Deferred();
                spyOn(def, 'done');
                spyOn(def, 'fail');

                model.get_shipping_services(def);

                expect(model.resetShippingServices).toHaveBeenCalledWith('pending');
                expect(Backbone.$.ajax).not.toHaveBeenCalled();
                expect(def.done).toHaveBeenCalled();
                expect(def.fail).toHaveBeenCalled();
            });

            it("`jqXHR` param isn't passed", function() {
                model.get_shipping_services();

                expect(model.resetShippingServices).toHaveBeenCalledWith('pending');
                expect(Backbone.$.ajax).toHaveBeenCalledWith({
                    type: "POST",
                    url: "/weborders/shipping_options/",
                    data: jasmine.any(String),
                    dataType: "json",
                    error: jasmine.any(Function)
                });
            });

            it("`getShippingOptions` param is passed", function() {
                var def = Backbone.$.Deferred(),
                    data = {getShippingOptions: new Function()},
                    res = {status: 'OK'};

                spyOn(data, 'getShippingOptions');
                model.get_shipping_services(def, function(res) {
                    return data.getShippingOptions(res);
                });

                def.resolve(res);
                expect(data.getShippingOptions).toHaveBeenCalledWith(res);
            });

            it("`getShippingOptions` param isn't passed", function() {
                var def = Backbone.$.Deferred(),
                    res = {status: 'OK', data: 123};

                spyOn(model, 'set');
                model.get_shipping_services(def);

                def.resolve(res);
                expect(model.set).toHaveBeenCalledWith('shipping_services', res.data, {silent: true});
            });

            it("this.isDefaultShippingAddress() returns `true`", function() {
                var address = {address: 'test address'};
                model.get('addresses').push(address);
                spyOn(model, 'isDefaultShippingAddress').and.returnValue(true);
                model.get_shipping_services();

                expect(JSON.parse(ajaxOpts.data).address).toEqual(address);
            });

            it("this.isDefaultShippingAddress() returns `false`", function() {
                var address = {address: 'test address'},
                    originalShippingAddress = model.get('shipping_address'),
                    addresses = model.get('addresses');
                addresses.push(address);
                model.set('shipping_address', 0);
                spyOn(model, 'isDefaultShippingAddress').and.returnValue(false);
                model.get_shipping_services();

                expect(JSON.parse(ajaxOpts.data).address).toEqual(addresses[0]);

                model.set('shipping_address', originalShippingAddress);
            });

            describe("request is failed:", function() {
                // Implement async run.
                // http://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support

                var _model = new App.Models.Customer();

                beforeEach(function(done) {
                    var def = Backbone.$.Deferred(),
                        xhr = {statusText: ''},
                        self = this;

                    _model.set('addresses', customer1.addresses);
                    _model.get_shipping_services(def);
                    def.reject(xhr);

                    setTimeout(function() {
                        done();
                    }, 400);
                });

                it("not aborted", function(done) {
                    expect(_model.get('load_shipping_status')).toBe('resolved');
                    done();
                });
            });

            describe("request is failed:", function() {
                // Implement async run.
                // http://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support
                var _model = new App.Models.Customer();

                beforeEach(function(done) {
                    var def = Backbone.$.Deferred(),
                        xhr = {statusText: 'abort'},
                        self = this;

                    _model.set('addresses', customer1.addresses);
                    _model.get_shipping_services(def);

                    def.reject(xhr);

                    setTimeout(function() {
                        done();
                    }, 400);
                });

                it("aborted", function(done) {
                    expect(_model.get('load_shipping_status')).not.toBe('resolved');
                    done();
                });
            });

            describe("request is successfully completed:", function() {
                // Implement async run.
                // http://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support
                var _model = new App.Models.Customer();

                beforeEach(function(done) {
                    var def = Backbone.$.Deferred(),
                        xhr = {status: 'error'},
                        self = this;

                    _model.set('addresses', customer1.addresses);
                    _model.get_shipping_services(def);

                    def.reject(xhr);

                    setTimeout(function() {
                        done();
                    }, 400);
                });

                it("`response.status` isn't 'OK'", function(done) {
                    expect(_model.get('load_shipping_status')).toBe('resolved');
                    expect(_model.get('shipping_services')).toEqual(_model.defaults.shipping_services);
                    expect(_model.get('shipping_selected')).toEqual(_model.defaults.shipping_selected);
                    done();
                });
            });

            describe("request is successfully completed, `response.status` is 'OK':", function() {
                var data;

                function getShippingOptions(response) {
                    return data;
                }

                function commonExpectations() {
                    expect(model.resetShippingServices).toHaveBeenCalledWith('pending');
                    expect(model.trigger).toHaveBeenCalledWith('change:shipping_services');
                    expect(model.get('shipping_services')).toBe(data);
                    expect(model.get('load_shipping_status')).toBe("resolved");
                }

                it("`response.data` isn't object", function() {
                    var def = Backbone.$.Deferred();
                    data = 1;
                    model.get_shipping_services(def, getShippingOptions);
                    def.resolve({status: 'OK'});
                    commonExpectations();
                    expect(model.get('shipping_selected')).toBe(-1);
                });

                it("`response.data.shipping` isn't object", function() {
                    var def = Backbone.$.Deferred();
                    data = 2;
                    model.get_shipping_services(def, getShippingOptions);
                    def.resolve({status: 'OK', data: {a:1}});
                    commonExpectations();
                    expect(model.get('shipping_selected')).toBe(-1);
                });

                it("`response.data.shipping.options` isn't array", function() {
                    var def = Backbone.$.Deferred();
                    data = 3;
                    model.get_shipping_services(def, getShippingOptions);
                    def.resolve({status: 'OK', data: {a:1}});
                    commonExpectations();
                    expect(model.get('shipping_selected')).toBe(-1);
                });

                it("`response.data.shipping.options` is array, `response.data.shipping.service_code` isn't in `response.data.shipping.options`", function() {
                    var def = Backbone.$.Deferred();
                    data = 4;
                    model.get_shipping_services(def, getShippingOptions);
                    def.resolve({
                        status: 'OK',
                        data: {
                            shipping: {
                                options: [{service_code: 1, name: 'test'}],
                                service_code: 2
                            }
                        }
                    });
                    commonExpectations();
                    expect(model.get('shipping_selected')).toBe(-1);
                });

                it("`response.data.shipping.options` is array, `response.data.shipping.service_code` is in `response.data.shipping.options`", function() {
                    var def = Backbone.$.Deferred();
                    data = 4;
                    model.get_shipping_services(def, getShippingOptions);
                    def.resolve({
                        status: 'OK',
                        data: {
                            shipping: {
                                options: [{service_code: 1, name: 'test'}],
                                service_code: 1
                            }
                        }
                    });
                    commonExpectations();
                    expect(model.get('shipping_selected')).toBe(0);
                });
            });
        });

        describe("resetShippingServices()", function() {
            it("`status` param isn't string", function() {
                spyOn(model, 'trigger');
                model.resetShippingServices();

                expect(model.get('load_shipping_status')).toBe('');
                expectations();
            });

            it('`status` is a string', function() {
                var status = 'pending';
                spyOn(model, 'trigger');
                model.resetShippingServices(status);

                expect(model.get('load_shipping_status')).toBe(status);
                expectations();
            });

            function expectations() {
                expect(model.get('shipping_services').length).toBe(0);
                expect(model.get('shipping_selected')).toBe(-1);
                expect(model.trigger).toHaveBeenCalledWith('change:shipping_services');
            }
        });

        describe("setAddressesIndexes()", function() {
            it("`addresses` isn't array", function() {
                model.set('addresses', null);
                spyOn(model, 'set');
                model.setAddressesIndexes();
                expect(model.set).not.toHaveBeenCalled();
            });

            it("`addresses` is array", function() {
                model.set('addresses', [1, 2, 3]);
                model.setAddressesIndexes();

                expect(model.get('deliveryAddressIndex')).toBe(3);
                expect(model.get('shippingAddressIndex')).toBe(4);
                expect(model.get('cateringAddressIndex')).toBe(5);
                expect(model.get('profileAddressIndex')).toBe(6);
            });
        });

        it('isDefaultShippingAddress()', function() {
            model.set('shipping_address', def.shipping_address);
            expect(model.isDefaultShippingAddress()).toBe(true);

            model.set('shipping_address', 1);
            expect(model.isDefaultShippingAddress()).toBe(false);
        });

        it('isDefaultShippingSelected()', function() {
            model.set('shipping_selected', def.shipping_selected);
            expect(model.isDefaultShippingSelected()).toBe(true);

            model.set('shipping_selected', 1);
            expect(model.isDefaultShippingSelected()).toBe(false);
        });

        describe("isNewAddressSelected()", function() {
            var originalShippingAddress;

            beforeEach(function() {
                originalShippingAddress = originalShippingAddress ? originalShippingAddress : model.get('shipping_address');
            });

            afterEach(function() {
                model.get('shipping_address', originalShippingAddress);
            });

            it("`dining_option` param is 'DINING_OPTION_DELIVERY', `shipping_address` is delivery address index", function() {
                model.set('shipping_address', model.get('deliveryAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_DELIVERY')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_DELIVERY', `shipping_address` is shipping address index", function() {
                model.set('shipping_address', model.get('shippingAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_DELIVERY')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_DELIVERY', `shipping_address` is catering address index", function() {
                model.set('shipping_address', model.get('cateringAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_DELIVERY')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_DELIVERY', `shipping_address` is neither delivery nor shipping nor catering address index", function() {
                model.set('shipping_address', -1);
                expect(model.isNewAddressSelected('DINING_OPTION_DELIVERY')).toBe(false);
            });

            it("`dining_option` param is 'DINING_OPTION_SHIPPING', `shipping_address` is delivery address index", function() {
                model.set('shipping_address', model.get('deliveryAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_SHIPPING')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_SHIPPING', `shipping_address` is shipping address index", function() {
                model.set('shipping_address', model.get('shippingAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_SHIPPING')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_SHIPPING', `shipping_address` is catering address index", function() {
                model.set('shipping_address', model.get('cateringAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_SHIPPING')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_SHIPPING', `shipping_address` is neither delivery nor shipping nor catering address index", function() {
                model.set('shipping_address', -1);
                expect(model.isNewAddressSelected('DINING_OPTION_SHIPPING')).toBe(false);
            });

            it("`dining_option` param is 'DINING_OPTION_CATERING', `shipping_address` is delivery address index", function() {
                model.set('shipping_address', model.get('deliveryAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_CATERING')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_CATERING', `shipping_address` is shipping address index", function() {
                model.set('shipping_address', model.get('shippingAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_CATERING')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_CATERING', `shipping_address` is catering address index", function() {
                model.set('shipping_address', model.get('cateringAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_CATERING')).toBe(true);
            });

            it("`dining_option` param is 'DINING_OPTION_CATERING', `shipping_address` is neither delivery nor shipping nor catering address index", function() {
                model.set('shipping_address', -1);
                expect(model.isNewAddressSelected('DINING_OPTION_CATERING')).toBe(false);
            });

            it("`dining_option` param is neither 'DINING_OPTION_DELIVERY' nor 'DINING_OPTION_SHIPPING' nor 'DINING_OPTION_CATERING', `shipping_address` is delivery address index", function() {
                model.set('shipping_address', model.get('deliveryAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_TOGO')).toBe(false);
            });

            it("`dining_option` param is neither 'DINING_OPTION_DELIVERY' nor 'DINING_OPTION_SHIPPING' nor 'DINING_OPTION_CATERING', `shipping_address` is shipping address index", function() {
                model.set('shipping_address', model.get('shippingAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_TOGO')).toBe(false);
            });

            it("`dining_option` param is neither 'DINING_OPTION_DELIVERY' nor 'DINING_OPTION_SHIPPING' nor 'DINING_OPTION_CATERING', `shipping_address` is catering address index", function() {
                model.set('shipping_address', model.get('cateringAddressIndex'));
                expect(model.isNewAddressSelected('DINING_OPTION_TOGO')).toBe(false);
            });

            it("`dining_option` param is neither 'DINING_OPTION_DELIVERY' nor 'DINING_OPTION_SHIPPING' nor 'DINING_OPTION_CATERING', `shipping_address` is neither delivery nor shipping nor catering address index", function() {
                model.set('shipping_address', -1);
                expect(model.isNewAddressSelected('DINING_OPTION_TOGO')).toBe(false);
            });
        });

        describe("checkSignUpData()", function() {
            var originalFirstName, originalLastName, originalEmail,
                originalPhone, originalPassword;

            beforeEach(function() {
                originalFirstName = typeof originalFirstName != 'undefined' ? originalFirstName : model.get('first_name');
                originalLastName = typeof originalLastName != 'undefined' ? originalLastName : model.get('last_name');
                originalEmail = typeof originalEmail != 'undefined' ? originalEmail : model.get('email');
                originalPhone = typeof originalPhone != 'undefined' ? originalPhone : model.get('phone');
                originalPassword = typeof originalPassword != 'undefined' ? originalPassword : model.get('password');
            });

            afterEach(function() {
                model.set({
                    first_name: originalFirstName,
                    last_name: originalLastName,
                    email: originalEmail,
                    phone: originalPhone,
                    password: originalPassword
                });
            });

            it("all attributes are valid", function() {
                model.set({
                    first_name: 'First Name',
                    last_name: 'Last Name',
                    email: 'test@revelsystems.com',
                    phone: '923842374897',
                    password: 'tststskdgsjh'
                });

                expect(model.checkSignUpData()).toEqual({status: 'OK'});
            });

            it("`first_name` is invalid", function() {
                model.set({
                    first_name: '',
                    last_name: 'Last Name',
                    email: 'test@revelsystems.com',
                    phone: '923842374897',
                    password: 'tststskdgsjh'
                });

                var result = model.checkSignUpData();

                expect(result.status).toBe('ERROR_EMPTY_FIELDS');
                expect(result.errorMsg.indexOf(_loc.PROFILE_FIRST_NAME)).not.toBe(-1);
                expect(result.errorList.indexOf(_loc.PROFILE_FIRST_NAME)).not.toBe(-1);
            });

            it("`last_name` is invalid", function() {
                model.set({
                    first_name: 'First Name',
                    last_name: '',
                    email: 'test@revelsystems.com',
                    phone: '923842374897',
                    password: 'tststskdgsjh'
                });

                var result = model.checkSignUpData();

                expect(result.status).toBe('ERROR_EMPTY_FIELDS');
                expect(result.errorMsg.indexOf(_loc.PROFILE_LAST_NAME)).not.toBe(-1);
                expect(result.errorList.indexOf(_loc.PROFILE_LAST_NAME)).not.toBe(-1);
            });

            it("`email` is invalid", function() {
                model.set({
                    first_name: 'First Name',
                    last_name: 'Last Name',
                    email: 'test',
                    phone: '923842374897',
                    password: 'tststskdgsjh'
                });

                var result = model.checkSignUpData();

                expect(result.status).toBe('ERROR_EMPTY_FIELDS');
                expect(result.errorMsg.indexOf(_loc.PROFILE_EMAIL_ADDRESS)).not.toBe(-1);
                expect(result.errorList.indexOf(_loc.PROFILE_EMAIL_ADDRESS)).not.toBe(-1);
            });

            it("`phone` is invalid", function() {
                model.set({
                    first_name: 'First Name',
                    last_name: 'Last Name',
                    email: 'test@revelsystems.com',
                    phone: '',
                    password: 'tststskdgsjh'
                });

                var result = model.checkSignUpData();

                expect(result.status).toBe('ERROR_EMPTY_FIELDS');
                expect(result.errorMsg.indexOf(_loc.PROFILE_PHONE)).not.toBe(-1);
                expect(result.errorList.indexOf(_loc.PROFILE_PHONE)).not.toBe(-1);
            });

            it("`password` is invalid", function() {
                model.set({
                    first_name: 'First Name',
                    last_name: 'Last Name',
                    email: 'test@revelsystems.com',
                    phone: '923842374897',
                    password: ''
                });

                var result = model.checkSignUpData();

                expect(result.status).toBe('ERROR_EMPTY_FIELDS');
                expect(result.errorMsg.indexOf(_loc.PROFILE_PASSWORD)).not.toBe(-1);
                expect(result.errorList.indexOf(_loc.PROFILE_PASSWORD)).not.toBe(-1);
            });
        });

        describe("comparePasswords", function() {
            var originalPWD, originalConfirmPWD;

            beforeEach(function() {
                originalPWD = typeof originalPWD != 'undefined' ? originalPWD : model.get('password');
                originalConfirmPWD = typeof originalConfirmPWD != 'undefined' ? originalConfirmPWD : model.get('confirm_password');
            });

            afterEach(function() {
                model.set({
                    password: originalPWD,
                    confirm_password: originalConfirmPWD
                });
            });

            it("`password` matches `confirm_password`", function() {
                model.set({
                    password: '1',
                    confirm_password: '1'
                });

                expect(model.comparePasswords()).toEqual({status: 'OK'});
            });

            it("`password` doesn't match `confirm_password`", function() {
                model.set({
                    password: '1',
                    confirm_password: '2'
                });

                expect(model.comparePasswords()).toEqual({
                    status: "ERROR_PASSWORDS_MISMATCH",
                    errorMsg: _loc.PROFILE_PASSWORDS_MISMATCH,
                });
            });
        });

        describe("login()", function() {
            var originalEmail, originalPWD, ajaxMock, ajaxOpts,
                email = 'test@revelsystems.com',
                password = "123";

            beforeEach(function() {
                originalEmail = typeof originalEmail != 'undefined' ? originalEmail : model.get('email');
                originalPWD = typeof originalPWD != 'undefined' ? originalPWD : model.get('password');
                model.set({
                    email: email,
                    password: password
                });

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxMock = Backbone.$.Deferred();
                    ajaxOpts = arguments[0];
                    ajaxMock.done(ajaxOpts.success.bind(model));
                    ajaxMock.fail(ajaxOpts.error.bind(model));
                    return ajaxMock;
                });

                spyOn(model, 'updateCookie');
                spyOn(model, 'setCustomerFromAPI');
                spyOn(model, 'initPayments');
                spyOn(model, 'trigger');

                model.login();
            });

            afterEach(function() {
                model.set({
                    email: originalEmail,
                    password: originalPWD
                });
            });

            function commonExpectations() {
                expect(ajaxOpts.url.indexOf('/customers-auth/v1/authorization/token-customer/')).not.toBe(-1);
                expect(ajaxOpts.method).toBe('POST');
                expect(ajaxOpts.data).toEqual({
                    username: email,
                    scope: '*',
                    password: password,
                    grant_type: "password"
                });
            }

            it("successful log in", function() {
                var data = {
                    a:1,
                    customer: {payments: [1, 2, 3]},
                    token: {scope: "*"}
                }, _data = deepClone(data);

                ajaxMock.resolve(data);

                delete _data.customer.payments;
                delete _data.token.scope;

                commonExpectations();
                expect(model.updateCookie).toHaveBeenCalledWith(_data);
                expect(model.setCustomerFromAPI).toHaveBeenCalledWith(_data);
                expect(model.initPayments).toHaveBeenCalled();
            });

            it("failure log in, `jqXHR.responseJSON` isn't object", function() {
                var jqXHR = {status: 423};
                ajaxMock.reject(jqXHR);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onNotActivatedUser', {});
            });

            it("failure log in, `jqXHR.responseJSON` is object", function() {
                var jqXHR = {status: 423, responseJSON: {a: 1}};
                ajaxMock.reject(jqXHR);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onNotActivatedUser', jqXHR.responseJSON);
            });

            it("failure log in, `jqXHR.status` is 423", function() {
                var jqXHR = {
                    status: 423,
                    responseJSON: {
                        error: 'sadasd'
                    }
                };
                ajaxMock.reject(jqXHR);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onNotActivatedUser', jqXHR.responseJSON);
            });

            it("failure log in, `jqXHR.status` is 400, `jqXHR.responseJSON.error` is 'invalid_grant'", function() {
                var jqXHR = {
                    status: 400,
                    responseJSON: {
                        error: 'invalid_grant'
                    }
                };
                ajaxMock.reject(jqXHR);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onInvalidUser', jqXHR.responseJSON);
            });

            it("failure log in, `jqXHR.status` is 400, `jqXHR.responseJSON.error` is 'invalid_scope'", function() {
                var jqXHR = {
                    status: 400,
                    responseJSON: {
                        error: 'invalid_scope'
                    }
                };
                ajaxMock.reject(jqXHR);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onInvalidUser', jqXHR.responseJSON);
            });

            it("failure log in, `jqXHR.status` is 400, `jqXHR.responseJSON.error` is 'invalid_request'", function() {
                var jqXHR = {
                    status: 400,
                    responseJSON: {
                        error: 'invalid_request'
                    }
                };
                ajaxMock.reject(jqXHR);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onLoginError', jqXHR.responseJSON);
            });
        });

        it("logout()", function() {
            var docCookies = require('doc_cookies');

            spyOn(docCookies, 'removeItem');
            spyOn(model, 'removePayments');
            spyOn(model, 'trigger');

            model.set({
                first_name: 'First Name',
                last_name: 'Last Name',
                email: 'First Name',
                phone: '98423782364786',
                access_token: '13123213'
            });

            model.logout();

            expect(docCookies.removeItem).toHaveBeenCalledWith('user', '/weborder', 'revelup.com');
            expect(model.removePayments).toHaveBeenCalled();
            expect(model.trigger).toHaveBeenCalledWith('onLogout');
            expect(model.toJSON()).toEqual(model.defaults);
        });

        describe("signup()", function() {
            var originalEmail, originalPWD, originalFirstName, originalLastName,
                originalPhone, address, ajaxMock, ajaxOpts,
                email = 'test@revelsystems.com',
                password = "123",
                first_name = 'First Name',
                last_name = 'Last Name',
                phone = '12321383232';

            beforeEach(function() {
                originalEmail = model.get('email');
                originalPWD = model.get('password');
                originalFirstName = model.get('first_name');
                originalLastName = model.get('last_name');
                originalPhone = model.get('phone');

                model.set({
                    email: email,
                    password: password,
                    first_name: first_name,
                    last_name: last_name,
                    phone: phone
                });

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxMock = Backbone.$.Deferred();
                    ajaxOpts = arguments[0];
                    ajaxMock.done(ajaxOpts.success.bind(model));
                    ajaxMock.fail(ajaxOpts.error.bind(model));
                    return ajaxMock;
                });

                spyOn(model, 'convertAddressToAPIFormat').and.callFake(function() {
                    return address;
                });
                spyOn(model, 'clearPasswords');
                spyOn(model, 'logout');
                spyOn(model, 'trigger');
            });

            afterEach(function() {
                model.set({
                    email: originalEmail,
                    password: originalPWD,
                    first_name: originalFirstName,
                    last_name: originalLastName,
                    phone: originalPhone
                });
            });

            function commonExpectations() {
                var data = JSON.parse(ajaxOpts.data);
                expect(ajaxOpts.url.indexOf('/customers-auth/v1/customers/register-customer/')).not.toBe(-1);
                expect(ajaxOpts.method).toBe('POST');
                expect(ajaxOpts.contentType).toBe('application/json');
                expect(typeof ajaxOpts.data).toBe('string');
                expect(data.email).toBe(email);
                expect(data.password).toBe(password);
                expect(data.first_name).toBe(first_name);
                expect(data.last_name).toBe(last_name);
                expect(data.phone_number).toBe(phone);
                expect(model.convertAddressToAPIFormat).toHaveBeenCalled();
            }

            it("`address` param isn't object", function() {
                model.signup();

                commonExpectations();
                expect(JSON.parse(ajaxOpts.data).address).toBeUndefined();
            });

            it("`address` param is object", function() {
                address = {city: 'SF'};
                model.signup(address);

                commonExpectations();
                expect(JSON.parse(ajaxOpts.data).address).toEqual(address);
            });

            it("successful sign up", function() {
                model.signup().resolve();

                commonExpectations();
                expect(model.clearPasswords).toHaveBeenCalled();
                expect(model.logout).toHaveBeenCalled();
                expect(model.trigger).toHaveBeenCalledWith('onUserCreated');
            });

            it("failure sign up, `jqXHR.responseJSON` isn't object", function() {
                model.signup().reject({status: 400});

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onUserValidationError', {});
            });

            it("failure sign up, `jqXHR.responseJSON` is object", function() {
                var resp = {
                    status: 400,
                    responseJSON: {a: 1}
                };
                model.signup().reject(resp);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onUserValidationError', resp.responseJSON);
            });

            it("failure sign up, `jqXHR.status` is 400", function() {
                var resp = {
                    status: 400,
                    responseJSON: {
                        email: 1
                    }
                };
                model.signup().reject(resp);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onUserValidationError', resp.responseJSON);
            });

            it("failure sign up, `jqXHR.status` is 422", function() {
                var resp = {
                    status: 422,
                    responseJSON: {
                        email: 1
                    }
                };
                model.signup().reject(resp);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onUserExists', resp.responseJSON);
            });

            it("failure sign up, `jqXHR.status` is neither 400 nor 422", function() {
                var resp = {
                    status: 404,
                    responseJSON: {
                        email: 1
                    }
                };
                model.signup().reject(resp);

                commonExpectations();
                expect(model.trigger).toHaveBeenCalledWith('onUserCreateError', resp.responseJSON);
            });
        });

        it("getEmptyAddress()", function() {
            expect(model.getEmptyAddress()).toEqual({
                country: '',
                state: '',
                province: '',
                street_1: '',
                street_2: '',
                city: '',
                zipcode: ''
            });
        });

        describe("getAuthorizationHeader()", function() {
            var originalTokenType, originalAccessToken;

            beforeEach(function() {
                originalTokenType = model.get('token_type');
                originalAccessToken = model.get('access_token');
            });

            afterEach(function() {
                model.set({
                    token_type: originalTokenType,
                    access_token: originalAccessToken
                });
            });

            it("`token_type` and `access_token` aren't specified", function() {
                model.set({
                    token_type: '',
                    access_token: ''
                });

                expect(model.getAuthorizationHeader()).toEqual({});
            });

            it("`token_type` isn't specified, `access_token` is specified", function() {
                model.set({
                    token_type: '',
                    access_token: 'sadsad'
                });

                expect(model.getAuthorizationHeader()).toEqual({});
            });

            it("`token_type` is specified, `access_token` isn't specified", function() {
                model.set({
                    token_type: 'asdasdasd',
                    access_token: ''
                });

                expect(model.getAuthorizationHeader()).toEqual({});
            });

            it("`token_type` and `access_token` are specified", function() {
                var token_type = 'asdasdasd',
                    access_token = 'asdsad';

                model.set({
                    token_type: token_type,
                    access_token: access_token
                });

                expect(model.getAuthorizationHeader()).toEqual({
                    Authorization: token_type + ' ' + access_token
                });
            });
        });

        describe("setProfileAddress()", function() {
            var address, originalAddresses;

            beforeEach(function() {
                originalAddresses = model.get('addresses');
                address = {city: 'SF'};
                spyOn(model, 'convertAddressFromAPIFormat').and.callFake(function() {
                    return address;
                });
            });

            afterEach(function() {
                model.set('addresses', originalAddresses);
            });

            it("`address` param isn't object", function() {
                model.setProfileAddress();

                expect(model.convertAddressFromAPIFormat).not.toHaveBeenCalled();
                expect(model.get('addresses')[model.get('profileAddressIndex')]).not.toBe(address);
            });

            it("`address` param is object", function() {
                model.setProfileAddress(address);

                expect(model.convertAddressFromAPIFormat).toHaveBeenCalledWith(address);
                expect(model.get('addresses')[model.get('profileAddressIndex')]).toBe(address);
            });
        });

        it("getProfileAddress()", function() {
            var addresses = model.get('addresses'),
                address = {city: 'SF'};

            spyOn(model, 'convertAddressFromAPIFormat').and.returnValue(address);
            model.setProfileAddress(address);

            expect(model.getProfileAddress()).toBe(address);
        });

        describe("updateCustomer()", function() {
            var originalEmail, originalFirstName, originalLastName,
                originalPhone, originalUserId, ajaxMock, ajaxOpts,
                email = 'test@revelsystems.com',
                first_name = 'First Name',
                last_name = 'Last Name',
                phone = '12321383232',
                user_id = 7,
                dataInAPIFormat = 123;

            beforeEach(function() {
                originalEmail = model.get('email');
                originalFirstName = model.get('first_name');
                originalLastName = model.get('last_name');
                originalPhone = model.get('phone');
                originalUserId = model.get('user_id');

                model.set({
                    user_id: user_id,
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    phone: phone
                });

                spyOn(Backbone.$, 'ajax').and.callFake(function() {
                    ajaxMock = Backbone.$.Deferred();
                    ajaxOpts = arguments[0];
                    ajaxMock.done(ajaxOpts.success.bind(model));
                    ajaxMock.fail(ajaxOpts.error.bind(model));
                    return ajaxMock;
                });

                spyOn(model, 'getCustomerInAPIFormat').and.returnValue(dataInAPIFormat);
                spyOn(model, 'getAuthorizationHeader');
                spyOn(model, 'updateCookie');
                spyOn(model, 'logout');
                spyOn(model, 'trigger');
            });

            afterEach(function() {
                model.set({
                    user_id: originalUserId,
                    email: originalEmail,
                    first_name: originalFirstName,
                    last_name: originalLastName,
                    phone: originalPhone
                });
            });

            function commonExpectations() {
                var data = JSON.parse(ajaxOpts.data);
                expect(ajaxOpts.url.indexOf('/customers-auth/v1/customers/customers/' + user_id + '/')).not.toBe(-1);
                expect(ajaxOpts.method).toBe('PATCH');
                expect(ajaxOpts.contentType).toBe('application/json');
                expect(typeof ajaxOpts.data).toBe('string');
                expect(model.getAuthorizationHeader).toHaveBeenCalled();
                expect(data).toEqual({
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    phone_number: phone
                });
            }

            it("successful response", function() {
                model.updateCustomer().resolve();

                commonExpectations();
                expect(model.getCustomerInAPIFormat).toHaveBeenCalled();
                expect(model.updateCookie).toHaveBeenCalledWith(dataInAPIFormat);
                expect(model.trigger).toHaveBeenCalledWith('onUserUpdate');
            });
        });
    });
});