
export default function importData(neo4jSession, schema, callback){
console.log('importData', schema.name);
	if (schema.onlyRelationships) {
		console.log('not importing Data');
		return callback(null, null);
	}
	const cypherFields = schema.fields.reduce((acc,f) => {
		acc.push(`${f}: row.${f}`);
		return acc;
	},[])
	const cypherFieldsString = cypherFields.join(', ')
	const cypherQuery = 'USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM "file:///'+schema.name+'.csv" AS row CREATE (:'+schema.type+' {'+cypherFieldsString+'});';
	console.log(cypherQuery);

	neo4jSession
		.run(cypherQuery)
		.subscribe({
			onNext: function (record) {
			},
			onCompleted: function (record) {
				// console.log('record',record);
				// neo4jSession.close();
				callback(null, record)
			},
			onError: function (error) {
				console.log(error);
				callback(error, null)
			}
		});

}
