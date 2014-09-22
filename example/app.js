var express = require('express'),
    otter = require('../'),
    app = express();

var config = {
    "directory": "actions",
    "routerName": "Otter",
    "diagnostics": true,
    "methods": {
        "get": "get",
        "add": "get",
        "list": "get",
        "edit": "get",
        "put": "put",
        "post": "post",
        "delete": "delete"
    },
    "fileMatchersForId": ["get","edit","put","delete"]
};

app.menu = {};
otter(app, config.directory, config, function() {
    app.listen(8000, function() {
        console.log('app listening on port 8000');
    });
});