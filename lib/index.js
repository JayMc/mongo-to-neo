'use strict';

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _config = require('../config.js');

var _config2 = _interopRequireDefault(_config);

var _importSchemas = require('../import-schemas.js');

var _importSchemas2 = _interopRequireDefault(_importSchemas);

var _exportData = require('./utils/export-data.js');

var _exportData2 = _interopRequireDefault(_exportData);

var _importData = require('./utils/import-data.js');

var _importData2 = _interopRequireDefault(_importData);

var _importRelationships = require('./utils/import-relationships.js');

var _importRelationships2 = _interopRequireDefault(_importRelationships);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MongoClient = require('mongodb').MongoClient;

var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(_config2.default.neo.url, neo4j.auth.basic(_config2.default.neo.username, _config2.default.neo.password));
driver.onError = function (error) {
	console.log('Driver instantiation failed', error);
};
var neo4jSession = driver.session();

var importDataPromise = _bluebird2.default.promisify(_importData2.default);
var importRelationshipsPromise = _bluebird2.default.promisify(_importRelationships2.default);
var exportDataPromise = _bluebird2.default.promisify(_exportData2.default);

MongoClient.connect(_config2.default.mongo.url, function (err, db) {

	return _bluebird2.default.all(_importSchemas2.default.map(function (s) {
		return exportDataPromise(db, s);
	})).then(function (r) {
		_bluebird2.default.all(_importSchemas2.default.map(function (s) {
			return importDataPromise(neo4jSession, s);
		})).then(function (r) {
			_bluebird2.default.all(_importSchemas2.default.map(function (s) {
				return importRelationshipsPromise(neo4jSession, s);
			})).then(function (r) {}).catch(function (e) {
				console.log('error importing relationships', e);
			});
		}).catch(function (e) {
			console.log('error importing data', e);
		});
	}).catch(function (e) {
		console.log('error exporting data', e);
	});
});