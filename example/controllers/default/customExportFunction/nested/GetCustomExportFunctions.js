exports.controller = function GetCustomExportFunction(req, res) {
    res.send("app.get('/customexportfunction/nested')");
};

exports.custom = function(req, res) {
    res.send("app.get('/customexportfunction/nested/custom')");
};

exports.custom2 = function(req, res) {
    res.send("app.get('/customexportfunction/nested/custom2')");
};