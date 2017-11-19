import * as pg from 'pg';
import { Redshift } from './redshift';
import { Client, QueryResult } from 'pg';
import Segment from '@adexchange/aeg-xray/lib/segment';
import queryWrapper from './query-wrapper';
import { IQueryOptions } from './types';

pg.types.setTypeParser(1114, (stringValue) => {

	return stringValue;

});

pg.types.setTypeParser(1082, (stringValue) => {

	return stringValue;

});

export interface IRedshiftConnectionOptions extends IQueryOptions {
	user?: string;
	password?: string;
	port?: number;
	host?: string;
	database?: string;
	client?: Client;
}

enum ClientType {
	pooled,
	single
}

export default class RedshiftConnection extends Redshift {

	public static async withConnection (
		delegate: (connection: RedshiftConnection) => Promise<any>,
		options: IRedshiftConnectionOptions) {

		const connection = new RedshiftConnection(options);

		if (connection.disposed) {

			throw new Error('Not connected');

		}

		if (connection._clientType === ClientType.single && !connection._connected) {

			await connection._client.connect();
			connection._connected = true;

		}

		try {

			return await delegate(connection);

		} finally {

			// do not close the client if its not managed here
			if (!options.client) {

				await connection.dispose();

			}

		}

	}

	public static async withTransaction (
		delegate: (connection: RedshiftConnection) => Promise<any>,
		options: IRedshiftConnectionOptions) {

		const connection = new RedshiftConnection(options);

		if (connection.disposed) {

			throw new Error('Not connected');

		}

		if (connection._clientType === ClientType.single && !connection._connected) {

			await connection._client.connect();
			connection._connected = true;

		}

		try {

			await connection.query('BEGIN');
			const result = await delegate(connection);
			await connection.query('END');
			return result;

		} catch (ex) {

			await connection.query('ABORT');

			throw ex;

		} finally {

			// do not close the client if its not managed here
			if (!options.client) {

				await connection.dispose();

			}

		}

	}

	private _client: Client;

	private _clientType: ClientType;

	private _connected: boolean;

	private _segment?: Segment;

	private _emitProgress: boolean;

	constructor (options: IRedshiftConnectionOptions) {

		super();

		this._segment = options.segment;
		this._emitProgress = options.emitProgress || false;

		if (options.client) {

			this._clientType = ClientType.pooled;
			this._client = options.client;
			this._connected = true;

		} else {

			this._clientType = ClientType.single;
			this._client = new Client(options);
			this._connected = false;

		}

	}

	public async query (query: string): Promise<QueryResult> {

		if (this.disposed) {

			throw new Error('Not connected');

		}

		if (this._clientType === ClientType.single && !this._connected) {

			await this._client.connect();
			this._connected = true;

		}

		return queryWrapper(this._client, query, [], {segment: this._segment, emitProgress: this._emitProgress});

	}

	public async queryWithArgs (query: string, params: Array<string | number> = []): Promise<QueryResult> {

		if (this.disposed) {

			throw new Error('Not connected');

		}

		if (this._clientType === ClientType.single && !this._connected) {

			await this._client.connect();
			this._connected = true;

		}

		return queryWrapper(this._client, query, params, {segment: this._segment, emitProgress: this._emitProgress});

	}

	public async dispose (): Promise<void> {

		await super.dispose();

		if (this._clientType === ClientType.pooled) {

			await this._client.release();

		} else {

			await this._client.end();

		}

	}

}
