var findit = require('findit'),
    setFunctionName = require('function-name'),
    path = require('path'),
    _ = require('lodash'),
    routerCache = {};

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
            if (!routerCache[module]) {
                routerCache[module] = require('express').Router();
            }

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
                var idParam = _.find(o.fileMatchersForId, function(matcher) {
                    return match === matcher;
                });
                if (idParam) routeString += '/:id';
                routerCache[module][method](routeString.toLowerCase(), controller);
            }
        }
    });

    finder.on('end', function () {
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