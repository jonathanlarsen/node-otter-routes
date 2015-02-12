var router = require('express').Router(),
    cache = require('./cache');

module.exports = function OtterDiagnostics(app, done) {
    router.get('/routes', function(req, res) {
        res.json(cache.routes);
    });

    app.use('/_otter', router);

    if (done) done(null, cache.otter);
};