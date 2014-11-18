exports.menu = [{
    rootNavigation: 'Sales',
    subMenuName: 'Bids__and__Quotes',
    newWindow: true
}, {
    rootNavigation: 'Test',
    subMenuName: 'Dog',
    newWindow: false
}];
exports.permission = 'AddMenuTest';
exports.permissionMiddleware = require('../../../middleware').lookup(this.permission);

exports.controller = function AddMenuTest(req, res) {
    res.json({});
};