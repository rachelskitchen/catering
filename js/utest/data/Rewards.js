define([], function() {
    return {
        "defaults": {
            "id": null,
            "name": "",
            "amount": 0,
            "is_item_level": false,
            "points": 0,
            "rewards_type": null,
            "type": 0,
            "selected": false
        },

        "rewards": {
            "discounts": [{
                "is_item_level": false,
                "name": "Visit Reward",
                "amount": 2.0,
                "points": 5.0,
                "rewards_type": 2,
                "type": 0,
                "id": 2903
            }, {
                "is_item_level": true,
                "name": "Item Reward",
                "amount": 3.0,
                "points": 5.0,
                "rewards_type": 1,
                "type": 0,
                "id": 2905
            }, {
                "is_item_level": false,
                "name": "Purchase Reward",
                "amount": 1.0,
                "points": 20.0,
                "rewards_type": 0,
                "type": 0,
                "id": 2904
            }, {
                "is_item_level": false,
                "name": "item reward percent",
                "amount": 10.0,
                "points": 1.0,
                "rewards_type": 0,
                "type": 1,
                "id": 8252
            }],
            "balances": {
                "0": 1500.39,
                "1": 101.0,
                "2": 51
            }
        }

    };
});