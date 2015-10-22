define(['orders'], function() {
    describe("App.Models.Order", function() {
        var def, model;
            
        beforeEach(function() {
            model = new App.Models.Order();
            def = {
                created_date: null,
                final_total: null,
                id: null,
                pickup_time: null,
                subtotal: null,
                tax: null,
                closed: null,
                tip: null,
                dining_option: null,
                customer: null,
                prevailing_surcharge: null,
                prevailing_tax: null,
                tax_country: null,
                surcharge: null
            };
        });
        
        it('Environment', function() {
            expect(App.Models.Order).toBeDefined();
        });
        
        it('Create default App.Models.Order', function() {
            expect(model.get('myorder').__proto__).toBe(App.Collections.Myorders.prototype);
            expect(model.get('myorder').length).toBe(0);
            model.unset('myorder');
            expect(model.toJSON()).toEqual(def);
        });
        
        describe('Function repeat_order', function() {
            var changes,
                myorder = new App.Collections.Myorders();
            
            beforeEach(function() {
                changes = '';
                spyOn(App.Collections.Myorders.prototype, 'clone').and.returnValue(myorder);
                spyOn(App.Collections.Myorders.prototype, 'check_repeat').and.callFake(function() {
                    return changes;
                });
                this.myorder = App.Data.myorder;
                App.Data.myorder = {
                    repeat_order: function() {},
                    trigger: function() {}
                };
                spyOn(App.Data.myorder, 'trigger');
                spyOn(App.Data.myorder, 'repeat_order');
            });
            
            afterEach(function() {
                
            });
            
            it('no changes', function() {
                model.repeat_order();
                expect(App.Collections.Myorders.prototype.clone).toHaveBeenCalled();
                expect(App.Collections.Myorders.prototype.check_repeat).toHaveBeenCalled();
                expect(App.Data.myorder.repeat_order).toHaveBeenCalledWith(myorder);
                expect(App.Data.myorder.trigger).not.toHaveBeenCalled();
            });
            
            it('with changes', function() {
                changes = 'changed';
                model.repeat_order();
                expect(App.Collections.Myorders.prototype.clone).toHaveBeenCalled();
                expect(App.Collections.Myorders.prototype.check_repeat).toHaveBeenCalled();
                expect(App.Data.myorder.repeat_order).toHaveBeenCalledWith(myorder);
                expect(App.Data.myorder.trigger).toHaveBeenCalledWith('items_changed');
            });
        });
    });
    
    describe("App.Collections.Orders", function() {
        var model, orders, ex, exLoad;

        $.ajax({
            type: "GET",
            url: "js/utest/data/Orders.json",
            dataType: "json",
            async: false,
            success: function(data) {
                orders = data;
            }
        });
        
            
        beforeEach(function() {
            model = new App.Collections.Orders();
            ex = deepClone(orders.ex);
            exLoad = deepClone(orders.exLoad);
        });
        
        it('Environment', function() {
            expect(App.Collections.Orders).toBeDefined();
        });
        
        it('Create default App.Collections.Orders', function() {
            expect(model.toJSON()).toEqual([]);
        });
        
        it('comparator', function() {
            model.set(ex);
            expect(model.at(0).id).toBe(ex[1].id);
            expect(model.at(1).id).toBe(ex[0].id);
        });
        
        it('Function get_recent_orders', function() {
            var arg,
                ajaxStub = function() {
                    arg = arguments;
                };
            
            spyOn($,'ajax').and.callFake(ajaxStub);
            var customer = spyOn(App.Models, 'Customer'),
                add = spyOn(model, 'add');
            model.get_recent_orders();
            
            arg[0].successResp(ex);
            expect(add.calls.count()).toBe(2);
            
            expect(customer.calls.argsFor(0)[0]).toEqual(exLoad[0].customer);
            expect(customer.calls.argsFor(1)[0]).toEqual(exLoad[1].customer);
            
            delete exLoad[0].customer;
            delete exLoad[1].customer;
            var ans = add.calls.argsFor(0)[0];
            delete ans.customer;
            expect(ans).toEqual(exLoad[0]);
        });
        
        describe('Function get_additional_information ', function() {
            
            var arg, js,
                ajaxStub = function() {
                    arg = arguments;
                },
                addJSONStub = function() {
                    js = arguments;
                },
                obj = {
                    get: function() {}
                },
                objDeep = {
                    total: {
                        set: function() {}
                    },
                    checkout: {
                        set: function() {},
                        trigger: function() {}
                    },
                    addJSON: function() {}
                },
                additional1,
                additional2,
                additional1ready,
                additionalAll;
            
            beforeEach(function() {
                additional1 = deepClone(orders.additional1),
                additional2 = deepClone(orders.additional2),
                additional1ready = deepClone(orders.additional1ready);
                additionalAll = deepClone(orders.additionalAll);
                spyOn($,'ajax').and.callFake(ajaxStub);
                spyOn(model,'get').and.returnValue(obj);
                spyOn(obj, 'get').and.callFake(function(value) {
                    if (value === 'myorder') {
                        return objDeep;
                    } else {
                        return value + '!';
                    }
                });
                spyOn(objDeep.checkout, 'set');
                spyOn(objDeep, 'addJSON');
                spyOn(App.Models, "Total");
            });
            
            it('Check, that we get old information from correct model ', function() {
                model.get_additional_information(123);
                arg[0].successResp([]);

                expect(model.get).toHaveBeenCalledWith(123);
            });
            
            it('Check checkuot and total model updated correct', function() {
                model.get_additional_information(123);
                arg[0].successResp(additionalAll);
            
                expect(objDeep.checkout.set).toHaveBeenCalledWith('dining_option', 'dining_option!');
                expect(App.Models.Total).toHaveBeenCalledWith({
                    prevailing_surcharge: 'prevailing_surcharge!',
                    tax_country: 'tax_country!',
                    prevailing_tax: 'prevailing_tax!'
                });
            });
        });
        
        it('Function repeat_order', function() {
            model.add({id: 58});
            model.add({id: 59});
            spyOn(App.Models.Order.prototype, 'repeat_order');
            model.repeat_order(59);
            expect(model.get({id: 59}).repeat_order).toHaveBeenCalled();
        });
        
        
    });   
});