define(['products'], function() {

    var products;

    $.ajax({
        type: "GET",
        url: "js/utest/data_e2e/Products.json",
        dataType: "json",
        async: false,
        success: function(data) {
            products = data;
        }
    });

    describe("App.Models.Product. Get children for products. /weborders/attributes/?product=", function() {

        var model,
            argBefore,
            argAfter,
            addChild,
            response;

        beforeEach(function() {
            model = new App.Models.Product();
            model.set({
                attribute_type: 1,
                id: 1011
            });

            this.beforeSend = $.ajaxSetup().beforeSend;
            this.dataFilter = $.ajaxSetup().dataFilter;
            $.ajaxSetup({
               beforeSend: function() {
                   argBefore = arguments;
               },
               dataFilter: function(data, type) {
                    argAfter = arguments;
                    return data;
               }
            });

            addChild = spyOn(App.Collections.ChildProducts.prototype, 'add_child').and.returnValue(new App.Models.ChildProduct);

        });

        afterEach(function() {
            this.beforeSend = $.ajaxSetup().beforeSend;
            this.dataFilter = $.ajaxSetup().dataFilter;
            $.ajaxSetup({
               beforeSend: this.beforeSend,
               dataFilter: this.dataFilter
            });
        });

        it('Environment', function() {
            expect(App.Models.Product).toBeDefined();
        });

        describe('Product 1011 - T-Shirt main. Color Picture.',function() {
            var fetcher, status;

            beforeEach(function(done) {
                fetcher = fetcher || model.get_child_products();
                fetcher.then(function() {
                    response = JSON.parse(argAfter[0]).data;
                    status =  JSON.parse(argAfter[0]).status;
                    done();
                });
            });

            it('Check children ids', function() {
                var ids = response.map(function(el) {
                        return el.product.id;
                    });

                expect(status).toEqual("OK");
                expect(ids.sort()).toEqual(products.children_ids);
            });

            it('Check children 1012 - T-Short Red Home Slim', function() {
                var prod = response.filter(function(el) {
                    return el.product.id === 1012;
                })[0];

                expect(prod.attributes.attribute_value_1_name).toBe(products.t_shirt_child.attributes.attribute_value_1_name);
                expect(prod.attributes.attribute_value_2_name).toBe(products.t_shirt_child.attributes.attribute_value_2_name);
                expect(prod.product).toBeDefined();
                expect(prod.modifiers).toBeDefined();
            });
        });

        describe('Product 1022 - T-Shirt main-3. Color Color.',function() {
            var fetcher, status;

            beforeEach(function(done) {
                model.set('id', 1022);
                fetcher = fetcher || model.get_child_products();
                fetcher.then(function() {
                    status = JSON.parse(argAfter[0]).status;
                    response = JSON.parse(argAfter[0]).data;
                    done();
                });
            });

            it('Check attributes 1024 - T-Shirt main-3 Yellow empty', function() {
                var prod = response.filter(function(el) {
                    return el.product.id === 1024;
                })[0];
                
                expect(status).toEqual("OK");
                expect(prod).toBeUndefined();
            });

            it('Check not return product with incorrect attributes. 1306 - T-Shirt main-3. Red Animal', function() {
                var prod = response.filter(function(el) {
                    return el.product.id === 1306;
                })[0];

                expect(prod).toBeUndefined();
            });

            it('Check not return product with inactive attribute. 1307 - T-Shirt main-3. Red Green', function() {
                var prod = response.filter(function(el) {
                    return el.product.id === 1307;
                })[0];

                expect(prod).toBeUndefined();
            });
        });
    });

    describe("App.Collections.Products. Get products from category T-Shirt. /weborders/products/?category=176&establishment=18", function() {

        var model,
            argBefore,
            dataAfter,
            response,
            fetcher, status;

        beforeEach(function(done) {
            model = new App.Collections.Products();
            this.beforeSend = $.ajaxSetup().beforeSend;
            this.dataFilter = $.ajaxSetup().dataFilter;
            $.ajaxSetup({
               beforeSend: function() {
                  argBefore = arguments;
               },
               success: function(data) {
                   dataAfter = data;
                   this.successResp(data.data);
               }             
            });
        
            fetcher = fetcher || model.get_products(176);
            fetcher.then(function() {
                status = dataAfter.status;
                response = dataAfter.data;
                done();
            });

            spyOn(App.Models.Product.prototype, 'create').and.returnValue(new App.Models.Product);
        });

        afterEach(function() {
            $.ajaxSetup({
               beforeSend: this.beforeSend,
               dataFilter: this.dataFilter
            });
        });

        it('Environment', function() {
            expect(App.Collections.Products).toBeDefined();
        });

        it('Check ids', function() {
            var ids = response.map(function(el) {
                    return el.id;
                });

            expect(status).toEqual("OK");
            
            //TODO: use ids instead of common_elems after Bug 11510 "child products are returned by /products/?category=xx request" will be resolved. 
            var common_elems = _.intersection(ids, products.product_ids);
            expect(common_elems).toEqual(products.product_ids);
        });

        it('Check product 1011 - T-Shirt main', function() {
            var prod = response.filter(function(el) {
                return el.id === 1011;
            })[0];

            expect(prod).toEqual(products.t_shirt_main);
        });

        it('Check attributes enabled 1018 - T-Shirt main-2. One attribute', function() {
            var prod = response.filter(function(el) {
                return el.id === 1018;
            })[0];

            expect(prod.attribute_1_enable).toEqual(true);
            expect(prod.attribute_2_enable).toBeUndefined();
        });
    });

});