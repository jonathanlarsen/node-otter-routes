exports.controller = function ListPermissions(req, res) {
    res.json({message: 'List Permissions'});
};

exports.permission = function ListPermissionsPermission(req, res, next) {
    if (req.query.dog === 'cat') {
        next();
    } else {
        next(new Error('Unauthorized'));
    }
};