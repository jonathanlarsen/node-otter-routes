module.exports = function UpdateSub(req, res) {
    res.send("app.put('/nested/sub/" + req.params.id + "')");
};