define(['total', 'js/utest/data/Total'], function(total, data) {
    'use strict';

    describe('App.Models.Total', function() {
        var total, tip, delivery, systemSettings;

        beforeEach(function() {
            systemSettings = App.Settings;
            _.extend(App.Settings, data.SYSTEM_SETTINGS);
            total = new App.Models.Total();
            tip = total.get('tip');
            delivery = total.get('delivery');

            spyOn(window, 'round_monetary_currency');
        });

        afterEach(function() {
            App.Settings = systemSettings;
        });

        it('Environment', function() {
            expect(App.Models.Total).toBeDefined();
        });

        it('Create model', function() {
            var json = total.toJSON(),
                expData = _.extend({}, data.DEFAULTS, data.SYSTEM_SETTINGS, {
                    bag_charge: data.SYSTEM_SETTINGS.auto_bag_charge
                });

            delete json.tip;
            delete json.delivery;
            delete expData.tip;
            delete expData.delivery;
            delete expData.auto_bag_charge;

            expect(json).toEqual(expData);
            expect(tip instanceof App.Models.Tip).toBe(true);
            expect(delivery instanceof App.Models.Delivery).toBe(true);
        });

        describe('initialize(opts)', function() {
            var set, tip, delivery, delivery_item;

            beforeEach(function() {
                spyOn(total, 'unset');

                spyOn(total, 'set').and.callFake(function(data) {
                    set = data;
                    tip = data.tip;
                    delivery = data.delivery;
                    return Backbone.Model.prototype.set.apply(total, arguments);
                });

                spyOn(App.Models.Delivery.prototype, 'initialize').and.callFake(function(opts) {
                    delivery_item = opts;
                    return Backbone.Model.prototype.initialize.apply(delivery, arguments);
                });
            });

            it('opts is undefined', function() {
                total.initialize();
                commonCheck();
                expect(delivery_item).toEqual({});
            });

            it('opts is object, opts.delivery_item is undefined', function() {
                total.initialize({});
                commonCheck();
                expect(delivery_item).toEqual({});
            });

            it('opts is object, opts.delivery_item is object', function() {
                var opts = {delivery_item: {a:1, b:2}};
                total.initialize(opts);
                commonCheck();
                expect(delivery_item).toBe(opts.delivery_item);
            });

            function commonCheck() {
                var settings = data.SYSTEM_SETTINGS;
                expect(total.unset).toHaveBeenCalledWith('delivery_item');
                expect(total.set).toHaveBeenCalled();
                expect(set).toEqual({
                    bag_charge: settings.auto_bag_charge,
                    tax_country: settings.tax_country,
                    prevailing_surcharge: settings.prevailing_surcharge,
                    prevailing_tax: settings.prevailing_tax,
                    tip: tip,
                    delivery: delivery
                });
            }
        });

        it('get_subtotal()', function() {
            total.get_subtotal();
            expect(round_monetary_currency).toHaveBeenCalledWith(total.get('subtotal'));
        });

        it('get_tax()', function() {
            total.get_tax();
            expect(round_monetary_currency).toHaveBeenCalledWith(total.get('tax'));
        });

        it('get_surcharge()', function() {
            total.get_surcharge();
            expect(round_monetary_currency).toHaveBeenCalledWith(total.get('surcharge'));
        });

        describe('get_total()', function() {
            var tax = 12,
                subtotal = 45,
                surcharge = 18,
                taxIncluded;

            beforeEach(function() {
                taxIncluded = undefined;
                spyOn(total, 'get_tax').and.returnValue(tax);
                spyOn(total, 'get_subtotal').and.returnValue(subtotal);
                spyOn(total, 'get_surcharge').and.returnValue(surcharge);
                spyOn(App.TaxCodes, 'is_tax_included').and.callFake(function() {
                    return taxIncluded;
                });
            });

            it('tax is included', function() {
                taxIncluded = true;
                total.get_total();
                expect(round_monetary_currency).toHaveBeenCalledWith(subtotal);
                commnCheck();
            });

            it('tax is excluded', function() {
                taxIncluded = false;
                total.get_total();
                expect(round_monetary_currency).toHaveBeenCalledWith(subtotal + surcharge + tax);
                commnCheck();
            });

            function commnCheck() {
                expect(total.get_tax).toHaveBeenCalled();
                expect(total.get_subtotal).toHaveBeenCalled();
                expect(total.get_surcharge).toHaveBeenCalled();
                expect(App.TaxCodes.is_tax_included).toHaveBeenCalledWith(total.get('tax_country'));
            }
        });

        it('get_discounts_str()', function() {
            total.get_discounts_str();
            expect(round_monetary_currency).toHaveBeenCalledWith(total.get('discounts'));
        });

        it('get_tip()', function() {
            var subtotalValue = 50,
                tipValue = 12;

            spyOn(total, 'get_subtotal').and.callFake(function() {
                return subtotalValue;
            });

            spyOn(tip, 'get_tip').and.callFake(function() {
                return tipValue;
            });

            total.get_tip();

            expect(round_monetary_currency).toHaveBeenCalledWith(tipValue);
            expect(total.get_subtotal).toHaveBeenCalled();
            expect(tip.get_tip).toHaveBeenCalledWith(subtotalValue);
        });

        it('get_grand()', function() {
            var totalValue = 50,
                tipValue = 5;

            spyOn(total, 'get_total').and.callFake(function() {
                return totalValue;
            });

            spyOn(total, 'get_tip').and.callFake(function() {
                return tipValue;
            });

            total.get_grand();

            expect(round_monetary_currency).toHaveBeenCalledWith(totalValue + tipValue);
        });

        it('get_delivery_charge()', function() {
            var charge = 2;

            spyOn(total, 'get').and.callFake(function() {
                return Backbone.Model.prototype.get.apply(this, arguments);
            });

            spyOn(delivery, 'getCharge').and.callFake(function() {
                return charge;
            });

            total.get_delivery_charge();

            expect(total.get).toHaveBeenCalledWith('delivery');
            expect(delivery.getCharge).toHaveBeenCalled();
            expect(round_monetary_currency).toHaveBeenCalledWith(charge);
        });

        it('set_delivery_charge(charge)', function() {
            var charge = 4;

            spyOn(total, 'get').and.callFake(function() {
                return Backbone.Model.prototype.get.apply(this, arguments);
            });

            spyOn(delivery, 'set');

            total.set_delivery_charge(charge);

            expect(total.get).toHaveBeenCalledWith('delivery');
            expect(delivery.set).toHaveBeenCalledWith('charge', charge);
        });

        describe('get_shipping_charge()', function() {
            it('`shipping` is null', function() {
                total.set('shipping', null);
                total.get_shipping_charge();
                expect(round_monetary_currency).toHaveBeenCalledWith(0);
            });

            it('`shipping` is a number', function() {
                var shipping = 123;
                total.set('shipping', shipping);
                total.get_shipping_charge();
                expect(round_monetary_currency).toHaveBeenCalledWith(shipping);
            });
        });

        it('get_bag_charge()', function() {
            var bag_charge = 3;
            total.set('bag_charge', bag_charge);
            total.get_bag_charge();
            expect(round_monetary_currency).toHaveBeenCalledWith(bag_charge);
        });

        describe('get_remaining_delivery_amount()', function() {
            var remain;

            beforeEach(function() {
                remain = undefined;

                spyOn(total, 'get').and.callFake(function() {
                    return Backbone.Model.prototype.get.apply(total, arguments);
                });

                spyOn(delivery, 'getRemainingAmount').and.callFake(function() {
                    return remain;
                });
            });

            it('a remain exists', function() {
                remain = 20;
                total.get_remaining_delivery_amount();
                commonExpectation();
                expect(round_monetary_currency).toHaveBeenCalledWith(remain);
            });

            it('a remain does not exist', function() {
                remain = -2;
                total.get_remaining_delivery_amount();
                commonExpectation();
                expect(round_monetary_currency).toHaveBeenCalledWith(0);
            });

            function commonExpectation() {
                expect(total.get).toHaveBeenCalledWith('delivery');
                expect(total.get).toHaveBeenCalledWith('subtotal');
                expect(delivery.getRemainingAmount).toHaveBeenCalledWith(total.get('subtotal'));
            }
        });

        it('empty()', function() {
            var setData;

            spyOn(total, 'set').and.callFake(function(opts) {
                setData = opts;
                return Backbone.Model.prototype.set.apply(total, arguments);
            });

            spyOn(tip, 'empty');

            total.empty();

            expect(total.set).toHaveBeenCalledWith(setData);
            expect(tip.empty).toHaveBeenCalled();
            expect(setData).toEqual({
                tax : 0,
                subtotal : 0,
                surcharge: 0
            });
        });

        it('saveTotal()', function() {
            spyOn(tip, 'saveTip');
            spyOn(window, 'setData');

            total.saveTotal();

            expect(window.setData).toHaveBeenCalledWith('total', total);
            expect(tip.saveTip).toHaveBeenCalled();
        });

        it('loadTotal()', function() {
            var storageData = {
                delivery: 32,
                tip: 1212
            }

            spyOn(tip, 'loadTip');

            spyOn(window, 'getData').and.callFake(function() {
                return storageData;
            });

            spyOn(total, 'set').and.callFake(function() {
                return Backbone.Model.prototype.set.apply(total, arguments);
            });

            total.loadTotal();

            expect(window.getData).toHaveBeenCalledWith('total');
            expect(tip.loadTip).toHaveBeenCalled();
            expect(total.set).toHaveBeenCalled();
            expect(total.get('tip')).toBe(tip);
            expect(total.get('delivery')).toBe(delivery);
        });

        it('get_all()', function() {
            var final_total = '12.00',
                surcharge = '2.00',
                subtotal = '8.00',
                tax = '4.00',
                tip = '1.00',
                total_discounts = '3.00',
                __parseFloat = window.parseFloat;

            spyOn(total, 'get_total').and.returnValue(final_total);
            spyOn(total, 'get_surcharge').and.returnValue(surcharge);
            spyOn(total, 'get_subtotal').and.returnValue(subtotal);
            spyOn(total, 'get_tax').and.returnValue(tax);
            spyOn(total, 'get_tip').and.returnValue(tip);
            spyOn(total, 'get_discounts_str').and.returnValue(total_discounts);
            spyOn(window, 'parseFloat').and.callFake(function() {
                return __parseFloat.apply(window, arguments);
            });

            expect(total.get_all()).toEqual({
                final_total: __parseFloat(final_total),
                surcharge: __parseFloat(surcharge),
                subtotal: __parseFloat(subtotal),
                tax: __parseFloat(tax),
                tip: __parseFloat(tip),
                total_discounts: __parseFloat(total_discounts)
            });
            expect(total.get_total).toHaveBeenCalled();
            expect(total.get_surcharge).toHaveBeenCalled();
            expect(total.get_subtotal).toHaveBeenCalled();
            expect(total.get_tax).toHaveBeenCalled();
            expect(total.get_tip).toHaveBeenCalled();
            expect(total.get_discounts_str).toHaveBeenCalled();
            expect(window.parseFloat).toHaveBeenCalledWith(final_total);
            expect(window.parseFloat).toHaveBeenCalledWith(surcharge);
            expect(window.parseFloat).toHaveBeenCalledWith(subtotal);
            expect(window.parseFloat).toHaveBeenCalledWith(tax);
            expect(window.parseFloat).toHaveBeenCalledWith(tip);
            expect(window.parseFloat).toHaveBeenCalledWith(total_discounts);
        });

        describe('clone()', function() {
            var newTotal, setOpts, triggerOpts;

            beforeEach(function() {
                newTotal = new App.Models.Total();

                spyOn(App.Models, 'Total').and.callFake(function() {
                    return newTotal;
                });

                spyOn(newTotal, 'set').and.callFake(function(key, value, opts) {
                    setOpts = opts;
                    return Backbone.Model.prototype.set.apply(newTotal, arguments);
                });

                spyOn(newTotal, 'trigger').and.callFake(function(event, model, opts) {
                    triggerOpts = opts;
                    return Backbone.Model.prototype.trigger.apply(newTotal, arguments);
                });
            });

            it('`value` does not have clone() method', function() {
                commonExpectation();
            });

            it('`value` has clone() method', function() {
                var value = {clone: function() {}}
                total.set('value', value);

                spyOn(value, 'clone');

                commonExpectation();
                expect
            });

            function commonExpectation() {
                total.clone();
                expect(newTotal.set).toHaveBeenCalled();
                expect(setOpts).toEqual({silent: true});
                expect(newTotal.trigger).toHaveBeenCalled();
                expect(triggerOpts).toEqual({clone: true});
            }
        });
    });
});