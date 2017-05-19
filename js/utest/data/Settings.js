define([], function() {
    return {
        "defaults": {
            "brand": null,
            "establishment": null,
            "host": "",
            "storage_data": 0,
            "skin": "",
            "settings_skin": {
                "routing": {
                    "errors": {
                        "cssCore": [],
                        "templatesCore": ["errors_core"]
                    },
                    "establishments": {
                        "cssCore": ["establishments"],
                        "templatesCore": ["establishments"]
                    }
                }
            },
            "settings_system": {},
            "timeout": 360000,
            "isMaintenance": false,
            "maintenanceMessage": "",
            "version": 1.06,
            "supported_skins": []
        },

        "defaults_initialized": {
            "brand": null,
            "establishment": null,
            "host": "https://weborder-dev-branch.revelup.com",
            "storage_data": 0,
            "skin": "",
            "settings_skin": {
                "routing": {
                    "errors": {
                        "cssCore": [],
                        "templatesCore": ["errors_core"]
                    },
                    "establishments": {
                        "cssCore": ["establishments"],
                        "templatesCore": ["establishments"]
                    }
                }
            },
            "settings_system": {},
            "timeout": 360000,
            "isMaintenance": false,
            "maintenanceMessage": "",
            "version": 1.06,
            "supported_skins": [],
            "basePath": window._phantom ? "base" : ".",
            "coreBasePath": window._phantom ? "base" : ".",
            "hostname": "weborder-dev-branch.revelup.com"
        },

        "initializing_tests": {
            "brand": null,
            "establishment": null,
            "host": "https://weborder-dev-branch.revelup.com",
            "storage_data": 0,
            "skin": "",
            "settings_skin": {
                "img_default" : ['default.png'],
                "routing": {
                    "errors": {
                        "cssCore": [],
                        "templatesCore": ["errors_core"]
                    },
                    "establishments": {
                        "cssCore": ["establishments"],
                        "templatesCore": ["establishments"]
                    }
                }
            },
            "settings_system": {},
            "timeout": 360000,
            "isMaintenance": false,
            "maintenanceMessage": "",
            "version": 1.06,
            "supported_skins": [],
            "basePath": window._phantom ? "base" : ".",
            "coreBasePath": window._phantom ? "base" : ".",
            "hostname": "weborder-dev-branch.revelup.com"
        },

        "all": {
            "supported_skins": ["weborder", "weborder_mobile", "retail", "paypal", "mlb", "directory_mobile", "directory"],
            "brand": 1,
            "establishment": 14,
            "host": "https://weborder-dev-branch.revelup.com",
            "storage_data": 1,
            "skin": "weborder",
            "settings_skin": {
                "name_app": "Web application",
                "img_default": ["./skins/weborder/img/none.png", "./skins/weborder/img/none2.png"],
                "styles": [],
                "scripts": [],
                "routing": {
                    "main": {
                        "css": ["mainCSS", "themes/stanford/colors"],
                        "templates": ["mainTemplate"],
                        "views": ["mainView"]
                    },
                    "index": {},
                    "about": {
                        "cssCore": ["libs/jquery/jquery.gallery/jquery.gallery"]
                    },
                    "map": {},
                    "checkout": {},
                    "confirm": {},
                    "pay": {},
                    "errors": {
                        "cssCore": [],
                        "templatesCore": ["errors_core"]
                    },
                    "establishments": {
                        "cssCore": ["establishments"],
                        "templatesCore": ["establishments"]
                    }
                },
                "color_schemes": ["default", "blue_&_white", "vintage", "stanford"]
            },
            "settings_system": {
                "favicon_image": null,
                "address": {
                    "province": "",
                    "city": "San Francisco",
                    "state": "CA",
                    "postal_code": "93144",
                    "line_1": "170 Columbus Ave",
                    "country": "US",
                    "line_2": "",
                    "coordinates": {
                        "lat": 56.317333,
                        "lng": 44.060451
                    },
                    "state_province": "CA",
                    "full_address": "170 Columbus Ave, San Francisco, CA 93144"
                },
                "business_name": "Kinematics",
                "email": "apakhunov@revelsystems.com",
                "hide_images": false,
                "phone": "+19491112233",
                "prevailing_surcharge": 5,
                "prevailing_tax": 0,
                "tax_country": "usa",
                "currency_symbol": "Fr",
                "order_notes_allow": true,
                "min_items": 0,
                "hide_products_description": false,
                "color_scheme": "stanford",
                "scales": {
                    "default_weighing_unit": "Lb",
                    "label_for_manual_weights": "MAN",
                    "number_of_digits_to_right_of_decimal": 0
                },
                "type_of_service": 1,
                "default_dining_option": "DINING_OPTION_TOGO",
                "accept_discount_code": true,
                "enable_quantity_modifiers": true,
                "enable_split_modifiers": true,
                "other_dining_option_details": [{
                    "required": false,
                    "name": "Level"
                }, {
                    "required": false,
                    "name": "Section"
                }, {
                    "required": false,
                    "name": "Room"
                }],
                "locales": {
                    "en": 1427802271098,
                    "ru": 1427802447190
                },
                "payment_processor": {
                    "moneris": false,
                    "paypal_mobile": true,
                    "adyen": false,
                    "paypal": true,
                    "worldpay": false,
                    "quickbooks": false,
                    "freedompay": false,
                    "mercury": false,
                    "gift_card": true,
                    "cash": true,
                    "usaepay": true,
                    "credit_card_button": true,
                    "credit_card_dialog": true,
                    "stanford": true,
                    "stripe": false,
                    "cresecure": false,
                    "payment_count": 5
                },
                "server_time": -28800259,
                "estimated_order_preparation_time": 10,
                "editable_dining_options": [false, "Drive Though", "Other"],
                "brand_name": "MLB",
                "currency_name": "USD",
                "about_access_to_location": "Get up on the fifth floor and go to the third door at right.",
                "special_requests_online": true,
                "accept_online_orders_when_store_is_closed": true,
                "auto_bag_charge": 0,
                "cannot_order_with_empty_inventory": false,
                "estimated_delivery_time": 60,
                "delivery_charge": 2,
                "online_order_start_time_offset": 30,
                "about_description": "Kinematics is the study of classical mechanics which describes the motion of points, bodies (objects) and systems of bodies (groups of objects) without consideration of the causes of motion.[1][2][3] The term is the English version of A.M. Ampère's cinématique,[4] which he constructed from the Greek κίνημα kinema \"movement, motion\", derived from κινεῖν kinein \"to move\".[5][6]\r\n\r\nThe study of kinematics is often referred to as the geometry of motion.[7] (See analytical dynamics for more detail on usage.)",
                "about_images": [(window._phantom ? "base/" : "") + "js/utest/data/test_picture2.png", (window._phantom ? "base/" : "") + "js/utest/data/test_picture3.png"],
                "timetables": [],
                "delivery_for_online_orders": true,
                "delivery_post_code_lookup": [false, "603163"],
                "about_title": "Kinematics",
                "use_custom_menus": true,
                "eat_in_for_online_orders": true,
                "suppress_student_identifier_popup": false,
                "api_version": 1,
                "distance_mearsure": "km",
                "date_format": "Mmm/dd/yyyy",
                "brand": 1,
                "time_zone_offset": -18000000,
                "holidays": [{
                    "date": "Sep,  1",
                    "name": "Holiday 1"
                }, {
                    "date": "Sep, 30",
                    "name": "Holiday 2"
                }],
                "time_format": "24 hour",
                "online_orders": false,
                "delivery_cold_untaxed": false,
                "logo_img": (window._phantom ? "base/" : "") + "js/utest/data/test_picture1.png",
                "max_delivery_distance": 1,
                "online_order_date_range": 100,
                "accept_tips_online": true,
                "enable_asap_due_time": true,
                "online_order_end_time_offset": 30,
                "enable_reward_cards_collecting": true,
                "online_order_time_slot": 15,
                "min_delivery_amount": 4,
                "delivery_geojson": [false, ""],
                "shipping": true,
                "promo_message": null,
                "show_modifiers_description": false,
                "dining_options": [0, 1, 2, 7, 3, 4, 6],
                "geolocation_load": {}
            },
            "settings_directory": {
                "delivery_filter":true,
                "distance_filter":true,
                "sorting_filter":true,
                "open_now_filter":true,
                "store_type_filter":true,
                "online_ordering_filter":true,
                "app_data_url": null,
                "local_data_server": false,
                "search_by_name_filter": true,
                "default_location": { lat: 37.77837116836659, lon: -122.41963882471924 },
                "min_zoom_method": "by_distance_filter",
                "fit_map_to_stores": false,
                "mobile_open_link_new_tab": true,
                "main_header_subtitle": null,
                "mobile_main_header_title": null
            },
            "timeout": 360000,
            "isMaintenance": false,
            "maintenanceMessage": "",
            "version": 1.06,
            "basePath": window._phantom ? "base" : ".",
            "coreBasePath": window._phantom ? "base" : ".",
            "hostname": "weborder-dev-branch.revelup.com",
            "img_path": window._phantom ? "base/skins/weborder/img/" : "./skins/weborder/img/",
            "skinPath": window._phantom ? "base/skins/weborder" : "./skins/weborder"
        }
    };
});