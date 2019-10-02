module.exports = function UpdateBasic(req, res) {
    res.send("app.put('/basic/" + req.params.id + "')");
};