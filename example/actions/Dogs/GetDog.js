module.exports = function GetDog(req, res) {
    res.json({message: 'GetDog, id: ' + req.params.id});
};