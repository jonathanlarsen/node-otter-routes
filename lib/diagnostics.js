var router = require('express').Router();

module.exports = function OtterDiagnostics(app, diagnostics, next) {
    router.get('/diagnostics', function(req, res) {
        res.json(app.diagnostics);
    });

    app.use('/_otter', router);

    if (next) next();
};