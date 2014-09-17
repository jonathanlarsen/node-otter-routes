exports.urlPattern = '/urloverrides/:this_is_my_id';

exports.controller = function GetUrlOverride(req, res) {
    res.json({this_is_my_id: req.params.this_is_my_id});
};