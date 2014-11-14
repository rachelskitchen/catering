define(['stores', 'geopoint'], function() {
        
    describe('App.Models.Store', function() {
        
        var def, nul, local = {},
            get = function() { 
                return local.settings ? JSON.parse(local.settings) : undefined; 
            },
            set = function(e, s) {
                local.settings = s && s.toJSON && JSON.stringify(s.toJSON()) || e;
                return true;
            };
            
        beforeEach(function() {
            spyOn(window, "getData").and.callFake(get);
            spyOn(window, "setData").and.callFake(set);
            spyOn(App.Data.errors, "alert").and.callFake(function() { console.log(arguments); });
            def = {
                city_name: "Revel City",
                country: "US",
                distance: 2.41,
                dns: ["qa.revelup.com"],
                establishment_id: 203,
                id: "qa_203",
                kiosk_image_url: "skins/directory_mobile/img/skins/directory_mobile/img/none.png",
                latitude: 56.317284,
                line_1: "123 My Street",
                line_2: "line 2 street",
                logo_url: "skins/directory_mobile/img/skins/directory_mobile/img/none.png",
                longitude: 44.060508,
                name: "dkulemalin",
                province: "A province",
                skin: "weborder_mobile",
                state: "OR",
                type: "Quick Service",
                zipcode: "12345"
            },
            nul = {
                city_name: null,
                country: null,
                distance: null,
                dns: null,
                establishment_id: null,
                id: null,
                kiosk_image_url: null,
                latitude: null,
                line_1: null,
                line_2: null,
                logo_url: null,
                longitude: null,
                name: null,
                province: null,
                skin: "weborder_mobile",
                state: null,
                type: null,
                zipcode: null
            };
        });
            
        describe( "Environment", function() {
            it('App.Models.Store class should be included', function() {
                expect(App.Models.Store).toBeDefined()
            });
        });
        
        // App.Models.Store
        describe( "Create App.Models.Store", function() {
            
            it('Construct Empty Store model', function() {
                var store = new App.Models.Store();
                
                expect(store.toJSON()).toEqual(nul)
            });
            
            it('Construct Store model', function() {
                var store = new App.Models.Store(def);
                expect(store.toJSON()).toEqual(def)
            });
        });
        
        // App.Models.Store function runStoreApp
        describe( "App.Models.Store Function runStoreApp", function() {
            var path = window.location.origin + window.location.pathname,
                defCpy;

            beforeEach(function() {
                defCpy = _.clone(def);
                spyOn(App.Models.Store.prototype, "run").and.callFake(function(url) { return url; });
            });
            
            it('Redirect with Empty Store model', function() {
                App.Data.devMode = null;
                var store = new App.Models.Store();
                expect(store.runStoreApp()).toBe(path + "?skin=weborder_mobile");
            });
            
            it('Redirect with Empty Store model. Test devMode', function() {
                App.Data.devMode = true;
                var store = new App.Models.Store();
                expect(store.runStoreApp()).toBe(path + "?skin=weborder_mobile&dev=true");
            });
            
            it('Redirect with ordinary Store model', function() {
                App.Data.devMode = null;
                var store = new App.Models.Store(def);
                expect(store.runStoreApp()).toBe(path + "?skin=weborder_mobile&dns=qa.revelup.com&dns_establishment=203");
            });
            
            it('Redirect with dns as null', function() {
                defCpy.dns = null;
                var store = new App.Models.Store(defCpy);
                expect(store.runStoreApp()).toBe(path + "?skin=weborder_mobile&dns_establishment=203");
            });
            
            
            it('Redirect with dns, dns_establishment as null', function() {
                defCpy.dns = null;
                defCpy.establishment_id = null;
                var store = new App.Models.Store(defCpy);
                expect(store.runStoreApp()).toBe(path + "?skin=weborder_mobile");                
            });
            
            it('Redirect with dns, dns_establishment, skin as null', function() {
                defCpy.dns = null;
                defCpy.establishment_id = null;
                defCpy.skin = null;
                var store = new App.Models.Store(defCpy);
                expect(store.runStoreApp()).toBe(path + "?");            
            });            
            
            it('Redirect with dns as empty Array', function() {
                defCpy.dns = [];
                var store = new App.Models.Store(defCpy);
                expect(store.runStoreApp()).toBe(path + "?skin=weborder_mobile&dns_establishment=203");
            });
            
            it('Redirect with dns as Array with incorrect url', function() {
                defCpy.dns = ['incorrecturl'];
                var store = new App.Models.Store(defCpy);
                expect(store.runStoreApp()).toBe(path + "?skin=weborder_mobile&dns_establishment=203");
            });
            
        });        
        
        // App.Models.Store function filter
        describe( "App.Models.Store Function filter", function() {
            
            it('Empty filter in empty store', function() {
                var store = new App.Models.Store();
                expect(store.filter()).toBeFalsy();
            });
            
            it('Empty filter in default store', function() {
                var store = new App.Models.Store(def);
                expect(store.filter()).toBeFalsy();
            });
            
            it('Incorrect filter in default store', function() {
                var store = new App.Models.Store(def);
                expect(store.filter('asd')).toBeFalsy();
            });
            
            it('Empty array filter in empty store', function() {
                var store = new App.Models.Store();
                expect(store.filter([])).toBeFalsy();
            });
            
            it('Empty array filter in default store', function() {
                var store = new App.Models.Store(def);
                expect(store.filter([])).toBeFalsy();
            });
            
            it('Filled filter in empty store', function() {
                var store = new App.Models.Store();
                expect(store.filter([0, 2])).toBeFalsy();
            });
            
            it('Filled filter array without store type in default store', function() {
                var store = new App.Models.Store(def);
                expect(store.filter([2])).toBeFalsy();
                
            });
            
            it('Filled filter array with store type in default store', function() {
                var store = new App.Models.Store(def);
                expect(store.filter([0, 2])).toBeTruthy();
                
            });
            
            it('Filled filter array without OTHER type in default store with type TEST', function() {
                def.type = 'TEST';
                var store = new App.Models.Store(def);
                expect(store.filter([0, 2])).toBeFalsy();
            });
            
            it('Filled filter array with OTHER type in default store with type TEST', function() {
                def.type = 'TEST';
                var store = new App.Models.Store(def);
                expect(store.filter([3])).toBeTruthy();
                
            });
            
            it('Filled filter array with OTHER type in default store with type TEST and distance more then radius', function() {
                def.type = 'TEST';
                var store = new App.Models.Store(def);
                expect(store.filter([3], 2)).toBeFalsy();
            });
            
            it('Filled filter array with OTHER type in default store with type TEST and distance less then radius', function() {
                def.type = 'TEST';
                var store = new App.Models.Store(def);
                expect(store.filter([3], 3)).toBeTruthy();
            });
            
            it('Filled filter array with OTHER type, without radius in default store with type TEST and distance = TEST', function() {
                def.type = 'TEST';
                def.distance = 'TEST';
                var store = new App.Models.Store(def);
                expect(store.filter([3])).toBeFalsy();
            });
            
            it('Filled filter array with OTHER type, with radius in default store with type TEST and distance = TEST', function() {
                def.type = 'TEST';
                def.distance = 'TEST';
                var store = new App.Models.Store(def);
                expect(store.filter([3], 5)).toBeFalsy();
            });
        });
    });
                        
    describe('App.Collections.Stores', function() {

        var store_def, store_local_def, stores2, ADramark, PType, def_ID, def_name, def_name_asc, def,
            local = {},
            get = function() { 
                return local.settings ? JSON.parse(local.settings) : undefined; 
            },
            set = function(e, s) {
                local.settings = s && s.toJSON && JSON.stringify(s.toJSON()) || e;
                return true;
            };

        $.ajax({
            type: "GET",
            url: "js/utest/data/Stores.json",
            dataType: "json",
            async: false,
            success: function(data) {
                stores2 = data;
            }
        });

        beforeEach(function() {
            detect_location();
            spyOn(window, "getData").and.callFake(get);
            spyOn(window, "setData").and.callFake(set);

            set(undefined);

            def = {
                city_name: "Revel City",
                country: "US",
                distance: 2.41,
                dns: ["qa.revelup.com"],
                establishment_id: 203,
                id: "qa_203",
                kiosk_image_url: "skins/directory_mobile/img/skins/directory_mobile/img/none.png",
                latitude: 56.317284,
                line_1: "123 My Street",
                line_2: "line 2 street",
                logo_url: "skins/directory_mobile/img/skins/directory_mobile/img/none.png",
                longitude: 44.060508,
                name: "dkulemalin",
                province: "A province",
                skin: "weborder_mobile",
                state: "OR",
                type: "Quick Service",
                zipcode: "12345"
            },
            store_def = {
                latitude: 56.327852,
                length: 0,
                longitude: 44.000685,
                radius: 5,
                types: [0,2,3],
                sortStrategy: "sortNumbers",
                sortKey: "distance",
                sortOrder: "desc",
                mapCenterPos: null
            },store_local_def = {
                latitude: 56.327852,
                length: 0,
                longitude: 44.000685,
                radius: 2.5,
                types: [0,3],
                sortStrategy: "sortNumbers",
                sortKey: "distance",
                sortOrder: "desc",
                mapCenterPos: null
            }, ADramark = {
                province: "TEST",
                dns: "mlb-dev.revelup.com",
                distance: 0.73,
                establishment_id:  1,
                logo_url: App.Data.settings.get_img_default(), 
                name: "ADramark", 
                country: "RU", 
                zipcode: "603600-0001-0002", 
                longitude: 44.00050800000003, 
                latitude: 56.317284, 
                state: "CA", 
                city_name: "San Francisco", 
                kiosk_image_url: null, 
                line_1: "23 Rodionova St", 
                line_2: "4th Floor", 
                id: "mlb_dev_1",
                skin: "weborder_mobile",
                type: "Grocery"
            }, PType = {
                province: "", 
                line_1: "7-115, Verhnepechorskaya St", 
                kiosk_image_url: "", 
                city_name: "nizhny novgorod", 
                distance: 3.85,
                dns: "mlb-dev.revelup.com",
                establishment_id:  6,
                id: "mlb_dev_6",
                logo_url: App.Data.settings.get('img_path') + App.Data.settings.get("settings_skin").img_default, 
                name: "EvEgorov #1", 
                country: "RU", 
                zipcode: "603116", 
                longitude: 44.06827, 
                skin: "weborder_mobile",
                state: null, 
                latitude: 56.28669, 
                line_2: "4th Floor long long long long long", 
                type: "Grocery"
            }, def_ID = [
              "mlb_dev_7",
              "mlb_dev_6",
              "qa_203",
              "qaregressiontesting_29",
              "qa_244",
              "mlb_dev_11",
              "mlb_dev_10",
              "mlb_dev_1"
            ], def_name = [
                "mlb_dev_10",
                "mlb_dev_11",
                "qaregressiontesting_29",
                "mlb_dev_7",
                "mlb_dev_6",
                "qa_203",
                "qa_244",
                "mlb_dev_1"
            ];
        });

        describe( "Environment", function() {

            it('App.Models.Store class should be included', function() {
                expect(App.Models.Store).toBeDefined();
            });

            it('App.Collections.Stores class should be included', function() {
                expect(App.Collections.Stores).toBeDefined();
            });

            it('App.Data.geoloc model for current geolocation load', function() {
                expect(App.Data.geoloc).toBeDefined();
            });

            it('Geolocation detected', function() {
                expect(App.Data.geoloc.get_current_loc()).not.toBeNull();
            });

        });

        // App.Collections.Stores
        describe( "Create App.Collections.Stores", function() {
            
            var stores;
            
            it('Construct Empty Stores collection', function() {
                stores = new App.Collections.Stores();
                expect({
                    latitude: stores.latitude,
                    length: stores.length,
                    longitude: stores.longitude,
                    radius: stores.radius,
                    types: stores.types,
                    sortStrategy: stores.sortStrategy,
                    sortKey: stores.sortKey,
                    sortOrder: stores.sortOrder, 
                    mapCenterPos: stores.mapCenterPos
                }).toEqual(store_def);

            });

            it('Construct with collection with one store', function() {
                var store = new App.Models.Store(def);
                stores = new App.Collections.Stores(store);
                expect(stores.toJSON()).toEqual([def]);
            });

            it('Construct Empty Stores collection with localStorage data', function() {
                set('{"radius":2.5,"types":[0,3]}');
                stores = new App.Collections.Stores();

                expect({
                    latitude: stores.latitude,
                    length: stores.length,
                    longitude: stores.longitude,
                    radius: stores.radius,
                    types: stores.types,
                    sortStrategy: stores.sortStrategy,
                    sortKey: stores.sortKey,
                    sortOrder: stores.sortOrder, 
                    mapCenterPos: stores.mapCenterPos
                }).toEqual(store_local_def);                    
            });
        });
        
        describe('Function get_stores', function() {
             var arg, model,
                 MILE = 1.609344,
                 def;
             
             beforeEach(function() {
                 def = {
                    "latitude": 12,
                    "longitude": 13,
                    "radius": 14
                };
                 App.Data.brandName = undefined;
                 set('{"radius":2.5,"types":[0,3]}');
                 model = new App.Collections.Stores();
                 spyOn($, 'ajax').and.callFake(function() {
                    arg = arguments[0]; 
                 });
             });
             
             it('arguments logic (call with parameters)', function() {
                model.get_stores(13, 14, 15);
                expect(arg.data).toEqual({
                    latitude: 13,
                    longitude: 14,
                    distance: 15 * MILE
                });
             });
             
             it('arguments logic (call without parameters)', function() {
                model.latitude = def.latitude;
                model.longitude = def.longitude;
                model.radius = def.radius;
                model.get_stores();
                expect(arg.data).toEqual({
                    latitude: def.latitude,
                    longitude: def.longitude,
                    distance: def.radius * MILE
                });
             });
             
             it('from deployer', function() {
                 model.get_stores();
                 expect(arg.url.indexOf('deployr.revelup.com')).not.toBe(-1);
             });
             
             it('from local server', function() {
                 App.Data.brandName = 'brand';
                 model.get_stores();
                 expect(arg.url.indexOf(App.Data.settings.get("host"))).not.toBe(-1);
             });
        });


        // App.Collections.Stores function process_data_stores
        it( "App.Collections.Stores Function process_data_stores. Load stores.", function() {
            var stores = new App.Collections.Stores();
                
            expect(stores.process_data_stores(stores2)).toBeTruthy();
            expect(stores.length).toBe(8);
            expect(stores.get('mlb_dev_1')).toBeDefined();
            var store = stores.get('mlb_dev_1').toJSON();
            expect(store.name).toBe('ADramark');
            expect(store.dns).toBe(window.location.hostname);
            store.dns = ADramark.dns;
            expect(store).toEqual(ADramark);
        });

        // App.Collections.Stores function getFilteredStores
        describe( "App.Collections.Stores Function getFilteredStores. Filter stores.", function() {
            var stores;
            
            beforeEach(function() {
                set('{"radius":5,"types":[0,2,3]}');
                stores = new App.Collections.Stores();
                stores.process_data_stores(stores2);
            });

            it('Empty filter with 0 radius with all types', function() {
                stores.radius = 0;
                expect(array_toJSON(stores.getFilteredStores())).toEqual([]);
            });

            it('Empty filter with 1 radius with all types', function() {
                stores.radius = 1;
                expect(array_toJSON(stores.getFilteredStores()).map(function(el) { return el.id; })).toEqual(["mlb_dev_1"]);
            });

            it('Filter without radius and all types', function() {
                expect(array_toJSON(stores.getFilteredStores(false))).toEqual(array_toJSON(stores.models));
            });
            
            it('Filter with big radius and FT_GROCERY', function() {
                stores.types = [2];
                stores.radius = 5;
                expect(array_toID(stores.getFilteredStores()).indexOf("mlb_dev_6")).not.toBe(-1);
                expect(array_toID(stores.getFilteredStores()).indexOf("mlb_dev_1")).not.toBe(-1);
                expect(array_toID(stores.getFilteredStores()).indexOf("mlb_dev_7")).not.toBe(-1);
            });
            
            it('Filter with small radius and FT_GROCERY', function() {
                stores.types = [2];
                stores.radius = 1;
                expect(array_toJSON(stores.getFilteredStores()).map(function(el) { return el.id; })).toEqual(['mlb_dev_1']);
            });
            
            it('Filter without radius and FT_GROCERY', function() {
                stores.types = [2];
                stores.radius = 5;
                expect(array_toID(stores.getFilteredStores(false)).indexOf("mlb_dev_6")).not.toBe(-1);
                expect(array_toID(stores.getFilteredStores(false)).indexOf("mlb_dev_1")).not.toBe(-1);
                expect(array_toID(stores.getFilteredStores(false)).indexOf("mlb_dev_7")).not.toBe(-1);
            });
        });

        // App.Collections.Stores function setSettings
        describe( "App.Collections.Stores Function setSettings", function() { 
            var stores;
            
            beforeEach(function() {
                stores = new App.Collections.Stores();
                set(undefined);
            });

            it('Can to save settgins', function() {
                expect(stores.setSettings()).toBeTruthy();
            });

            it('Test default setting save', function() {
                stores.setSettings();
                expect(get()).toEqual({radius: 5, types: [0,2,3]});
            });            

            it('Test preset setting save', function() {
                stores.radius = 2.5;
                stores.types = [0,2];
                stores.setSettings();
                expect(get()).toEqual({radius: 2.5, types: [0,2]});
            });
        });

        // App.Collections.Stores function setRadius
        describe( "App.Collections.Stores Function setRadius", function() {
            
            var stores;
                    
            beforeEach(function() { 
                stores = new App.Collections.Stores();
            });

            it('Can not to set with empty arguments', function() {
                expect(stores.setRadius()).toBeFalsy();
            });
            
            it('Can to set with number arguments', function() {
                expect(stores.setRadius(2.5)).toBeTruthy();
            });
            
            it('Can not to set with not number arguments', function() {
                expect(stores.setRadius('2.5')).toBeFalsy();
            });

            
            it('Test set radius', function() {
                stores.setRadius(2.5);
                expect(get().radius).toBe(2.5);
            });

        });

        // App.Collections.Stores function setTypes
        describe( "App.Collections.Stores Function setTypes", function() {
            
            var stores;
                    
            beforeEach(function() { 
                stores = new App.Collections.Stores();
            });
            
            it('Can not to set with empty arguments', function() { 
                expect(stores.setTypes()).toBeFalsy();
            });
            
            it('Can to set with array arguments', function() { 
                expect(stores.setTypes([2])).toBeTruthy();
            });
            
            it('Can not to set with not array arguments', function() { 
                expect(stores.setTypes('2.5')).toBeFalsy();
            });
            
            it('Test set types', function() {
                stores.setTypes([2,3]);
                expect(get().types).toEqual([2, 3]);
            });
        });

        // App.Collections.Stores Sorting
        describe( "App.Collections.Stores Function sortEx. Sorting.", function() {
            
            var stores;
                    
            beforeEach(function() { 
                stores = new App.Collections.Stores();
            });

            it('Sort empty collections', function() {
                stores.sort();
                expect(array_toID(stores).length).toBe(0);
            });

            it('Sort default (distance, desc)', function() {
                stores.process_data_stores(stores2);
                stores.sort();
                expect(array_toID(stores)).toEqual(def_ID);
            });

            it('sortEx with empty argumetns', function() {
                stores.process_data_stores(stores2);
                stores.sortEx();        
                expect(array_toID(stores)).toEqual(def_ID);
            });

            it('sortEx with incorrect sortStrategy', function() {
                stores.process_data_stores(stores2);
                stores.sortEx('TEST');
                expect(array_toID(stores)).toEqual(def_ID);
            });

            it('sortEx with sortNumbers sortStrategy and incorrect sortKey', function() {
                stores.process_data_stores(stores2);
                stores.sortEx('sortNumbers', 'TEST');
                expect(array_toID(stores)).toEqual(def_ID);
            });

            it('sortEx with sortNumbers sortStrategy and incorrect sortKey for sortStrategy', function() {
                stores.process_data_stores(stores2);
                stores.sortEx('sortNumbers', 'city_name');
                expect(array_toID(stores)).toEqual(def_ID);
            });

            it('sortEx with sortStrings sortStrategy and name sortKey', function() {
                stores.process_data_stores(stores2);
                stores.sortEx('sortStrings', 'name');
                expect(array_toID(stores)).toEqual(def_name);
            });

            it('sortEx with sortStrings sortStrategy and name sortKey asc', function() {
                stores.process_data_stores(stores2);
                stores.sortOrder = 'asc';
                stores.sortEx('sortStrings', 'name');
                expect(array_toID(stores)).toEqual(def_name.reverse());
            });

            it('sortEx with sortStrings sortStrategy and distance sortKey', function() {
                stores.process_data_stores(stores2);
                stores.sortEx('sortStrings');
                expect(array_toID(stores)).toEqual(def_ID);
            });

        }); 

        // load current location
        function detect_location() {
            App.Data.geoloc = {
                get_current_loc : function() {
                    return {
                        latitude: 56.327852,
                        longitude: 44.000685
                    };
                }
            };
        }

        function array_toJSON(arr) {
            return arr && arr.map(function(el) { return el.toJSON(); });
        }

        function array_toID(arr) {
            return arr && arr.map(function(el) { return el.get('id'); });
        }
    });
});