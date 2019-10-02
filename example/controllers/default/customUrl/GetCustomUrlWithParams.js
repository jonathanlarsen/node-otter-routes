exports.urlPattern = '/customurl/:first/:second';

exports.controller = function GetCustomUrlWithParams(req, res) {
    res.send("app.get('/customurl/" + req.params.first + "/" + req.params.second + "')");
};