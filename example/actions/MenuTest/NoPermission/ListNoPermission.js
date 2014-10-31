exports.menu = {
    rootNavigation: 'Sales',
    subMenuName: 'Bids__and__Quotes'
};

exports.controller = function ListNoPermission(req, res) {
    res.json();
};

exports.permissionMiddleware = null;