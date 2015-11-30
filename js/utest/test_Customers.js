define(['customers',  'js/utest/data/Customer', 'revel_api'], function(customers, data) {

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

            it("5. 'addresses' is array with length > 1, wrong index has been passed", function() {
                get.and.returnValue([{street_1: 1}, {street_1: 2}]);
                expect(model.address_str(2)).toEqual('');
                expect(model.get).toHaveBeenCalledWith('addresses');
            });

            it("6. App.Settings.address.state is present", function() {
                var values = {
                    street_1: 'street_1',
                    street_2: 'street_2',
                    city: 'city',
                    state: 'state',
                    zipcode: 'zipcode'
                }, appCache = App;

                App = {Settings: {address: {state: true}}};

                get.and.returnValue([values]);
                expect(model.address_str()).toEqual(Object.keys(values).join(', '));
                App = appCache;
            });

            it("7. App.Settings.address.state isn't present", function() {
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

        describe('Call _check_delivery_fields() method:', function() {
            beforeEach(function() {
                this.address = deepClone(App.Data.settings.get('settings_system').address);
            });

            afterEach(function() {
                App.Data.settings.get('settings_system').address = deepClone(this.address);
            });

            it('Address is filled', function() {
                model.set('addresses', customer1.addresses);
                expect(model._check_delivery_fields().length).toBe(0);
            });

            it('Address isn\'t filled, country is US', function() {
                model.set({
                   addresses: [{
                     city: '',
                     country: 'US',
                     state: 'CA',
                     street_1: '',
                     street_2: '',
                     zipcode: ''
                   }]
                });
                expect(model._check_delivery_fields()).toEqual([ 'Address Line 1', 'City', 'Zip Code' ]);
            });

            it('Address isn\'t filled, country is CA', function() {
                model.set({
                   addresses: [{
                     city: '',
                     country: 'CA',
                     province: '',
                     street_1: '',
                     street_2: '',
                     zipcode: ''
                   }]
                });
                expect(model._check_delivery_fields()).toEqual([ 'Address Line 1', 'City', 'Province', 'Zip Code' ]);
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

        describe('check()', function() {

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

            it('not delivery', function() {
                expect(model.check().errorMsg.indexOf('Phone')).not.toBe(-1);

                 model.set('phone', '555555555');
                 expect(model.check().errorMsg.indexOf('Phone')).toBe(-1);

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

            it('delivery', function() {
                var dining_option = 'dining_option';
                spyOn(model, 'isNewAddressSelected').and.returnValue(true);
                spyOn(model, '_check_delivery_fields');
                model.check(dining_option);
                expect(model.isNewAddressSelected).toHaveBeenCalledWith(dining_option);
                expect(model._check_delivery_fields).toHaveBeenCalled();
            });
        });

        describe('get_shipping_services()', function() {
            var ajaxStub = function() {
                arg = arguments;
            };

            it('`addresses` is not set', function() {
                model.set('addresses', []);
                expect(model.get_shipping_services()).toBeUndefined();
            });

            it('`load_shipping_status` is `restoring`', function() {
                model.set('addresses', customer1.addresses);
                model.set('load_shipping_status', 'restoring');
                spyOn(model, 'trigger');
                spyOn($, 'ajax');

                model.get_shipping_services();

                expect($.ajax).not.toHaveBeenCalled();
                expect(model.get('load_shipping_status')).toBe('resolved');
                expect(model.trigger).toHaveBeenCalledWith('change:shipping_services');
            });

            it('POST shipping_options', function() {
                App.Data.myorder = new Backbone.Collection();
                model.set('addresses', customer1.addresses);

                spyOn(model, 'resetShippingServices');
                spyOn($, 'ajax').and.callThrough();

                model.get_shipping_services();

                expect(model.resetShippingServices).toHaveBeenCalledWith('pending');
                expect($.ajax).toHaveBeenCalledWith({
                    type: "POST",
                    url: App.Data.settings.get("host") + "/weborders/shipping_options/",
                    data: jasmine.any(String),
                    dataType: 'json'
                });
            });
        });

        describe('resetShippingServices()', function() {
            it('status not passed', function() {
                spyOn(model, 'trigger');
                model.resetShippingServices();

                expect(model.get('load_shipping_status')).toBe('');
                expectations();
            });

            it('status is a string', function() {
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

        it('isDefaultShippingSelected()', function() {
            model.set('shipping_selected', def.shipping_selected);
            expect(model.isDefaultShippingSelected()).toBe(true);

            model.set('shipping_selected', 1);
            expect(model.isDefaultShippingSelected()).toBe(false);
        });

    });
});