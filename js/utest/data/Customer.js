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
            "shipping_services": [],
            "shipping_selected": -1,
            "load_shipping_status": "",
            "password": "",
            "confirm_password": "",
            "show_password": false,
            "user_id": null,
            "expires_in": null,
            "token_type": "",
            "access_token": "",
            "keepCookie": true,
            "serverURL": "https://identity-dev.revelup.com/customers-auth"
        },
        "customer1": {
            "first_name": "Firstone",
            "last_name": "Lastone",
            "addresses": [
                {
                    "id": 1,
                    "selected": true,
                    "address": "170 Columbus Ave, San Francisco, 94133",
                    "city": "San Francisco",
                    "country": "US",
                    "province": "undefined",
                    "state": "CA",
                    "street_1": "170 Columbus Ave",
                    "street_2": "",
                    "zipcode": "94133"
                },
                {
                    "id": 2,
                    "selected": false,
                    "city": "New York",
                }
            ],
            "email": "",
            "first_name": "",
            "id": null,
            "last_name": "",
            "load_shipping_status": "",
            "phone": "",
            "shipping_services": []
        }
    };
});