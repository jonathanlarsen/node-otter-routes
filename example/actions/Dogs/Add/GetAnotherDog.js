module.exports = function GetAnotherDog(req, res) {
    res.json({message: 'GetAnotherDog, id: ' + req.params.id});
};