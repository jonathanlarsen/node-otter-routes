exports.controller = function ListAggregates(req, res) {
    res.json({message: 'ListAggregates'});
};

exports.aggregate = function ListAggregatesAggregate(req, res) {
    res.json({message: 'ListAggregates', aggregate: true});
};

exports.test = function ListAggregatesTest(req, res) {
    res.json({message: 'ListAggregates', test: true});
};