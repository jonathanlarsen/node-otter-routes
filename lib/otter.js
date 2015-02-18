var walk = require('otter-walker'),
    path = require('path'),
    fs = require('fs'),
    fileCallback = require('./file'),
    doneCallback = require('./done'),
    cache = require('./cache');

module.exports = function Otter(app, options, done) {
    if (typeof options === 'function') {
        done = options;
        options = {};
    }

    var o = {
        idParamMatchers: options.idParamMatchers || options.fileMatchersForId || [],
        parentIdParamMatch: options.parentIdParamMatch || 'ForParent',
        diagnostics: options.diagnostics || false,
        methods: options.methods || {
            'get': 'get',
            'put': 'put',
            'post': 'post',
            'delete': 'delete'
        },

        methodRegexMatchers: []
    };

    if (!options.directory) {
        o.directory = fs.existsSync(path.resolve('./controllers')) ? path.resolve('./controllers') : null;
        if (!o.directory) {
            return done('Unable to resolve controller directory. Please set options.directory or create a directory named controllers.');
        }
    } else {
        o.directory = options.directory;
    }

    if (typeof o.directory !== 'string') {
        return done('Otter Routes: options.directory must be set to a string');
    }

    cache.menu = [];
    cache.routes = [];
    cache.otter = {};

    Object.keys(o.methods).forEach(function (key) {
        if (o.methods.hasOwnProperty(key)) {
            o.methodRegexMatchers.push(key);
        }
    });

    var root = process.cwd(),
        directory = path.resolve(root, o.directory);

    if (o.directory.lastIndexOf('/') !== -1) {
        o.directory = o.directory.substr(o.directory.lastIndexOf('/') + 1);
    } else if (o.directory.lastIndexOf('\\') !== -1) {
        o.directory = o.directory.substr(o.directory.lastIndexOf('\\') + 1);
    }

    walk(directory, fileCallback(o), doneCallback(app, o, done));
};