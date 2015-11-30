define([], function() {
    return {
        "defaults": {
            "cost": null,
            "id": null,
            "img": null,
            "name": null,
            "price": null,
            "quantity": 1,
            "qty_type": 0,
            "selected": false,
            "sort": null,
            "sum": null
        },
        "defaults_initialized": {
            "cost": null,
            "id": null,
            "img": "./skins/weborder/img/",
            "name": null,
            "price": null,
            "quantity": 1,
            "qty_type": 0,
            "selected": false,
            "sort": null,
            "sum": null
        },
        "ex0": {
            "id": 1223,
            "name": "Test test test",
            "price": 2.75,
            "selected": true,
            "sort": 5,
            "cost": null,
            "img": "./skins/weborder/img/"
        },
        "ex": {
            "id": 1223,
            "name": "Test test test",
            "price": 2.75,
            "sum": null,
            "selected": true,
            "sort": 5,
            "cost": null,
            "img": "./skins/weborder/img/",
            "quantity": 1,
            "qty_type": 0
        },
        "ex2": {
            "id": 122,
            "name": "Test test test2",
            "price": 2.75,
            "sum": null,
            "selected": true,
            "sort": 4,
            "cost": null,
            "img": "./skins/weborder/img/",
            "quantity": 1,
            "qty_type": 0
        },
        "defBlock": {
            "id": null,
            "sort": null,
            "name": "",
            "mod": "",
            "img": "./skins/weborder/img/",
            "modifier_type": "modifier_multiple",
            "lock_amount": null,
            "lock_enable": false,
            "amount_free": null,
            "admin_modifier": false,
            "admin_mod_key": "",
            "amount_free_is_dollars": false,
            "amount_free_selected": [],
            "ignore_free_modifiers": false
        },
        "exBlock": {
            "id": 12,
            "forced": false,
            "sort": 6,
            "name": "",
            "mod": "",
            "img": "./skins/weborder/img/",
            "modifier_type": "modifier_multiple",
            "lock_amount": null,
            "lock_enable": false,
            "amount_free": null,
            "admin_modifier": false,
            "admin_mod_key": "",
            "amount_free_is_dollars": false,
            "amount_free_selected": [],
            "ignore_free_modifiers": false
        },
        "exBlock2": {
            "id": 123,
            "forced": false,
            "sort": 6,
            "name": "test",
            "mod": "",
            "img": "./skins/weborder/img/",
            "modifier_type": "modifier_multiple",
            "lock_amount": null,
            "lock_enable": false,
            "amount_free": null,
            "admin_modifier": false,
            "admin_mod_key": "",
            "amount_free_is_dollars": false,
            "amount_free_selected": [],
            "ignore_free_modifiers": false
        },
        "exBlocks": [
            {
                "id": 12,
                "forced": false,
                "sort": 5,
                "name": "",
                "mod": "",
                "modifiers": [
                    {
                        "id": 122,
                        "name": "Test test test2",
                        "price": 2.75,
                        "sum": 2.75,
                        "selected": true,
                        "sort": 4,
                        "cost": null,
                        "img": "test/some_image.jpg",
                        "quantity": 1,
                        "qty_type": 0
                    }
                ],
                "img": "./skins/weborder/img/",
                "modifier_type": "modifier_multiple",
                "lock_amount": null,
                "lock_enable": false,
                "amount_free": null,
                "admin_modifier": false,
                "admin_mod_key": "",
                "amount_free_is_dollars": false,
                "amount_free_selected": [],
                "ignore_free_modifiers": false
            }
        ],
        "exBlocks2": [
            {
                "id": 1,
                "forced": false,
                "minimum_amount": 0,
                "maximum_amount": 0,
                "sort": 6,
                "name": "Size",
                "mod": "",
                "modifiers": [
                    {
                        "id": 11,
                        "name": "Test Size",
                        "price": 2.75,
                        "sum": 2.75,
                        "selected": true,
                        "sort": 5,
                        "cost": null,
                        "img": "test/some_image.jpg",
                        "quantity": 1,
                        "qty_type": 0
                    }
                ],
                "img": "./skins/weborder/img/",
                "modifier_type": "modifier_multiple",
                "lock_amount": 1,
                "lock_enable": false,
                "amount_free": null,
                "admin_modifier": true,
                "admin_mod_key": "SIZE",
                "amount_free_is_dollars": false,
                "amount_free_selected": [],
                "ignore_free_modifiers": false
            },
            {
                "id": 12,
                "forced": false,
                "minimum_amount": 0,
                "maximum_amount": 0,
                "sort": 5,
                "name": "",
                "mod": "",
                "modifiers": [
                    {
                        "id": 122,
                        "name": "Test Special",
                        "price": 2.75,
                        "sum": 2.75,
                        "selected": true,
                        "sort": 4,
                        "cost": null,
                        "img": "test/some_image.jpg",
                        "quantity": 1,
                        "qty_type": 0
                    }
                ],
                "img": "./skins/weborder/img/",
                "modifier_type": "modifier_multiple",
                "lock_amount": null,
                "lock_enable": false,
                "amount_free": null,
                "admin_modifier": true,
                "admin_mod_key": "SPECIAL",
                "amount_free_is_dollars": false,
                "amount_free_selected": [],
                "ignore_free_modifiers": false
            },
            {
                "id": 3,
                "forced": true,
                "minimum_amount": 1,
                "maximum_amount": 0,
                "sort": 7,
                "name": "test",
                "mod": "",
                "modifiers": [
                    {
                        "id": 31,
                        "name": "Test Ord22",
                        "price": 2.75,
                        "sum": 2.75,
                        "selected": true,
                        "sort": 4,
                        "cost": null,
                        "img": "test/some_image.jpg",
                        "quantity": 1,
                        "qty_type": 0
                    }
                ],
                "img": "./skins/weborder/img/",
                "modifier_type": "modifier_multiple",
                "lock_amount": null,
                "lock_enable": false,
                "amount_free": null,
                "admin_modifier": false,
                "admin_mod_key": "",
                "amount_free_is_dollars": false,
                "amount_free_selected": [],
                "ignore_free_modifiers": false
            },
            {
                "id": 4,
                "forced": false,
                "minimum_amount": 0,
                "maximum_amount": 0,
                "sort": 8,
                "name": "test",
                "mod": "",
                "modifiers": [
                    {
                        "id": 41,
                        "name": "Test Ord222",
                        "price": 2.75,
                        "sum": 2.75,
                        "selected": true,
                        "sort": 4,
                        "cost": null,
                        "img": "test/some_image.jpg",
                        "quantity": 1,
                        "qty_type": 0
                    }
                ],
                "img": "./skins/weborder/img/",
                "modifier_type": "modifier_multiple",
                "lock_amount": null,
                "lock_enable": false,
                "amount_free": null,
                "admin_modifier": false,
                "admin_mod_key": "",
                "amount_free_is_dollars": false,
                "amount_free_selected": [],
                "ignore_free_modifiers": false
            }
        ],
        "load" : [
            {
                "admin_mod_key": null,
                "admin_modifier": false,
                "amount_free": null,
                "forced": false,
                "id": 3,
                "lock_amount": null,
                "lock_enable": false,
                "modifiers": [
                    {
                        "cost": null,
                        "id": 58,
                        "name": "1 pct",
                        "price": 0,
                        "sum": 0,
                        "selected": false,
                        "sort": 1
                    }
                ],
                "name": "Milk Options",
                "sort": 9
            }
        ],
        "loadModifiers": {
            "admin_mod_key": null,
            "admin_modifier": false,
            "amount_free": null,
            "forced": false,
            "id": 3,
            "img": "./skins/weborder/img/",
            "lock_amount": null,
            "lock_enable": false,
            "mod": "",
            "modifier_type": "modifier_multiple",
            "name": "Milk Options",
            "sort": 9
        },
        "loadModifier": {
            "cost": null,
            "id": 58,
            "img": "./skins/weborder/img/",
            "name": "1 pct",
            "price": 0,
            "sum": 0,
            "selected": false,
            "sort": 1
        }
    
    };
});
