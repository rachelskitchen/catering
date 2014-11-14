define(['stores', 'geopoint'], function() {
    
    describe('Server /locations/ request for Directory single client mode', function() {        

        var reqRes, reqError;
        describe('General request, brand = MLB', function() {

            var store, reqDone = false;
            beforeEach( function(done) {
                spyOn(App.Data.errors, "alert").and.callFake(function() { console.log(arguments); });
           
            var config = {
                    serverUrl:  App.Data.settings.get("host") + "/weborders/locations/",
                    //serverUrl: "js/utest/data_e2e/Locations.json",
                    brandName: "MLB"
                }

                if (reqDone) {
                   done();  
                   return; 
                }
                reqDone = true;
                reqRes = undefined;
                reqError = false;        
                $.ajax({
                    type: "GET",
                    url: config.serverUrl,
                    data: { 
                        "brand": config.brandName,
                    },
                    dataType: "json",
                    success: function( data ) {
                        reqRes = data;
                        try {
                            store = reqRes[0]["estabs"][0];
                            store2 = reqRes[0]["estabs"][1]; 
                        } catch(e) {

                        }     
                        done();
                    },
                    error: function( xhr ) {
                        trace( "Server Locations Request Error:", xhr.statusText );
                        reqError = true;
                        done();               
                    }
                });
            });
            
            it('Request return data should be specified', function() {
                expect(reqRes).toBeDefined();
                expect(reqError).toBe(false);
            });

            it('Request data should be json Array', function() {
                expect($.isArray(reqRes)).toBe(true);
            });
            
            it('The top level array should contain only one element', function() {
                expect(reqRes.length).toBe(1);
            });

            it('The first element of array should be object', function() {
                expect(typeof reqRes[0]).toEqual('object');
            });

            it('Check first element, data[0]["estabs"] prop is Array', function() {
                expect($.isArray(reqRes[0]["estabs"]) ).toBe(true);
            });

            it('The number of stores should be 2 or more', function() {
                expect(reqRes[0]["estabs"].length).toBeGreaterThan(1);
            });

            it('The store element should be object', function() {
                expect(typeof store).toEqual('object');
            });

            it('The second store element should be object', function() {
                expect(typeof store).toEqual('object');
            });

            it('data[0]["estabs"][1].name should be a none empty string', function() {
                expect(typeof store.name).toBe("string");
                expect(store.name.length).toBeGreaterThan(0);
            });

            it('data[0]["estabs"][1].id should be a number', function() {
                expect(typeof store.id).toBe("number");
            });           
            
            it('data[0]["estabs"][0] check other props for that store', function() {
                //trace("STORE = ", store );
                expect(typeof store.province).toBe("string");
                expect(typeof store.line_1).toBe("string");
                expect(store.line_1.length).toBeGreaterThan(0);
                expect(typeof store.line_2).toBe("string");
                
                expect(typeof store.city_name).toBe("string");
                expect(store.city_name.length).toBeGreaterThan(0);
                
                expect(typeof store.country).toBe("string");
                expect(store.country.length).toBeGreaterThan(0);
                
                expect(typeof store.zipcode).toBe("string");
                expect(store.zipcode.length).toBeGreaterThan(0);
                
                expect(typeof store.type).toBe("string");
                expect(store.type.length).toBeGreaterThan(0);
                
                expect(typeof store.longitude).toBe("number");
                expect(typeof store.latitude).toBe("number");
                expect(typeof store.state).toBeDefined();
                expect(typeof store.logo_url).toBe("string");
            });

            it('The second store element should be object', function() {
                expect(typeof store2).toEqual('object');
            });

            it('data[0]["estabs"][1].name should be a none empty string', function() {
                expect(typeof store2.name).toBe("string");
                expect(store2.name.length).toBeGreaterThan(0);
            });

            it('data[0]["estabs"][1].id should be a number', function() {
                expect(typeof store2.id).toBe("number");
            });

            it('data[0]["estabs"][1].province should be a string', function() {
                expect(typeof store2.province).toBe("string");
            });

            it('data[0]["estabs"][1].line_1 should be a non empty string', function() {
                expect(typeof store2.line_1).toBe("string");
                expect(store2.line_1.length).toBeGreaterThan(0);
            });

            it('data[0]["estabs"][1].line_2 should be a string', function() {
                expect(typeof store2.line_2).toBe("string");
            });

            it('data[0]["estabs"][1].city_name should be a non empty string', function() {
                expect(typeof store2.city_name).toBe("string");
                expect(store2.city_name.length).toBeGreaterThan(0);
            });
            
            it('data[0]["estabs"][1].country should be a non empty string', function() {
                expect(typeof store2.country).toBe("string");
                expect(store2.country.length).toBeGreaterThan(0);
            });

            it('data[0]["estabs"][1].zipcode should be a non empty string', function() {
                expect(typeof store2.zipcode).toBe("string");
                expect(store2.zipcode.length).toBeGreaterThan(0);
            });

            it('data[0]["estabs"][1].type should be a non empty string', function() {
                expect(typeof store2.type).toBe("string");
                expect(store2.type.length).toBeGreaterThan(0);
            });

            it('data[0]["estabs"][1].longitude should be a number', function() {
                expect(typeof store2.longitude).toBe("number");
            });

            it('data[0]["estabs"][1].latitude should be a number', function() {
                expect(typeof store2.latitude).toBe("number");
            });

            it('data[0]["estabs"][1].state should be a defined', function() {
                expect(typeof store2.state).toBeDefined();
            });

            it('data[0]["estabs"][1].logo_url should be a string', function() {
                expect(typeof store2.logo_url).toBe("string");
            });         
        });

        describe('Request for brand not existed', function() {

            var reqDone = false;
            
            beforeEach( function(done) {
                spyOn(App.Data.errors, "alert").and.callFake(function() { console.log(arguments); });
           
            var config = {
                    serverUrl:  App.Data.settings.get("host") + "/weborders/locations/",
                    brandName: "MLB123None"
                }

                if (reqDone) {
                    done(); 
                    return; 
                }
                reqDone = true;
                reqRes = undefined;
                reqError = false;        
                $.ajax({
                    type: "GET",
                    url: config.serverUrl,
                    data: { 
                        "brand": config.brandName,
                    },
                    dataType: "json",
                    success: function( data ) {
                        reqRes = data;
                        done();
                    },
                    error: function( xhr ) {
                        trace( "Server Locations Request Error:", xhr.statusText );
                        reqError = true;
                        done();               
                    }
                });
            });
            
            it('Request should complete with empty array and 200 status', function() {
                expect($.isArray(reqRes)).toBe(true);
                expect(reqRes.length).toBe(0);
                expect(reqError).toBe(false);
            });
        });
    });
 });