import json2csv  from 'json2csv';
import fs from 'fs';
const config = require('../../config.js');

export default function exportData (db, schema, callback) {
	console.log('exportData');

	db.collection(schema.mongoCollection).aggregate(schema.query)
		.toArray(function(err, docs){
			const exportData = docs.map(doc => {
				// for each field replace mongo ObjectId with string
				const newRow = schema.fields.reduce((acc, f) => {
					acc[`${f}`] = schema.toStrings.indexOf(f) === -1 ? doc[f] : doc[f].toString();
					return acc
				}, {});
				return newRow;
			});

			const csv = json2csv({
				data: exportData,
				fields: schema.fields,
				// quotes: "",
				// doubleQuotes: ``,
			});

			fs.writeFile(`${config.importLocation}/${schema.name}.csv`, csv, function(err) {
				if (err) throw err;
				console.log('file saved');
				callback(err, docs);
			})
	})
}
