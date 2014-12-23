define(['settings', 'products', 'myorder', 'card', 'customers'], function() {
    'use strict';

    var products, settings, GET_PARAMS, isCreditCardAvailable;

    GET_PARAMS = function() {
        var params = window.location.search.match(/\w+=\w+/g),
            obj = {};
        params && params.forEach(function(param) {
            var data = param.match(/\w+/g);
            obj[data[0]] = data[1];
        });
        return obj;
    }();

    isCreditCardAvailable = 'cardNumber' in GET_PARAMS && 'expMonth' in GET_PARAMS && 'expYear' in GET_PARAMS;

    $.ajax({
        type: 'GET',
        url: 'js/utest/data_e2e/Products.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            products = data;
        }
    });

    $.ajax({
        type: 'GET',
        url: 'js/utest/data_e2e/Settings.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            settings = data;
        }
    });

    isCreditCardAvailable && describe("App.Collections.Myorders. Make Payment with credit card via USAePay. /weborders/create_order_and_pay/", function() {
        var myorder,
            paymentResponse;

        beforeEach(function() {
            var item1 = new App.Models.Myorder({
                product: new App.Models.Product(products.reward_point_1_55),
                id_product: products.reward_point_1_55.id
            }), item2 = new App.Models.Myorder({
                product: new App.Models.Product(products.reward_point_1_0),
                id_product: products.reward_point_1_0.id
            });
            myorder = new App.Collections.Myorders();

            myorder.add([item1, item2]);

            App.Data.myorder = myorder;
            App.Data.card = new App.Models.Card();
            App.Data.customer = new App.Models.Customer();
        });

        afterEach(function() {
            myorder = undefined;
            delete App.Data.card;
            delete App.Data.myorder;
            delete App.Data.customer;
        });

        describe("Skin weborder.", function() {
            var prevSkin, prevSettings, prevCheckout;

            beforeEach(function() {
                prevSkin = App.Data.settings.get('skin');
                prevSettings = App.Data.settings.get('settings_system');
                prevCheckout = myorder.checkout.toJSON();
                App.Data.settings.set('skin', 'weborder');
                App.Data.settings.set('settings_system', settings.usaepay);
            });

            afterEach(function() {
                App.Data.settings.set('skin', prevSkin);
                App.Data.settings.set('settings_system', prevSettings);
                myorder.checkout.set(prevCheckout);
                prevSkin = undefined;
                prevSettings = undefined;
                prevCheckout = undefined;
            });

            it('Check reward card collection. Reward Card is present and correct.', function(done) {
                myorder.checkout.set({
                    contactName: 'End-to-end test "Reward Card"',
                    rewardCard: settings.usaepay.rewardCard
                });
                App.Data.card.set({
                    cardNumber: GET_PARAMS.cardNumber,
                    expMonth: GET_PARAMS.expMonth,
                    expDate: GET_PARAMS.expYear,
                });
                App.Data.customer.set({
                    first_name: 'End-to-end test',
                    last_name: 'Reward Card'
                });
                myorder.once('paymentResponse', function() {
                    expect(myorder.paymentResponse.reward_points).toBeGreaterThan(0);
                    done();
                });
                myorder.once('paymentFailed', function(opts) {
                    expect(true).toEqual(false);
                    done();
                });
                myorder.submit_order_and_pay(2);
            });

            it('Check reward card collection. Reward Card is present and incorrect.', function(done) {
                myorder.checkout.set({
                    contactName: 'End-to-end test "Reward Card"',
                    rewardCard: "99999999999999999999999999999999999999999999"
                });
                App.Data.card.set({
                    cardNumber: GET_PARAMS.cardNumber,
                    expMonth: GET_PARAMS.expMonth,
                    expDate: GET_PARAMS.expYear
                });
                App.Data.customer.set({
                    first_name: 'End-to-end test',
                    last_name: 'Reward Card'
                });
                myorder.once('paymentResponse', function() {
                    expect(true).toEqual(false);
                    done();
                });
                myorder.once('paymentFailed', function(opts) {
                    expect(Array.isArray(opts) && opts[0] && opts[0].indexOf(MSG.REWARD_CARD_UNDEFINED) > -1).toEqual(true);
                    done();
                });
                myorder.submit_order_and_pay(2);
            });
        });
    });
});