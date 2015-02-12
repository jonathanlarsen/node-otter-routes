var otter = require('../'),
    assert = require('assert'),
    path = require('path'),
    request = require('request'),
    express = require('express'),
    port = 9001,
    api = 'http://localhost:' + port;

function rand() {
    return Math.floor((Math.random() * 100) + 1);
}

describe('Otter Routes', function () {
    describe('no directory', function () {
        var config = {},
            app = express();

        it('should throw an error without directory set', function () {
            otter(app, config, function(err) {
                assert.equal(err, 'Unable to resolve controller directory. Please set options.directory or create a directory named controllers.');
            });
        });
    });

    describe('default', function () {
        var otterResults, server,
            express = require('express'),
            app = express(),
            randId = rand(),
            randParentId = rand(),
            config = {
                directory: path.resolve('./example/controllers/default')
            };

        before(function (done) {
            otter(app, config, function (err, results) {
                otterResults = results;
                server = app.listen(port, done);
            });
        });

        after(function (done) {
            server.close(done);
        });

        it('should have 17 routes', function () {
            assert.equal(otterResults.routes.length, 17);
        });

        it("should return app.get('/basic')", function (done) {
            request.get(api + '/basic', function (err, response, body) {
                assert.equal(body, "app.get('/basic')");
                done();
            });
        });

        it("should return app.put('/basic')", function (done) {
            request.put(api + '/basic', function (err, response, body) {
                assert.equal(body, "app.put('/basic')");
                done();
            });
        });

        it("should return app.post('/basic')", function (done) {
            request.post(api + '/basic', function (err, response, body) {
                assert.equal(body, "app.post('/basic')");
                done();
            });
        });

        it("should return app.delete('/basic')", function (done) {
            request.del(api + '/basic', function (err, response, body) {
                assert.equal(body, "app.delete('/basic')");
                done();
            });
        });

        it("should return app.get('/controller')", function (done) {
            request.get(api + '/controller', function (err, response, body) {
                assert.equal(body, "app.get('/controller')");
                done();
            });
        });

        it("should return app.put('/controller')", function (done) {
            request.put(api + '/controller', function (err, response, body) {
                assert.equal(body, "app.put('/controller')");
                done();
            });
        });

        it("should return app.post('/controller')", function (done) {
            request.post(api + '/controller', function (err, response, body) {
                assert.equal(body, "app.post('/controller')");
                done();
            });
        });

        it("should return app.delete('/controller')", function (done) {
            request.del(api + '/controller', function (err, response, body) {
                assert.equal(body, "app.delete('/controller')");
                done();
            });
        });

        it("should return app.get('/nested/" + randParentId + "/sub')", function (done) {
            request.get(api + '/nested/' + randParentId + '/sub', function (err, response, body) {
                assert.equal(body, "app.get('/nested/" + randParentId + "/sub')");
                done();
            });
        });

        it("should return app.get('/menu')", function (done) {
            request.get(api + '/menu', function (err, response, body) {
                assert.equal(body, "app.get('/menu')");
                done();
            });
        });

        it("should return menu object on otterResults", function() {
            var menuItem = otterResults.menu[0];
            assert.equal(otterResults.menu.length, 2);
            assert.equal(menuItem.path, '/menu');
            assert.equal(menuItem.controllerName, 'GetMenu');
            assert.equal(menuItem.title, 'Basic Menu');
            assert.equal(menuItem.icon, 'homeIcon');
        });

        it ("should return app.get('/customurl/" + randParentId + "/" + randId + "')", function(done) {
            request.get(api + '/customurl/' + randParentId + '/' + randId, function(err, response, body) {
                assert.equal(body, "app.get('/customurl/" + randParentId + "/" + randId + "')");
                done();
            });
        });

        it ("should return app.get('/customurl/" + randParentId + "/" + randId + "')", function(done) {
            request.get(api + '/customurl/' + randParentId + '/' + randId, function(err, response, body) {
                assert.equal(body, "app.get('/customurl/" + randParentId + "/" + randId + "')");
                done();
            });
        });

        it ("should return app.get('/customexportfunction')", function(done) {
            request.get(api + '/customexportfunction', function(err, response, body) {
                assert.equal(body, "app.get('/customexportfunction')");
                done();
            });
        });

        it ("should return app.get('/customexportfunction/custom')", function(done) {
            request.get(api + '/customexportfunction/custom', function(err, response, body) {
                assert.equal(body, "app.get('/customexportfunction/custom')");
                done();
            });
        });

        it ("should return custom object on otterResults", function() {
            var customItem = otterResults.custom[0];
            assert.equal(customItem.bacon, 'bits');
        });

        it("should return 401 without correct permission querystring", function(done) {
            request.get(api + '/permission', function(err, response, body) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });

        it("should return app.get('/basic?permission=admin') when permission querystring is present", function(done) {
            request.get(api + '/permission?permission=admin', function(err, response, body) {
                assert.equal(body, "app.get('/basic?permission=admin')");
                done();
            });
        });

        it("should have added permission name to menu item", function() {
            var menuItem = otterResults.menu[1];
            assert.equal(menuItem.permission, 'admin');
        });
    });

    describe('custom methods', function () {
        var otterResults, server,
            app = express(),
            randId = rand(),
            randParentId = rand(),
            config = {
                directory: path.resolve('./example/controllers/customMethods'),
                idParamMatchers: ['destroy', 'view', 'update'],
                methods: {
                    'list': 'get',
                    'view': 'get',
                    'update': 'put',
                    'destroy': 'delete'
                }
            };

        before(function (done) {
            otter(app, config, function (err, results) {
                otterResults = results;
                server = app.listen(port, done);
            });
        });

        after(function (done) {
            server.close(done);
        });

        it('should have 6 routes with custom methods and idParamMatchers', function () {
            otter(app, config, function (err, results) {
                assert.equal(results.routes.length, 6);
            });
        });

        it("should return app.get('/basic/" + randId + "')", function (done) {
            request.get(api + '/basic/' + randId, function (err, response, body) {
                assert.equal(body, "app.get('/basic/" + randId + "')");
                done();
            });
        });

        it("should return app.put('/basic/" + randId + "')", function (done) {
            request.put(api + '/basic/' + randId, function (err, response, body) {
                assert.equal(body, "app.put('/basic/" + randId + "')");
                done();
            });
        });

        it("should return app.get('/basic')", function (done) {
            request.get(api + '/basic', function (err, response, body) {
                assert.equal(body, "app.get('/basic')");
                done();
            });
        });

        it("should return app.delete('/basic/" + randId + "')", function (done) {
            request.del(api + '/basic/' + randId, function (err, response, body) {
                assert.equal(body, "app.delete('/basic/" + randId + "')");
                done();
            });
        });

        it("should return app.get('/nested/" + randParentId + "/sub/" + randId + "')", function (done) {
            request.get(api + '/nested/' + randParentId + '/sub/' + randId, function (err, response, body) {
                assert.equal(body, "app.get('/nested/" + randParentId + "/sub/" + randId + "')");
                done();
            });
        });

        it("should return app.put('/nested/sub/" + randId + "')", function (done) {
            request.put(api + '/nested/sub/' + randId, function (err, response, body) {
                assert.equal(body, "app.put('/nested/sub/" + randId + "')");
                done();
            });
        });

        it("should not be able to delete without id", function (done) {
            request.del(api + '/basic', function (err, response, body) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });

        it("should not be able to put without id", function (done) {
            request.put(api + '/basic', function (err, response, body) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
    });

    describe('override ForParent', function() {
        var otterResults, server,
            app = express(),
            randId = rand(),
            randParentId = rand(),
            config = {
                directory: path.resolve('./example/controllers/customParentIdParamMatch'),
                parentIdParamMatch: 'ParaLosPadres'
            };

        before(function (done) {
            otter(app, config, function (err, results) {
                otterResults = results;
                server = app.listen(port, done);
            });
        });

        after(function (done) {
            server.close(done);
        });

        it("should return app.get('/nested/" + randParentId + "/sub')", function(done) {
            request.get(api + '/nested/' + randParentId + '/sub', function(err, response, body) {
                assert.equal(body, "app.get('/nested/" + randParentId + "/sub')");
                done();
            });
        });
    });

    describe('diagnostics', function () {
        var otterResults, server,
            app = express(),
            config = {
                directory: path.resolve('./example/controllers/diagnostics'),
                diagnostics: true
            };

        before(function (done) {
            otter(app, config, function (err, results) {
                otterResults = results;
                server = app.listen(port, done);
            });
        });

        after(function (done) {
            server.close(done);
        });

        it('should have length of 1 when accessing /_otter/routes', function (done) {
            request.get(api + '/_otter/routes', function (err, response, body) {
                assert.equal(JSON.parse(body).length, 1);
                done();
            });
        });
    });

    describe('invalid controller', function () {
        var otterResults, server,
            app = express(),
            config = {
                directory: path.resolve('./example/controllers/invalidController')
            };

        before(function (done) {
            otter(app, config, function (err, results) {
                otterResults = results;
                server = app.listen(port, done);
            });
        });

        after(function (done) {
            server.close(done);
        });

        it('should ignore the route with an invalid controller', function (done) {
            request.get(api + '/error', function (err, response, body) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
    });
});