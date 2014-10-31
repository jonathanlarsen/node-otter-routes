exports.menu = {
    rootNavigation: 'Sales',
    subMenuName: 'Bids__and__Quotes'
};

exports.controller = function ListMenuTests(req, res) {
    res.json({message: 'List Things'});
};

exports.permission = 'ListMenuTest';
exports.permissionMiddleware = require('../../middleware').lookup(this.permission);

