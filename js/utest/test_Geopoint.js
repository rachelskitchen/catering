define(['geopoint'], function() {
    describe('GeoPoint', function() {
        it("Environment", function() {
            expect(GeoPoint).toBeDefined();
        });
        
        // Creation TEST
        describe("Create GeoPoint", function() {
            
            it('Create with latitude and longitude = 10', function() {
                var geo = new GeoPoint(10, 10);
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 10, lon: 10});
            });
            
            it('Create with empty arguments', function() {
                var geo = new GeoPoint();
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 0, lon: 0});
            });
            
            it('Create with incorrect String', function() {
                var geo = new GeoPoint('test1', 'test2');
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 0, lon: 0});
            });
            
            it('Create with incorrect Coordinates1 91, -182', function() {
                var geo = new GeoPoint(91, -182);
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 0, lon: 0});
            });
            
            it('Create with incorrect Coordinates1 -91, 182', function() {
                var geo = new GeoPoint(-91, 182);
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 0, lon: 0});
            });
        });
        
        // Set TEST
        describe("Geopoint Function setPosition. Set Coordinates", function() {
            
            var geo;
            
            beforeEach(function() {
                geo = new GeoPoint(10, 10);
            });
            
            it('Set latitude and longitude = 15', function() {
                geo.setPosition(15, 15);
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 15, lon: 15});
            });
            
            it('Set empty', function() {
                geo.setPosition();
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 10, lon: 10});
            });
            
            it('Set incorrect String', function() {
                geo.setPosition('test1', 'test2');
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 10, lon: 10});
            });
            
            it('Set incorrect Coordinates1 91, -182', function() {
                geo.setPosition(91, -182);
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 10, lon: 10});
            });
            
            it('Set incorrect Coordinates2 -91, 18', function() {
                geo.setPosition(-91, 182);
                expect({lat: geo.lat, lon: geo.lon}).toEqual({lat: 10, lon: 10}, '2' );
            });
        });
        
        it("Geopoint Function _deg2rad.", function() {
            var geo = new GeoPoint(10, 10);
            expect(geo._deg2rad(120).toFixed(3)).toBe('2.094'); // '120 degrees is 2.094'
        });
        
        describe("Geopoint Function getDistanceKm / getDistanceMi. Get distance", function() {
            
            var geo;
            
            beforeEach(function() {
                geo = new GeoPoint(55.75, 37.6167);
            });
            
            it('Get distance kilometers with one Number argument', function() {
                expect(geo.getDistanceKm(45.35)).toBe(0);
            });
            
            it('Get distance kilometers with incorrect arguments type', function() {
                expect(geo.getDistanceKm('59.883', 30.25)).toBe(0);
            });
            
            it('Get distance kilometers between Moscow and SPb (633.184 km). Arguments as number', function() {
                expect(Math.floor(geo.getDistanceKm(59.883, 30.25))).toBe(633);
            });
            
            it('Get distance kilometers long. Distance between Moscow and SPb is 633.184 km', function() {
                var geo2 = new GeoPoint(59.883, 30.25);
                expect(Math.floor(geo.getDistanceKm(geo2))).toBe(633);
            });
            
            it('Get distance kilometers short. Distance between two street in NN', function() {
                var geo2 = new GeoPoint(56.326865, 44.00581);
                geo = new GeoPoint(56.318869, 44.055334);
                expect(geo.getDistanceKm(geo2).toFixed(2)).toBe('3.18');   
            });
            
            it('Get distance miles with one Number argument', function() {
                expect(geo.getDistanceMi(45.35)).toBe(0, '' );
            });
            
            it('Get distance miles with incorrect arguments type', function() {
                expect(geo.getDistanceMi('59.883', 30.25)).toBe(0, '' );
            });
            
            it('Get distance miles between Moscow and SPb (633.184 km). Arguments as number', function() {
                expect(Math.floor(geo.getDistanceMi(59.883, 30.25))).toBe(393);
            });
            
            it('Get distance miles long. Distance between Moscow and SPb is 393 mi', function() {
                var geo2 = new GeoPoint(59.883, 30.25);
                expect(Math.floor(geo.getDistanceMi(geo2))).toBe(393);
            });
            
            it('Get distance miles short. Distance between two street in NN', function() {
                var geo2 = new GeoPoint(56.326865, 44.00581);
                geo = new GeoPoint(56.318869, 44.055334);
                expect(geo.getDistanceMi(geo2).toFixed(2)).toBe('1.98');            
            });
        });
        
    });
});