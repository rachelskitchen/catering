define([], function() {
    return {
        "ModelPaymentToken": {
            "defaults": {
                "customer": null,
                "card_type": null,
                "last_digits": null,
                "first_name": "",
                "last_name": "",
                "vault_id": null,
                "establishment": null,
                "selected": false,
                "is_primary": false,
                "frequency": null,
                "token_expiration": "",
                "cvv": ""
            },
            "type": ""
        },
        "CollectionPaymentTokens": {
            "serverURL": "",
            "ignoreSelectedToken": false,
            "orderPayWithTokenURL": "/weborders/v1/order-pay-token/"
        },
        "ModelUSAePayPayment": {
            "type": "usaepay"
        },
        "CollectionUSAePayPayments": {
            "paymentProcessor": 'usaepaypayment',
            "type": "usaepay"
        },
        "ModelMercuryPayment": {
            "type": "mercurypay"
        },
        "CollectionMercuryPayments": {
            "paymentProcessor": 'mercurypaypayment',
            "type": 'mercurypay'
        },
        "ModelFreedomPayment": {
            "type": "freedompay"
        },
        "CollectionFreedomPayments": {
            "paymentProcessor": 'freedompaypayment',
            "type": 'freedompay'
        },
        "ModelBraintreePayment": {
            "type": "braintree"
        },
        "CollectionBraintreePayments": {
            "paymentProcessor": 'braintreepayment',
            "type": 'braintree'
        },
        "ModelGlobalCollectPayment": {
            "type": "globalcollect"
        },
        "CollectionGlobalCollectPayments": {
            "paymentProcessor": 'globalcollectpayment',
            "type": 'globalcollect'
        }
    };
});