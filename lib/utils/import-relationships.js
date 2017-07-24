'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = importRelationships;

var _readCsvJson = require('read-csv-json');

var _readCsvJson2 = _interopRequireDefault(_readCsvJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('../../config.js');

function importRelationships(neo4jSession, schema, callback) {
	console.log('importRelationships');
	var csvRead = new _readCsvJson2.default(config.importLocation + '/' + schema.name + '.csv', schema.fields);
	csvRead.getCSVJson().then(function (result) {

		for (var i = 0; i < schema.relationships.length; i++) {
			var rel = schema.relationships[i];
			var matchA = 'MATCH (a:' + rel.a.type + ' {' + rel.a.key + ': row.' + rel.a.rowKey + '})';
			var matchB = 'MATCH (b:' + rel.b.type + ' {' + rel.b.key + ': row.' + rel.b.rowKey + '})';
			var condition = rel.existsIfTrue ? 'WHERE row.' + rel.existsIfTrue.rowKey + ' = "' + rel.existsIfTrue.value + '"' : '';
			var relation = 'MERGE (a)' + rel.direction.a + '-[r:' + rel.name + ']-' + rel.direction.b + '(b)';
			var relationData = rel.data ? rel.data.map(function (d) {
				return 'ON CREATE SET r.' + d + ' = row.' + d + ' ';
			}) : '';
			var relationQuery = matchA + ' ' + matchB + ' ' + condition + ' ' + relation + ' ' + relationData;
			console.log('relationQuery', relationQuery);
			neo4jSession.run('USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM "file:///' + schema.name + '.csv" AS row ' + relationQuery + ';').subscribe({
				onNext: function onNext(record) {
					// console.log(record.get('name'));
				},
				onCompleted: function onCompleted(record) {
					// console.log(record);
					// neo4jSession.close();
					callback(null, record);
				},
				onError: function onError(error) {
					console.log(error);
					callback(error, null);
				}
			});
		}
		// callback()
	}, function (err) {
		console.log('err: ', err);
		callback();
	});
}