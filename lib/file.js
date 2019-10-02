var platform = require('os').platform(),
    _ = require('lodash'),
    cache = require('./cache');

module.exports = function fileCallback(options) {
    return function (err, file) {
        if (file.indexOf('.js') === -1) return;

        var full;
        if (platform === 'win32') {
            file = file.replace(/\//g, '\\');
            full = file.split('\\');
        } else {
            full = file.split('/');
        }

        var directoryIndex = full.indexOf(options.directory),
            structure = full.slice(directoryIndex + 1, full.length),
            routeString = '',
            module = structure.shift(),
            filename = structure.pop(),
            requiredFile, controller, controllerName, method;

        try {
            requiredFile = require(file);
        } catch (e) {
            console.error('Otter Routes: Could not require file: ' + file);
            return console.error('Stack: ' + e.stack);
        }

        if (requiredFile.controller) {
            controller = requiredFile.controller;
        } else {
            controller = requiredFile;
        }

        if (typeof controller !== 'function') {
            return console.error('Otter Routes: Could not find a proper callback in file: ' + file);
        }

        controllerName = controller.name || filename;

        var match = null;

        _.find(options.methodRegexMatchers, function (method) {
            var regex = new RegExp('^' + method, 'i');
            var m = controllerName.match(regex);
            if (m) {
                match = m[0].toLowerCase();
                return true;
            }
            return false;
        });

        method = options.methods[match];

        if (method) {
            routeString += '/' + module;
            var parentIdRegex = new RegExp(options.parentIdParamMatch + '$', 'i'),
                parentIdMatch = controller.name.match(parentIdRegex),
                order = 0;

            parentIdMatch = parentIdMatch ? parentIdMatch[0] : null;

            if (parentIdMatch) {
                routeString += '/:parentid';
                if (options.idParamRegexMatch) {
                    routeString += '(' + options.idParamRegexMatch + ')';
                }
            }

            structure.forEach(function (x) {
                routeString += '/' + x;
            });

            var idParam = _.find(options.idParamMatchers, function (matcher) {
                return match === matcher;
            });

            if (idParam) {
                order = 1;
                routeString += '/:id';
                if (options.idParamRegexMatch) {
                    routeString += '(' + options.idParamRegexMatch + ')';
                }
            }

            if (requiredFile.urlPattern) {
                routeString = requiredFile.urlPattern;
                order = 0;
            }

            var routeObject = {
                name: controllerName,
                method: method,
                routeString: routeString.toLowerCase(),
                order: order,
                controller: controller
            };

            var permission;
            if (requiredFile.permissionMiddleware) {
                routeObject.permissionMiddleware = requiredFile.permissionMiddleware;
                if (requiredFile.permission) {
                    permission = requiredFile.permission;
                }
            }

            var fileMenu = requiredFile.menu;
            if (fileMenu) {
                if (fileMenu instanceof Array) {
                    fileMenu.forEach(function (menuObject) {
                        menuObject.controllerName = controllerName;
                        menuObject.method = method;
                        menuObject.path = routeString;
                        if (permission) menuObject.permission = permission;
                        cache.menu.push(menuObject);
                    });
                } else {
                    fileMenu.controllerName = controllerName;
                    fileMenu.method = method;
                    fileMenu.path = routeString;
                    if (permission) fileMenu.permission = permission;
                    cache.menu.push(fileMenu);
                }
            }

            cache.routes.push(routeObject);

            delete requiredFile.menu;
            delete requiredFile.controller;
            delete requiredFile.urlPattern;
            delete requiredFile.permission;
            delete requiredFile.permissionMiddleware;

            Object.keys(requiredFile).forEach(function (key) {
                if (typeof requiredFile[key] === 'function') {
                    var tempRouteString = routeString + '/' + key;
                    routeObject = {
                        name: requiredFile[key].name,
                        method: method,
                        routeString: tempRouteString.toLowerCase(),
                        order: order,
                        controller: requiredFile[key]
                    };
                    cache.routes.push(routeObject);
                } else {
                    cache.otter[key] = cache.otter[key] || [];
                    cache.otter[key].push(requiredFile[key]);
                }
            });
        }
    };
};