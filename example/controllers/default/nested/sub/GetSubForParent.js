module.exports = function GetSubForParent(req, res) {
    res.send("app.get('/nested/"+ req.params.parentid +"/sub')");
};