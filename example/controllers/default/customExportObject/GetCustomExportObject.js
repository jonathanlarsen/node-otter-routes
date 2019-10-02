exports.custom = {
    bacon: 'bits'
};

exports.controller = function GetCustomExportObject(req, res) {
    res.send("app.get('/customexportobject')");
};