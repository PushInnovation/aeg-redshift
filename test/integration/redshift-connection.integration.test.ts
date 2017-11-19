import RedshiftConnection, { IRedshiftConnectionOptions } from '../../src/redshift-connection';
import * as should from 'should';
import { Segment, XrayLogger, samplingRules } from '@push_innovation/aeg-xray';
import logger from '@push_innovation/aeg-logger';
import * as BBPromise from 'bluebird';
import * as path from 'path';

samplingRules.setSamplingRules(path.join(__dirname, '../aeg-xray-config.json'));
XrayLogger.initialize(logger);

let options: IRedshiftConnectionOptions;
let connection: RedshiftConnection;
let segment: Segment;

before(async () => {

	segment = new Segment('test');

	options = {
		host: 'x',
		user: 'x',
		password: 'x',
		port: 5439,
		database: 'production',
		segment
	};

	connection = new RedshiftConnection(options);

});

after(async () => {

	segment.close();
	await connection.dispose();
	await BBPromise.delay(1000);

});

describe('redshift connection', async () => {

	describe('#query', async () => {

		it('should return without error', async () => {

			const result = await connection.query('SELECT * FROM hitpath_importer.merge LIMIT 10');

			should.exist(result);
			should(result.rows).be.instanceOf(Array);
			should(result.rows.length).be.greaterThan(0);

		});

	});

	describe('#withConnection', async () => {

		it('should return without error', async () => {

			const result = await RedshiftConnection.withConnection(async (redshift) => {

				return await redshift.query('SELECT * FROM hitpath_importer.merge LIMIT 10');

			}, options);

			should.exist(result);
			should(result.rows).be.instanceOf(Array);
			should(result.rows.length).be.greaterThan(0);

		});

	});

	describe('#withTransaction', async () => {

		it('should return without error', async () => {

			const result = await RedshiftConnection.withTransaction(async (redshift) => {

				return await redshift.query('SELECT * FROM hitpath_importer.merge LIMIT 10');

			}, options);

			should.exist(result);
			should(result.rows).be.instanceOf(Array);
			should(result.rows.length).be.greaterThan(0);

		});

	});

});
