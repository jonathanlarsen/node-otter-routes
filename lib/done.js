var express = require('express'),
    _ = require('lodash'),
    cache = require('./cache');

module.exports = function doneCallback(app, options, done) {
    return function (err) {
        if (err && done) return done(err);

        var router = new express.Router();

        cache.routes = _.sortBy(cache.routes, 'order');

        cache.routes.forEach(function (route) {

            if (route.permissionMiddleware) {
                router[route.method](route.routeString, route.permissionMiddleware, route.controller);
            } else {
                router[route.method](route.routeString, route.controller);
            }
        });

        app.use(router);

        if (cache.menu.length) cache.otter.menu = cache.menu;
        if (cache.routes.length) cache.otter.routes = cache.routes;

        if (options.diagnostics) {
            require('./diagnostics')(app, done);
        } else {
            if (done) done(null, cache.otter);
        }
    };
};