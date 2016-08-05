define([], function() {
    return {
        "def": {
            "state": "init",
            "statusText": "Obtaining current location...",
            "current_loc": null,
            "timeout": 60000
        },
        "success": {
            "state": "complete-success",
            "statusText": "Obtaining current location...",
            "current_loc": {
                "latitude": 45,
                "longitude": 56
            },
            "timeout": 60000
        },
        "error1": {
            "state": "complete-error",
            "statusText": "Your current location retrieval is disallowed. Reset location settings if you want to allow it.",
            "current_loc": null,
            "timeout": 60000
        },
        "error2": {
            "state": "complete-error",
            "statusText": "There was an error while retrieving your location.",
            "current_loc": null,
            "timeout": 60000
        },
        "errorNoAPI": {
            "state": "error-noapi",
            "statusText": "Geolocation API is not supported in your browser.",
            "current_loc": null,
            "timeout": 60000
        },
        "knownError": {
            "code": 1
        },
        "geolocationAPIDisabled": {
            "code": 1
        },
        "unableToDefineLocation": {
            "code": 2
        },
        "geolocationTimeout": {
            "code": 3
        }
    };
});
