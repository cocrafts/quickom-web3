import { handleIncomingHook } from './resolvers/hook';

const defaultHeaders = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Headers':
		'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Allow-Origin': '*',
};

/* eslint-disable-next-line */
export const handler = async (event: any) => {
	const httpContext = event.requestContext?.http || {};
	const body = event.body;
	const payload = JSON.parse(body);

	if (httpContext.method === 'POST') {
		if (httpContext.path === '/hook') {
			return runResolver(() => handleIncomingHook(payload));
		}
	}

	return {
		statusCode: 200,
		headers: defaultHeaders,
	};
};

const runResolver = async (func: () => Promise<object>) => {
	try {
		const result = await func();
		return {
			statusCode: 200,
			headers: defaultHeaders,
			body: JSON.stringify(result),
		};
	} catch (error) {
		return {
			statusCode: 400,
			headers: defaultHeaders,
			body: JSON.stringify({ error, message: String(error) }),
		};
	}
};
