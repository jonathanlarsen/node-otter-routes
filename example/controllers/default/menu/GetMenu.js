/*
 * The following menu properties are automatically set by Otter Routes
 * menu.controllerName
 * menu.method
 * menu.path
 */

exports.menu = {
    title: 'Basic Menu',
    icon: 'homeIcon'
};

exports.controller = function GetMenu(req, res) {
    res.send("app.get('/menu')");
};