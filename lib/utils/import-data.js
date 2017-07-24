'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = importData;
function importData(neo4jSession, schema, callback) {
	console.log('importData', schema.name);
	if (schema.onlyRelationships) {
		console.log('not importing Data');
		return callback(null, null);
	}
	var cypherFields = schema.fields.reduce(function (acc, f) {
		acc.push(f + ': row.' + f);
		return acc;
	}, []);
	var cypherFieldsString = cypherFields.join(', ');
	var cypherQuery = 'USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM "file:///' + schema.name + '.csv" AS row CREATE (:' + schema.type + ' {' + cypherFieldsString + '});';
	console.log(cypherQuery);

	neo4jSession.run(cypherQuery).subscribe({
		onNext: function onNext(record) {},
		onCompleted: function onCompleted(record) {
			// console.log('record',record);
			// neo4jSession.close();
			callback(null, record);
		},
		onError: function onError(error) {
			console.log(error);
			callback(error, null);
		}
	});
}