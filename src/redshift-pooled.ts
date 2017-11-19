import * as pg from 'pg';
import { Pool, QueryResult } from 'pg';
import { Redshift } from './redshift';
import RedshiftConnection from './redshift-connection';
import { IQueryOptions } from './types';
import queryWrapper from './query-wrapper';

pg.types.setTypeParser(1114, (stringValue) => {

	return stringValue;

});

pg.types.setTypeParser(1082, (stringValue) => {

	return stringValue;

});

export interface IRedshiftPooledOptions {
	user: string;
	password: string;
	port: number;
	host: string;
	database: string;
	max?: number;
}

export default class RedshiftPooled extends Redshift {

	private _pool: Pool;

	constructor (options: IRedshiftPooledOptions) {

		super();

		this._pool = new pg.Pool(options);

	}

	public async withTransaction (
		delegate: (connection: RedshiftConnection) => Promise<any>,
		options: IQueryOptions = {}) {

		if (this.disposed) {

			throw new Error('Not connected');

		}

		const client = await this._pool.connect();
		const result = RedshiftConnection.withTransaction(delegate, Object.assign({}, {client}, options));
		client.release();

		return result;

	}

	public async query (
		query: string,
		options: IQueryOptions = {}): Promise<QueryResult> {

		if (this.disposed) {

			throw new Error('Not connected');

		}

		return queryWrapper(this._pool, query, [], options);

	}

	public async queryWithArgs (
		query: string,
		params: Array<string | number>,
		options: IQueryOptions = {}): Promise<QueryResult> {

		if (this.disposed) {

			throw new Error('Not connected');

		}

		return queryWrapper(this._pool, query, params, options);

	}

	public async dispose (): Promise<void> {

		await super.dispose();
		await this._pool.end();

	}

}
