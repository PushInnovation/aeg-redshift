import * as should from 'should';
import { Segment, XrayLogger, samplingRules } from '@adexchange/aeg-xray';
import logger from '@adexchange/aeg-logger';
import * as BBPromise from 'bluebird';
import RedshiftPooled, { IRedshiftPooledOptions } from '../../src/redshift-pooled';
import * as path from 'path';

samplingRules.setSamplingRules(path.join(__dirname, '../aeg-xray-config.json'));
XrayLogger.initialize(logger);

let options: IRedshiftPooledOptions;
let pool: RedshiftPooled;
let segment: Segment;

before(async () => {

	segment = new Segment('test');

	options = {
		host: 'x',
		user: 'x',
		password: 'x',
		port: 5439,
		database: 'production'
	};

	pool = new RedshiftPooled(options);

});

after(async () => {

	segment.close();
	await pool.dispose();
	await BBPromise.delay(1000);

});

describe('redshift pooled', async () => {

	describe('#withConnection', async () => {

		it('should return without error', async () => {

			const result = await pool!.query('SELECT * FROM hitpath_importer.merge LIMIT 10', {segment});

			should.exist(result);
			should(result.rows).be.instanceOf(Array);
			should(result.rows.length).be.greaterThan(0);

		});

	});

	describe('#withTransaction', async () => {

		it('should return without error', async () => {

			const result = await pool!.withTransaction(async (connection) => {

				return await connection.query('SELECT * FROM hitpath_importer.merge LIMIT 10');

			}, {segment});

			should.exist(result);
			should(result.rows).be.instanceOf(Array);
			should(result.rows.length).be.greaterThan(0);

		});

	});

});
