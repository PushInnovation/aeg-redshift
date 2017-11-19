import { Client, ClientConfig, Pool, PoolConfig, QueryResult } from 'pg';
import * as pgTypes from 'pg-types';
import Segment from '@adexchange/aeg-xray/lib/segment';

export interface IRedshiftClient {
	Pool: new (options: PoolConfig) => Pool;
	Client: new (options: ClientConfig) => Client;
	types: typeof pgTypes;
}

export interface IRedshiftQueryable {
	query (query: string, options?: IQueryOptions): Promise<QueryResult>;
	queryWithArgs (query: string, params?: Array<string | number>, options?: IQueryOptions): Promise<QueryResult>;
}

export interface IQueryOptions {
	segment?: Segment;
	emitProgress?: boolean;
}
