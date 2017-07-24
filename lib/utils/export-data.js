'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = exportData;

var _json2csv = require('json2csv');

var _json2csv2 = _interopRequireDefault(_json2csv);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('../../config.js');

function exportData(db, schema, callback) {
	console.log('exportData');

	db.collection(schema.mongoCollection).aggregate(schema.query).toArray(function (err, docs) {
		var exportData = docs.map(function (doc) {
			// for each field replace mongo ObjectId with string
			var newRow = schema.fields.reduce(function (acc, f) {
				acc['' + f] = schema.toStrings.indexOf(f) === -1 ? doc[f] : doc[f].toString();
				return acc;
			}, {});
			return newRow;
		});

		var csv = (0, _json2csv2.default)({
			data: exportData,
			fields: schema.fields
			// quotes: "",
			// doubleQuotes: ``,
		});

		_fs2.default.writeFile(config.importLocation + '/' + schema.name + '.csv', csv, function (err) {
			if (err) throw err;
			console.log('file saved');
			callback(err, docs);
		});
	});
}