module.exports = function DestroyBasic(req, res) {
    res.send("app.delete('/basic/" + req.params.id + "')");
};