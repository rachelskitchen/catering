define([], function() {
    return {
        "promotion_defaults": {
            "id": null,
            "name": "",
            "code": "",
            "is_applicable": false,
            "is_applied": false
        },

        "campaigns": [
            {
                "is_applicable": true,
                "code": "test1",
                "id": 1,
                "name": "Promo 30% Off Order"
            }, {
                "is_applicable": true,
                "code": "test2",
                "id": 2,
                "name": "duplicate PROMO1"
            }, {
                "is_applicable": true,
                "code": "test3",
                "id": 3,
                "name": "Promo $1 Off"
            }, {
                "is_applicable": false,
                "code": "test4",
                "id": 4,
                "name": "TEST CAMPAIGN"
            }]
    };
});