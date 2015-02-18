exports.urlPattern = '/domyownthing';

exports.controller = function GetCustomUrl(req, res) {
    res.send("app.get('/domyownthing')");
};