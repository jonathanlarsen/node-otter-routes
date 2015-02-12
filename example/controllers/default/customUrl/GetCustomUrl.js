exports.urlPattern = '/customurl';

exports.controller = function GetCustomUrl(req, res) {
    res.send("app.get('/customurl')");
};