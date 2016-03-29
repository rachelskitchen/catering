define([], function() {
    return {
        "cookieName": "user",
        "cookiePath": "/weborder",
        "cookieDomain": "revelup.com",
        "cookieSecure": true,
        "defaults": {
            "first_name": "",
            "last_name": "",
            "phone": "",
            "email": "",
            "id": null,
            "addresses": [],
            "shipping_address": -1,
            "shipping_services": [],
            "shipping_selected": -1,
            "load_shipping_status": "",
            "deliveryAddressIndex": 0,
            "shippingAddressIndex": 1,
            "cateringAddressIndex": 2,
            "profileAddressIndex": 3,
            "password": "",
            "confirm_password": "",
            "user_id": null,
            "expires_in": null,
            "token_type": "",
            "access_token": "",
            "keepCookie": true,
            "serverURL": "https://identity-dev.revelup.com/customers-auth/"
        },
        "customer1": {
            "first_name": "Firstone",
            "last_name": "Lastone",
            "addresses": [
                {
                    "address": "170 Columbus Ave, San Francisco, 94133",
                    "city": "San Francisco",
                    "country": "US",
                    "province": "undefined",
                    "state": "CA",
                    "street_1": "170 Columbus Ave",
                    "street_2": "",
                    "zipcode": "94133"
                }
            ],
            "deliveryAddressIndex": "0",
            "email": "",
            "first_name": "",
            "id": null,
            "last_name": "",
            "load_shipping_status": "",
            "phone": "",
            "shippingAddressIndex": 1,
            "shipping_address": -1,
            "shipping_selected": -1,
            "shipping_services": []
        }
    };
});