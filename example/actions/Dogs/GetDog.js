module.exports = function GetDog(req, res) {
    res.json({message: 'GetDog ' + req.params.id});
};