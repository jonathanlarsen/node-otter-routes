var permission = 'admin';

exports.menu = {
    title: 'Permissions'
};

exports.permission = permission;
exports.permissionMiddleware = function(req, res, next) {
    if (req.query.permission === permission) {
        next();
    } else {
        res.status(401).end();
    }
};

exports.controller = function GetPermission(req, res) {
    res.send("app.get('/basic?permission=admin')");
};