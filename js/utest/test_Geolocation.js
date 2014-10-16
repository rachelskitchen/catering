define(['geolocation'], function() {
    
    describe('App.Models.Geolocation', function() {
        var nul, successCoord, error1Coord, error2Coord, errorNOAPICoord;

        beforeEach(function() {
           nul = {
                state: "init",
                statusText: "Obtaining current location...",
                current_loc: null                    
            }, successCoord = {
                state: "complete-success",
                statusText: "Obtaining current location...",
                current_loc: {
                    latitude: 45,
                    longitude: 56
                }                     
            }, error1Coord = {
                state: "complete-error",
                statusText: "Your current location retrieval is disallowed. Reset location settings if you want to allow it.",
                current_loc: null                     
            }, error2Coord = {
                state: "complete-error",
                statusText: "There was an error while retrieving your location.",
                current_loc: null                     
            }, errorNOAPICoord = {
                state: "error-noapi",
                statusText: "Geolocation API is not supported in your browser.",
                current_loc: null                     
            };
       });
       
       it('Environment', function() {
           expect(App.Models.Geolocation).toBeDefined();
       });
       
       it('Construct Empty App.Models.Geolocation', function() {
            var geolocation = new App.Models.Geolocation();
            expect(geolocation.toJSON()).toEqual(nul);
       });
    
        // App.Models.Geolocation function detect_current_location
        describe( "App.Models.Geolocation Function detect_current_location", function() {
            var success, error,
                geoloc = function(succ, err) { 
                    success = succ;
                    error = err;
                },
                coord = {
                   coords: {
                       latitude: 45,
                       longitude: 56
                   } 
                }, geolocation, dfd;
                
            beforeEach(function() {    
                spyOn(navigator.geolocation, "getCurrentPosition").and.callFake(geoloc);
                this.settgins = App.Data.settings;
                App.Data.settings = { get : function() {} };
                geolocation = new App.Models.Geolocation();
            });
            
            afterEach(function() {
                App.Data.settings = this.settgins;
            });
                
            it('Default location detect', function() {    
                dfd = geolocation.detect_current_location();
                expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();//.called,'navigator.geolocation.getCurrentPosition called');
                expect(dfd.state()).toBe('pending');
                success(coord);
                expect(dfd.state()).toBe('resolved');
                expect(geolocation.toJSON()).toEqual(successCoord);
            });

            it('Detection error. Understandable error', function() {
                dfd = geolocation.detect_current_location();
                error({ code: 1});
                expect(geolocation.toJSON()).toEqual(error1Coord);
            });

            it('Detection error. Unknown error', function() {
                dfd = geolocation.detect_current_location();
                error({ code: 'Unknown error'});
                expect(dfd.state()).toBe('resolved');
                expect(geolocation.toJSON()).toEqual(error2Coord);
            });

            // it('No geolocation api', function() {
            //     var nav = window.navigator;
            //     window.navigator = false;
            //     dfd = geolocation.detect_current_location();
            //     expect(dfd.state()).toBe('resolved');
            //     expect(geolocation.toJSON()).toEqual(errorNOAPICoord);
            //     window.navigator = nav;
            // });

        }); 
    });
});