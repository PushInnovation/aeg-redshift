import { Segment, SegmentSqlData, SubSegment } from '@push_innovation/aeg-xray';

export default async (
	client: any,
	query: string,
	params: any = [],
	options: { emitProgress?: boolean, segment?: Segment | undefined } = {}): Promise<any> => {

	if (options.segment) {

		const sub = openSubSegment(client.connectionParameters || client.options, query, options.segment, options);

		return new Promise((resolve, reject) => {

			client.query(query, params, (err, result) => {

				if (err) {

					sub.close(err);
					reject(err);

				} else {

					sub.close();
					resolve(result);

				}

			});

		});

	} else {

		return new Promise((resolve, reject) => {

			client.query(query, params, (err, result) => {

				if (err) {

					reject(err);

				} else {

					resolve(result);

				}

			});

		});

	}

};

function openSubSegment (
	config: any,
	query: string,
	segment: Segment,
	options: { emitProgress?: boolean } = {}): SubSegment {

	const sub = segment.addSubSegment(config.database + '@' + config.host, options);
	sub.addSqlData = new SegmentSqlData(config.user, config.host + ':' + config.port + '/' + config.database, {query});
	return sub;

}
