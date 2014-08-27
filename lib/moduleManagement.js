var router = require('express').Router(),
    setFunctionName = require('function-name'),
    _ = require('lodash');

exports = module.exports = function ModuleManagement(app, options, next) {
    router.get('/modules/remove/:module', function(req, res) {
        var moduleName = req.params.module;

        var otter = _.find(app._router.stack, function(x) {
            return x.name === 'Otter';
        });

        var module = _.find(otter.handle.stack, function(x) {
            return x.name === moduleName;
        });

        var stack = otter.handle.stack;
        var index = stack.indexOf(module);
        if (app.OtterRoutes) delete app.OtterRoutes[moduleName];
        stack.splice(index, 1);

        res.json({message: moduleName + ' removed'});
    });

    router.get('/modules/add/:module', function(req, res) {
        var moduleName = req.params.module;
        options.modules = moduleName;
        require('otter-routes')(app, options.directory, options, function() {
            res.json(moduleName + ' added');
        });
    });

    setFunctionName(router, 'OtterModuleManagement');
    app.use('/_otter', router);

    if (next) next();
};