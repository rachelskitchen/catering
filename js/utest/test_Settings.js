define([], function() {

    describe('App.Models.Settings', function() {
        var baseSettings, settings, local = {},
            get = function() {
                return local.settings ? JSON.parse(local.settings) : undefined;
            },
            set = function(e, s) {
                local.settings = s && s.toJSON && JSON.stringify(s.toJSON()) || e;
                return true;
            }, sys, all;

            var backupTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000; //60sec.

        beforeEach(function(done) {
            spyOn(window, "getData").and.callFake(get);
            spyOn(window, "setData").and.callFake(set);
            spyOn(App.Data.errors, "alert").and.callFake(function() { console.log(arguments); });


            if (settings) {
                all = settings.toJSON();
                sys = all.settings_system;
                done();
            } else {
                settings = new App.Models.Settings;
                settings.load().then(function() {
                    all = settings.toJSON();
                    sys = all.settings_system;
                    settings.on("Settings.Geolocation", function(status) {
                       jasmine.DEFAULT_TIMEOUT_INTERVAL = backupTimeout;
                       GeolocationStatus = status;
                       done();
                    });
                });
            }
        });

        describe("Settings test", function() {

            it("Settings loaded", function() {
                expect(!empty_object(sys)).toBe(true);
            });

            it('Storage data', function() {
                expect(all.storage_data === 1 || all.storage_data === 2).toBeTruthy();
            });

            it('Skin', function() {
                var skins = ['weborder', 'paypal', 'weborder_mobile', 'directory_mobile', 'directory'];
                expect(skins).toContain(all.skin);
            });

            it('Establishment', function() {
                expect(typeof all.establishment).toBe('number');
            });

            it('Timeout', function() {
                expect(typeof all.timeout).toBe('number');
            });

            it('Version', function() {
                expect(typeof all.version).toBe('number');
            });

            it('Host', function() {
                expect(all.host).toMatch(/https:\/\/[a-zA-Z0-9\-_]*\.revelup\.com/);
            });

            it('About_access_to_location presents', function() {
               expect(typeof sys.about_access_to_location).toBe('string');
            });

            it('About fields', function() {
                expect(typeof sys.about_access_to_location).toBe('string');
                expect(typeof sys.about_description).toBe('string');
                expect(Array.isArray(sys.about_images)).toBeTruthy();
                expect(typeof sys.about_title).toBe('string');
            });

            it('Business_name presents', function() {
                expect(typeof sys.business_name).toBe('string');
            });

            it('Email check', function() {
                expect(typeof sys.email).toBe('string');
                expect(sys.email.length).toBeGreaterThan(6);
                var regStr = "^[-a-z0-9!#$%&'*+/=?^_`{|}~]+(\\.[-a-z0-9!#$%&'*+/=?^_`{|}~]+)*@([a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\\.)*([a-z]{2,10})$";
                expect(sys.email).toMatch(regStr);
            });

            it('Currency symbol', function() {
                expect(typeof sys.currency_symbol).toBe('string');
                expect(sys.currency_symbol).not.toEqual('');
                expect(sys.currency_symbol).not.toBe("X");
            });

            it('Hide image', function() {
                expect(typeof sys.hide_images).toBe('boolean');
            });

            it('Logo', function() {
                expect(typeof sys.logo === 'string' || sys.logo === null).toBeTruthy();
            });

            it('Phone', function() {
                expect(typeof sys.phone).toBe('string');
            });

            it('Payment processor', function() {
                expect(typeof sys.payment_processor).toBe('object');
                expect(sys.payment_processor.paypal).toBeDefined();
                expect(sys.payment_processor.paypal_direct_credit_card).toBeDefined();
                expect(sys.payment_processor.paypal_mobile).toBeDefined();
                expect(sys.payment_processor.usaepay).toBeDefined();
            });

            it('Prevailing surcharge', function() {
                expect(typeof sys.prevailing_surcharge).toBe('number');
            });

            it('Prevailing tax', function() {
                expect(typeof sys.prevailing_tax).toBe('number');
            });

            it('Tax country', function() {
                expect(typeof sys.tax_country).toBe('string');
            });

            it('Time zone offset', function() {
                expect(typeof sys.time_zone_offset).toBe('number');
            });

            it('Timetable', function() {
                expect(Array.isArray(sys.timetables)).toBeTruthy();
            });

            it('Holidays', function() {
                expect(Array.isArray(sys.holidays)).toBeTruthy();
            });

            it('isMaintenance', function() {
                expect(sys.isMaintenance).toBeFalsy();
            });

            it('Address', function() {
                expect(sys.address).toBeDefined();
                expect(typeof sys.address.city).toBe('string');
                expect(typeof sys.address.country).toBe('string');
                expect(sys.address.country).toMatch(/^[A-Z]{2}$/);
                expect(typeof sys.address.full_address).toBe('string');
                expect(typeof sys.address.line_1).toBe('string');
                expect(typeof sys.address.line_2).toBe('string');
                expect(typeof sys.address.postal_code).toBe('string');
                expect(sys.address.coordinates).toBeDefined();
                expect(GeolocationStatus).toBe(google.maps.GeocoderStatus.OK);
                expect(typeof sys.address.coordinates.lat).toBe('number');
                expect(typeof sys.address.coordinates.lng).toBe('number');
            });

            it('auto_bag_charge', function() {
                expect(typeof sys.auto_bag_charge).toBe('number');
                expect(sys.auto_bag_charge >= 0).toBeTruthy();
            });
        });
    });
});

