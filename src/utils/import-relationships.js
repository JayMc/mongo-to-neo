import csvModule from 'read-csv-json';
const config = require('../../config.js');

export default function importRelationships(neo4jSession, schema, callback) {
console.log('importRelationships');
	const csvRead = new csvModule(`${config.importLocation}/${schema.name}.csv`, schema.fields);
	csvRead.getCSVJson().then(function(result){

		for (let i = 0; i < schema.relationships.length; i++) {
			const rel = schema.relationships[i];
			const matchA = 'MATCH (a:'+rel.a.type+' {'+rel.a.key+': row.'+rel.a.rowKey+'})';
			const matchB = 'MATCH (b:'+rel.b.type+' {'+rel.b.key+': row.'+rel.b.rowKey+'})';
			const condition = rel.existsIfTrue ? 'WHERE row.'+rel.existsIfTrue.rowKey+' = "'+rel.existsIfTrue.value+'"' : '';
			const relation = 'MERGE (a)'+rel.direction.a+'-[r:'+rel.name+']-'+rel.direction.b+'(b)';
			const relationData = rel.data ? rel.data.map(d => 'ON CREATE SET r.'+d+' = row.'+d+' ') : '';
			const relationQuery = matchA+' '+matchB+' '+condition+' '+relation+' '+relationData;
			console.log('relationQuery',relationQuery);
			neo4jSession
				.run('USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM "file:///'+schema.name+'.csv" AS row '+relationQuery+';')
				.subscribe({
					onNext: function (record) {
						// console.log(record.get('name'));
					},
					onCompleted: function (record) {
						// console.log(record);
						// neo4jSession.close();
						callback(null, record)
					},
					onError: function (error) {
						console.log(error);
						callback(error, null)
					}
				});

		}
		// callback()
	},function(err){
		console.log('err: ', err)
		callback()
	});
}
