module.exports = function GetBasic(req, res) {
    res.send("app.get('/basic/" + req.params.id + "([0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$)");
};