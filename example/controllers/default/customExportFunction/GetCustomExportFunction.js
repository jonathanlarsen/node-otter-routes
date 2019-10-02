exports.custom = function(req, res) {
    res.send("app.get('/customexportfunction/custom')");
};

exports.controller = function GetCustomExportFunction(req, res) {
    res.send("app.get('/customexportfunction')");
};