define(['stores', 'geopoint'], function() {
    
    describe('Deployr server locations request', function() {        

        var result, error, config = {};
        
        //https://deployr.revelup.com/api/locations.json?latitude=56.39924440821561&longitude=43.9347563024139&distance=40.170164218145345
        cfg1 = {  serverUrl: "https://deployr.revelup.com/api/locations.json",
                  data: {
                        "latitude": 56.3992,
                        "longitude": 43.9347,
                        "distance": 40.1701
                  }
               };
        cfg2 = { serverUrl: "https://deployr.revelup.com/api/locations.json",
                    data: {
                        "latitude": 56.3992,
                        "longitude": 43.9347,
                        "distance": 0
                    }
               };        

        beforeEach( function(done) {
            spyOn(App.Data.errors, "alert").and.callFake(function() { console.log(arguments); });
            
            reqRes = undefined;
            reqError = false;        
            $.ajax({
                type: "GET",
                url: config.serverUrl,
                data: config.data,
                dataType: "json",
                xhrFields : {
                    withCredentials: true
                },
                beforeSend: function(xhr, settings) {
                    xhr.setRequestHeader("Authorization", "Basic ZGVwbG95cjp0cm9zaHJ1aWs2");
                },
                success: function( data ) {
                    reqRes = data;
                    done();
                },
                error: function( xhr ) {
                    trace( "Deployr server locations error:", xhr );
                    reqError = true;
                    done();               
                }
            });
        });

        describe('General request to Deployr server', function() {
            config = cfg1;

            it('Request return data should be specified', function() {
                expect(reqRes).toBeDefined();
                expect(reqError).toBe(false);
            });
        });

        describe('Request for locations not existed', function() {
            config = cfg2;

            it('Request should complete with empty array and 200 status', function() {
                expect(!isArray(reqRes)).toBe(true);
                expect(reqRes.length).toBe(0);
                expect(reqError).toBe(false);
            });
        });
    });
  
 });