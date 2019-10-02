Otter Routes [![Build Status](https://secure.travis-ci.org/jonathanlarsen/node-otter-routes.png)](http://travis-ci.org/jonathanlarsen/node-otter-routes)
============

Otter Routes is an Express route builder based on directory structure, with controllers exporting a route callback.
The method comes from a verb in either the function name on the controller, or the file name.

```
$ npm install otter-routes
```

By default, the verbs map directly to the same method name:
-   Get -> get
-   Put -> put
-   Post -> post
-   Delete -> delete

The following properties are key words when exporting from a controller:
-   controller -> express route callback - function ControllerName(req, res) {};
-   menu -> will return an object with all properties, as well as add controllerName, method, and path
-   urlPattern -> overridable string for the url, in case you need additional route params
-   permission -> name of the permission required to access this route, will be added to the menu as well
-   permissionMiddleware -> express callback for permission to access the route. function(req, res, next){ next(); })

All other non function properties exported will be returned in the final callback as an array with the objects listed.
All other function properties exported will create an additional route appended to the controller's path with the same method.

The following options are available:
- methods -> Map a verb to a http method. ie: {'update': 'put'}
- diagnostics -> Add /_otter/routes to your app to display all routes built by otter
- idParamMatchers -> Array of verbs to append /:id to the route string
- parentIdParamMatch -> Matches end of controller name to append /:parentid after the parent directory in the route
    string. Defaults to ForParent.


Most basic example
------------------

This example, with no config, will read the controllers directory in the cwd for routes

```javascript
var express = require('express'),
    otter = require('otter-routes'),
    app = express();

otter(app, function(err, results) {
    //results will have all routes as well as all additional properties exported from your controllers
    //like results.menu, or results.custom if you add your own custom property

    app.listen(3001, function() {
        console.log('app listening on port 3001');
    });
});
```

More advanced example
---------------------

```javascipt
var express = require('express'),
    otter = require('otter-routes'),
    app = express();

var config = {
    idParamMatchers: ['view', 'update', 'destroy'],
    diagnostics: true,
    methods: {
        'get': 'get',
        'put': 'put',
        'post': 'post',
        'delete': 'delete,

        'list': 'get',
        'view': 'get',
        'update': 'put',
        'create': 'post',
        'destroy': 'delete'
    }
};

/*
    For every get, put, post, or delete verb in the controller/file name, the express method will map directly to the
    verb.
    List will map to get, with no parameters
    View will map to get, with /:id parameter
    Update will map to get, with /:id parameter
    Create will map to post, with no parameters
    Destroy will map to delete, with /:id parameter
*/

otter(app, config, function(err, results) {
    app.listen(3001, function() {
        console.log('app listening on port 3001');
    });
});
```

Controller Examples
-------------------

If the following controller were placed in GetUsers.js in the directory users, it would create a get method on the route
/users. (app.get('/users');)

If more options are needed for the controller, you must use exports.controller

```javascript
module.exports = function GetUsers(req, res) {};
```
or
```javascript
exports.controller = function GetUsers(req, res) {};
```

Override exports.urlPattern
This will no longer create a get method at the path /users, but will make a get method at the path /path/to/new/list/of/users
```javascript
exports.urlPattern = '/path/to/new/list/of/users';

exports.controller = function ListUsers(req, res) {
    //database call
    res.json(users);
};
```


Set exports.menu. the final callback of otter will return results.menu with an array of menu items.
results.menu [
    {
        title: 'Home',              //added in the exports.menu declaration
        controllerName: 'GetHome',  //added automatically by otter
        method: 'get',              //added automatically by otter
        path: '/home'               //added automatically by otter
    }
]
```javascript
exports.menu = {
    title: 'Home'
};

exports.controller = function GetHome(req, res) {
    res.json({path: '/home'});
});
```


Custom function: we have an aggregate service that will group lists by specified properties, instead of building
and entire new route, we just use exports.aggregate as an express route callback to append /aggregate to the original
list's path. For our aggregate we use a service,

If the following file were placed in the users directory, it would create a get method at /users to list all users, as
well as a get method at /users/aggregate.
```javascript
var aggregateService = require('path/to/aggregateService');

exports.controller = function ListUsers(req, res) {
    //database call
    res.json(users);
};

exports.aggregate = aggregateService('Users');
```