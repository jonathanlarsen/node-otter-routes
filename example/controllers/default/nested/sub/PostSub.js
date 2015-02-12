module.exports = function PostSub(req, res) {
    res.send("app.post('/nested/sub')");
};