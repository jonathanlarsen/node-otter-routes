var router = require('express').Router(),
    setFunctionName = require('function-name'),
    _ = require('lodash');

exports = module.exports = function OtterDiagnostics(app, router, options, next) {
    app.OtterRoutes = app.OtterRoutes || {};

    router.stack.forEach(function(router) {
        app.OtterRoutes[router.name] = {};
        router.handle.stack.forEach(function(handle) {
            var route = handle.route.stack[0];
            app.OtterRoutes[router.name][route.name] = {
                method: route.method,
                path: handle.route.path
            };
        });
    });

    router.get('/diagnostics', function(req, res) {
        res.json(app.OtterRoutes);
    });

    setFunctionName(router, 'OtterDiagnostics');
    app.use('/_otter', router);

    if (next) next();
};