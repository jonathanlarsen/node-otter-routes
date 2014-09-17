var findit = require('findit'),
    setFunctionName = require('function-name'),
    path = require('path'),
    _ = require('lodash'),
    routerCache = {},
    allRoutes = [];

module.exports = function Otter(app, dir, options, next) {
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
        diagnostics: options.diagnostics || false,
        routeParamMatchers: options.routeParamMatchers || {
            id: '[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-F0-9]{12}',
            parent_id: '[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-F0-9]{12}'
        }
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
        if (file.indexOf('.js') === -1) return;

        var full = file.split('\\');
        var directoryIndex = full.indexOf(o.directory);
        var structure = full.slice(directoryIndex + 1, full.length);

        var routeString = '';
        var module = structure.shift();

        if (o.modules) {
            module = _.find(o.modules, function (x) {
                return x == module;
            });
        }

        if (module) {
            var fileName = structure.pop();
            var requiredFile;
            try {
                requiredFile = require(file);
            } catch (e) {
                console.error('OtterRoutes: The file [' + file + '] could not be required.');
                console.error(e.stack);
                return;
            }
            var controller;

            if (requiredFile.controller) {
                controller = requiredFile.controller;
            } else {
                controller = requiredFile;
            }

            if (typeof controller !== 'function') {
                console.error('OtterRoutes: No controller in file [' + file + '] could be found. ' +
                    '\nPlease export a proper express route callback, or make sure exports has property named "controller" that is a proper express route callback. ' +
                    '\nfunction(req, res) { res.json({}); }' +
                    '\nIgnoring ' + fileName);
                return;
            }

            routerCache[module] = routerCache[module] || {};
            routerCache[module].router = null;
            routerCache[module].requireCacheKeys = routerCache[module].requireCacheKeys || [];
            routerCache[module].requireCacheKeys.push(path.resolve(file));
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

                if (requiredFile.urlPattern) {
                    routeString = requiredFile.urlPattern;
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

                if (requiredFile.menu && app.menu) {
                    requiredFile.menu.method = method;
                    requiredFile.menu.path = routeString;
                    app.menu[controller.name] = requiredFile.menu;
                }

                delete requiredFile.menu;
                delete requiredFile.controller;
                delete requiredFile.urlPattern;
                Object.keys(requiredFile).forEach(function(key) {
                    if (typeof requiredFile[key] !== 'function') {
                        console.error('OtterRoutes: No route call back function in file [' + file + '] could be found for additional property [' + key + ']. ' +
                            '\nPlease export a proper express route callback, or make sure exports has property named "controller" that is a proper express route callback. ' +
                            '\nfunction(req, res) { res.json({}); }' +
                            '\nIgnoring ' + key);
                        return;
                    }
                    var optionalRouteString = routeString;
                    obj = {
                        name: requiredFile[key].name,
                        method: method,
                        routeString: optionalRouteString += '/' + key,
                        module: module,
                        order: order,
                        controller: requiredFile[key]
                    };

                    allRoutes.push(obj);
                });
            }
        }
    });

    finder.on('end', function () {
        allRoutes = _.sortBy(allRoutes, function(x) { return x.order; });
        allRoutes.forEach(function(route) {
            if (!routerCache[route.module].router) {
                var router = require('express').Router();

                router.param(function(name, fn){
                    if (fn instanceof RegExp) {
                        return function(req, res, next, val){
                            var captures;
                            if (captures = fn.exec(String(val))) {
                                req.params[name] = captures[0];
                                next();
                            } else {
                                next('route');
                            }
                        }
                    }
                });

                var routeParamMatcherKeys = Object.keys(o.routeParamMatchers);
                if (routeParamMatcherKeys) {
                    routeParamMatcherKeys.forEach(function(key) {
                        var matcher = o.routeParamMatchers[key];
                        var regex = matcher instanceof RegExp ? matcher : new RegExp(matcher, 'i');
                        router.param(key, regex);
                    });
                }

                routerCache[route.module].router = router;
            }

            routerCache[route.module].router[route.method](route.routeString.toLowerCase(), route.controller);
        });
        var router = require('express').Router();
        app._otterRoutes = {};
        for (var key in routerCache) {
            if (routerCache.hasOwnProperty(key)) {
                app._otterRoutes[key] = app._otterRoutes[key] || {};
                app._otterRoutes[key] = routerCache[key];
                setFunctionName(routerCache[key].router, key);
                router.use(routerCache[key].router);
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