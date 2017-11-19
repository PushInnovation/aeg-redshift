import { IQueryOptions, IRedshiftQueryable } from './types';
import { QueryResult } from 'pg';

export abstract class Redshift implements IRedshiftQueryable {

	private _isDisposed: boolean;

	constructor () {

		this._isDisposed = false;

	}

	get disposed (): boolean {

		return this._isDisposed;

	}

	public async dispose (): Promise<void> {

		this._isDisposed = true;

	}

	public abstract async query (query: string, options?: IQueryOptions): Promise<QueryResult>;

	public abstract async queryWithArgs (
		query: string,
		params: Array<string | number>,
		options?: IQueryOptions): Promise<QueryResult>;

}
