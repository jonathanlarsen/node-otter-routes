module.exports = function ViewSubForParent(req, res) {
    res.send("app.get('/nested/" + req.params.parentid + "/sub/" + req.params.id + "')");
};