var setFunctionName = require('function-name'),
    _ = require('lodash');

exports = module.exports = function OtterDiagnostics(app, router, options, next) {
    app._otterRoutes = app._otterRoutes || {};

    router.stack.forEach(function(router) {
        app._otterRoutes[router.name] = {};
        router.handle.stack.forEach(function(handle) {
            var route = handle.route.stack[0];
            app._otterRoutes[router.name][route.name] = {
                method: route.method,
                path: handle.route.path
            };
        });
    });

    router.get('/diagnostics', function(req, res) {
        res.json(app._otterRoutes);
    });

    setFunctionName(router, 'OtterDiagnostics');
    app.use('/_otter', router);

    if (next) next();
};