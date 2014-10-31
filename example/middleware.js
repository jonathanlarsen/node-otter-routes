exports.lookup = function permissionLookup(permission) {
    return function(req, res, next) {
        if (permission === 'AddMenuTest') {
            next();
        } else {
            res.end('unauthorized');
        }
    };
};