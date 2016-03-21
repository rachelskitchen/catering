define([], function() {
    return {
        "promotion_defaults": {
            "name": "",
            "code": "",
            "barcode": "",
            "is_applicable": false,
            "is_applied": false
        },

        "campaigns": [
            {
                "is_applicable": true,
                "discounts": [{
                    "barcode": "",
                    "name": "Promo 30% Off Order",
                    "codes": []
                }],
                "code": "PROMO30",
                "id": 5,
                "name": "Promo 30% Off Order"
            }, {
                "is_applicable": true,
                "discounts": [{
                    "barcode": "",
                    "name": "$1 off",
                    "codes": ["DISCO"]
                }],
                "code": "PROMO1",
                "id": 4,
                "name": "duplicate PROMO1"
            }, {
                "is_applicable": true,
                "discounts": [{
                    "barcode": "",
                    "name": "$1 off",
                    "codes": ["DISCO"]
                }],
                "code": "PROMO1",
                "id": 3,
                "name": "Promo $1 Off"
            }, {
                "is_applicable": true,
                "discounts": [{
                    "barcode": "",
                    "name": "$1 off",
                    "codes": ["DISCO"]
                }],
                "code": "CAMPAIGN",
                "id": 1,
                "name": "TEST CAMPAIGN"
            }]
    };
});