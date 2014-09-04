var findit = require('findit'),
    setFunctionName = require('function-name'),
    path = require('path'),
    _ = require('lodash'),
    routerCache = {},
    allRoutes = [];

exports = module.exports = function Otter(app, dir, options, next) {
    if (typeof options === 'function') {
        next = options;
        options = {};
    }

    options = options || {};
    var o = {
        directory: dir,
        routerName: options.routerName || 'Otter',
        modules: options.modules || null,
        menu: options.menu || null,
        methods: options.methods || {
            'get': 'get',
            'put': 'put',
            'post': 'post',
            'delete': 'delete'
        },
        fileMatchersForId: options.fileMatchersForId || [],
        methodMatchers: [],
        diagnostics: options.diagnostics || false
    };

    if(!o.directory) {
        throw 'Otter Routes: directory must be a string';
    }

    if (o.modules) {
        if (typeof o.modules === 'string') {
            o.modules = o.modules.split(',');
        } else if (!o.modules instanceof Array) {
            throw 'Otter Routes: options.modules must be an array or comma separated string with no spaces';
        }
    }

    for (var key in o.methods) {
        if (o.methods.hasOwnProperty(key)) {
            o.methodMatchers.push(key);
        }
    }

    var root = process.cwd();
    var directory = path.resolve(root, o.directory);

    var finder = findit(directory);
    finder.on('file', function (file) {
        file = file.replace(/\\/g, '/');

        var full = file.split('/');
        var directoryIndex = full.indexOf(o.directory);
        var structure = full.slice(directoryIndex + 1, full.length);

        var fileName = structure.pop();
        var requiredFile = require(file);
        var controller;

        if (requiredFile.controller) {
            controller = requiredFile.controller;
        } else {
            controller = requiredFile;
        }

        var routeString = '';
        var module = structure.shift();

        if (o.modules) {
            module = _.find(o.modules, function (x) {
                return x == module;
            });
        }

        if (module) {
            var match = null;
            o.methodMatchers.forEach(function (x) {
                var regex = new RegExp(x, 'gi');
                var m = fileName.match(regex);
                if (m) {
                    match = m;
                }
            });

            match = match ? match[0].toLowerCase() : null;
            var method = o.methods[match];

            routeString += '/' + module;
            if (controller.name.indexOf('ForParent') !== -1) {
                routeString += '/:parent_id';
            }

            structure.forEach(function (dir) {
                routeString += '/' + dir;
            });

            if (method) {
                var order = 0;

                var idParam = _.find(o.fileMatchersForId, function(matcher) {
                    return match === matcher;
                });

                if (idParam) {
                    routeString += '/:id';
                    order = 1;
                }

                var obj = {
                    name: controller.name,
                    method: method,
                    routeString: routeString,
                    module: module,
                    order: order,
                    controller: controller
                };

                allRoutes.push(obj);

                if (requiredFile.menu && o.menu) {
                    requiredFile.menu.method = method;
                    requiredFile.menu.path = routeString;
                    o.menu[controller.name] = requiredFile.menu;
                }
            }
        }
    });

    finder.on('end', function () {
        allRoutes = _.sortBy(allRoutes, function(x) { return x.order; });
        allRoutes.forEach(function(route) {
            if (!routerCache[route.module]) {
                routerCache[route.module] = require('express').Router();
            }

            routerCache[route.module][route.method](route.routeString.toLowerCase(), route.controller)
        });
        var router = require('express').Router();
        for (var key in routerCache) {
            if (routerCache.hasOwnProperty(key)) {
                setFunctionName(routerCache[key], key);
                router.use(routerCache[key]);
            }
        }
        setFunctionName(router, 'Otter');
        app.use(router);

        require('./moduleManagement')(app, o, function() {
            if (o.diagnostics) {
                require('./diagnostics')(app, router, o, next);
            } else {
                if (next) next();
            }
        });
    });
};