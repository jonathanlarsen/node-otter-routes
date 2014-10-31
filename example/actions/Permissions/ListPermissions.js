exports.controller = function ListPermissions(req, res) {
    res.json({message: 'List Permissions'});
};

exports.permissionMiddleware = function ListPermissions(req, res, next) {
    if (req.query.dog === 'cat') {
        next();
    } else {
        res.end('Unauthorized');
    }
};