import Promise from 'bluebird';
const MongoClient = require('mongodb').MongoClient;

import config from '../config.js';
import importSchemas from '../import-schemas.js';

const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver(config.neo.url, neo4j.auth.basic(config.neo.username, config.neo.password));
driver.onError = function (error) {
  console.log('Driver instantiation failed', error);
};
const neo4jSession = driver.session();

import exportData from './utils/export-data.js';
import importData from './utils/import-data.js';
import importRelationships from './utils/import-relationships.js';

const importDataPromise = Promise.promisify(importData)
const importRelationshipsPromise = Promise.promisify(importRelationships)
const exportDataPromise = Promise.promisify(exportData)


MongoClient.connect(config.mongo.url, function(err, db) {

	return Promise.all(importSchemas.map(s => exportDataPromise(db, s)))
		.then(r => {
			Promise.all(importSchemas.map(s => importDataPromise(neo4jSession, s)))
			.then(r => {
				Promise.all(importSchemas.map(s => importRelationshipsPromise(neo4jSession, s)))
				.then(r => {
				})
				.catch(e => {
					console.log('error importing relationships',e);
				})

			})
			.catch(e => {
				console.log('error importing data',e);
			})

		})
		.catch(e => {
			console.log('error exporting data',e);
		})

});
