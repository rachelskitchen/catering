define(['total'], function() {
    
    describe('App.Models.Total', function() {
        
        var model, def, def2, ex,
            fakeTip = function() {
                return {
                    get_tip: function() {
                        return 10.005;
                    },
                    loadTip: function() {
                    },
                    saveTip: function() {
                    }
                };
            };
        
        beforeEach(function() {
            this.prevailing_surcharge = App.Data.settings.get('settings_system').prevailing_surcharge;
            App.Data.settings.get('settings_system').prevailing_surcharge = 8;
            this.prevailing_tax = App.Data.settings.get('settings_system').prevailing_tax;
            App.Data.settings.get('settings_system').prevailing_tax = 10;
            this.auto_bag_charge = App.Data.settings.get('settings_system').auto_bag_charge;
            App.Data.settings.get('settings_system').auto_bag_charge = 1;
            this.tax_country = App.Data.settings.get('settings_system').tax_country;
            App.Data.settings.get('settings_system').tax_country = 'usa';
            
            spyOn(App.Models, 'Tip').and.callFake(fakeTip);
            
            model = new App.Models.Total();
            def = {
                total: 0,
                tax: 0,
                surcharge: 0,
                bag_charge: 1,
                prevailing_surcharge: 8,
                prevailing_tax: 10,
                tax_country: 'usa'
            }, 
            def2 = {
                total: 0,
                tax: 0,
                surcharge: 0,
                bag_charge: 8,
                prevailing_surcharge: 10,
                prevailing_tax: 20,
                tax_country: 'ua'
            },
            ex = {
                total: 90.154,
                tax: 15.234,
                surcharge: 16.257
            };
        });
        
        afterEach(function() {
            App.Data.settings.get('settings_system').prevailing_surcharge = this.prevailing_surcharge;
            App.Data.settings.get('settings_system').prevailing_tax = this.prevailing_tax;
            App.Data.settings.get('settings_system').auto_bag_charge = this.auto_bag_charge;
            App.Data.settings.get('settings_system').tax_country = this.tax_country;
        });        
        
        it('Environment', function() {
            expect(App.Models.Total).toBeDefined();
        });

        it('Create model', function() {
            expect(App.Models.Tip).toHaveBeenCalled();
            model.unset('tip');
            expect(model.get('delivery') instanceof App.Models.Delivery).toBe(true);
            model.unset('delivery');
            expect(model.toJSON()).toEqual(def);
        });
        

        it('Create model in repeat order. tax country, prevailing_surcharge or prevailing_tax as options', function() {
            var obj = {
                    bag_charge: 8,
                    prevailing_surcharge: 10,
                    tax_country: 'ua',
                    prevailing_tax: 20,
                    delivery_item: {
                        test: 'test'
                    }
                },
                obj_clone = deepClone(obj);

            model = new App.Models.Total(obj_clone);
            expect(App.Models.Tip).toHaveBeenCalled();
            model.unset('tip');
            expect(model.get('delivery').get('test')).toBe('test');
            model.unset('delivery');
            expect(model.toJSON()).toEqual(def2);
        });
        
        
        it('Function get_total', function() {
            model.set(ex);
            expect(model.get_total()).toBe('90.15');
        });
        
        it('Function get_tax', function() {
            model.set(ex);
            expect(model.get_tax()).toBe('15.23');
        });
        
        it('Function get_surcharge', function() {
            model.set(ex);
            expect(model.get_surcharge()).toBe('16.26');
        });
        
        it('Function get_subtotal', function() {
            model.set(ex);
            expect(model.get_subtotal()).toBe('121.64');

            spyOn(App.TaxCodes, 'is_tax_included').and.returnValue(true);
            expect(model.get_subtotal()).toBe('90.15');
        });
        
        it('Function get_tip', function() {
            model.set(ex);
            expect(model.get_tip()).toBe('10.01');
        });
        
        it('Function get_grand', function() {
            model.set(ex);
            expect(model.get_grand()).toBe('131.65');
        });
        
        it('Function get_delivery_charge', function() {
            model.set(ex);
            var delivery = model.get('delivery');
            delivery.set({enable: true, charge: 5});
            expect(model.get_delivery_charge()).toBe('5.00');
            
            delivery.set({enable: false});
            expect(model.get_delivery_charge()).toBe('0.00');            
        });
        
        it('Function get_bag_charge', function() {
            model.set('bag_charge', 12.345);
            expect(model.get_bag_charge()).toBe('12.35');
        });
        
        it('Function get_remaining_delivery_amount', function() {
            model.set(ex);
            delivery.enable = true;
            delivery.charge = 5;
            delivery.min_amount = 150;
            expect(model.get_remaining_delivery_amount()).toBe('64.85');
            
            delivery.min_amount = 1;
            expect(model.get_remaining_delivery_amount()).toBe('0.00');
            
            delivery.enable = false;
            expect(model.get_remaining_delivery_amount()).toBeNull();
        });
        
        it('Function empty', function() {
            var tip = model.get('tip');
            model.set({
                tax: 10,
                total: 10,
                surcharge: 10
            });
            model.empty();
            expect(model.get('tip')).not.toBe(tip);
            expect(model.get('tax')).toBe(0);
            expect(model.get('total')).toBe(0);
            expect(model.get('surcharge')).toBe(0);
        });

        it('Function saveTotal', function() {
            spyOn(model.get('tip'), 'saveTip');
            model.saveTotal();
            expect(model.get('tip').saveTip).toHaveBeenCalled();
        });

        it('Function loadTotal', function() {
            spyOn(model.get('tip'), 'loadTip');
            model.loadTotal();
            expect(model.get('tip').loadTip).toHaveBeenCalled();
        });
        
        it('Function get_all', function() {
            spyOn(App.TaxCodes, 'is_tax_included').and.returnValue(false);
            model.set({
                tax: 10,
                total: 11,
                surcharge: 12
            });
            spyOn(model.get('tip'), 'get_tip').and.returnValue(9);
            expect(model.get_all()).toEqual({
                final_total: 33,
                surcharge: 12,
                subtotal: 11,
                tax: 10,
                tip: 9
            });
        });
    });
});