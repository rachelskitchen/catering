define(['js/utest/data/Geolocation', 'geolocation'], function(data) {

    describe('App.Models.Geolocation', function() {
        var nul, successCoord, error1Coord, error2Coord, errorNOAPICoord, geolocation;

        beforeEach(function() {
            nul = data.def;
            successCoord = data.success;
            error1Coord = data.error1;
            error2Coord = data.error2;
            errorNOAPICoord = data.errorNoAPI;
            geolocation = new App.Models.Geolocation();
        });

        it('Environment', function() {
           expect(App.Models.Geolocation).toBeDefined();
        });

        it('initialize()', function() {
            var geolocation = new App.Models.Geolocation();
            expect(geolocation.toJSON()).toEqual(nul);
        });

        it('get_current_loc()', function() {
            expect(geolocation.get_current_loc()).toBe(geolocation.get('current_loc'));
        });

        describe('detect_current_location', function() {
            var success, error, geoloc, coord, dfd, isGeolocationAPIAvailable;

            beforeEach(function() {
                geoloc = function(succ, err) {
                    success = succ;
                    error = err;
                };
                coord = {
                   coords: {
                       latitude: data.success.current_loc.latitude,
                       longitude: data.success.current_loc.longitude
                   }
                };
                isGeolocationAPIAvailable = true;
                spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake(geoloc);
                spyOn(geolocation, 'unableDefineCurLocation');
                spyOn(geolocation, 'isGeolocationAPIAvailable').and.callFake(function() {
                    return isGeolocationAPIAvailable;
                });
            });

            it('navigator.geolocation exists, successful detecting', function() {
                dfd = geolocation.detect_current_location();
                expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
                expect(dfd.state()).toBe('pending');
                success(coord);
                expect(dfd.state()).toBe('resolved');
                expect(geolocation.toJSON()).toEqual(successCoord);
            });

            it('navigator.geolocation exists, failure detecting', function() {
                dfd = geolocation.detect_current_location();
                expect(dfd.state()).toBe('pending');
                error(data.knownError);
                expect(dfd.state()).toBe('resolved');
                expect(geolocation.unableDefineCurLocation).toHaveBeenCalledWith(data.knownError);
            });

            it('navigator.geolocation doesn\'t exist', function() {
                isGeolocationAPIAvailable = false;
                dfd = geolocation.detect_current_location();
                expect(dfd.state()).toBe('resolved');
                expect(geolocation.toJSON()).toEqual(errorNOAPICoord);
            });

            it('Firefox: if the user clicks \'Not Now\' the geoloc does not returns an error. Resolve dfd with timeout.', function() {
                // install timer
                jasmine.clock().install();

                var timeout = geolocation.get('timeout'),
                    ff = cssua.userAgent.firefox;

                cssua.userAgent.firefox = true;
                geolocation.set('timeout', 100);
                dfd = geolocation.detect_current_location();

                jasmine.clock().tick(101);
                expect(dfd.state()).toBe('resolved');
                expect(geolocation.unableDefineCurLocation).toHaveBeenCalledWith(data.knownError);

                // uninstall timer
                jasmine.clock().uninstall();

                cssua.userAgent.firefox = ff;
                geolocation.set('timeout', timeout);
            });
        });

        it('setCurLocation()', function() {
            geolocation.setCurLocation(data.success.current_loc.latitude, data.success.current_loc.longitude);
            expect(geolocation.toJSON()).toEqual(data.success);
        });

        describe('unableDefineCurLocation()', function() {
            it('Geolocation API is disabled', function() {
                geolocation.unableDefineCurLocation(data.geolocationAPIDisabled);
                expect(geolocation.get('state')).toBe(data.success.state);
                expect(geolocation.get('statusText')).toBe(MSG.ERROR_GEOLOCATION[data.geolocationAPIDisabled.code]);
            });

            it('The browser was unable to determine a location', function() {
                geolocation.unableDefineCurLocation(data.unableToDefineLocation);
                expect(geolocation.get('state')).toBe(data.error1.state);
                expect(geolocation.get('statusText')).toBe(MSG.ERROR_GEOLOCATION[data.unableToDefineLocation.code]);
            });

            it('The browser timed out while retrieving your location', function() {
                geolocation.unableDefineCurLocation(data.geolocationTimeout);
                expect(geolocation.get('state')).toBe(data.error1.state);
                expect(geolocation.get('statusText')).toBe(MSG.ERROR_GEOLOCATION[data.geolocationTimeout.code]);
            });

            it('Unknown error', function() {
                geolocation.unableDefineCurLocation({});
                expect(geolocation.get('state')).toBe(data.error1.state);
                expect(geolocation.get('statusText')).toBe(MSG.ERROR_GEOLOCATION[0]);
            });
        });

        it('getDefaultCurrentLoc()', function() {
            expect(geolocation.getDefaultCurrentLoc()).toEqual({
                latitude: App.SettingsDirectory.default_location.lat,
                longitude: App.SettingsDirectory.default_location.lon
            });
        });

        it('isGeolocationAPIAvailable()', function() {
            expect(geolocation.isGeolocationAPIAvailable()).toBe('geolocation' in window.navigator);
        });
    });
});