module.exports = function ViewBasic(req, res) {
    res.send("app.get('/basic/" + req.params.id + "')");
};