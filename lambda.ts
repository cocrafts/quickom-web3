import { handleGenerateKeyPair } from './resolvers/keypair';
import { handleEstimateFee, handleSendReward } from './resolvers/reward';

const defaultHeaders = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Headers':
		'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Allow-Origin': '*',
};

/* eslint-disable-next-line */
export const handler = async ({ body, rawPath, requestContext }: any) => {
	let requestPayload = {};
	const httpContext = requestContext?.http || {};
	const requestPath = httpContext.path || rawPath;
	console.log(httpContext.path, rawPath);

	if (httpContext.method === 'POST') {
		try {
			requestPayload = JSON.parse(body);
		} catch (error) {
			console.log('failed to parse request body:', error);
		}

		if (requestPath === '/send-reward') {
			return runResolver(() => handleSendReward(requestPayload as never));
		} else if (requestPath === '/estimate-fee') {
			return runResolver(() => handleEstimateFee(requestPayload as never));
		}
	} else if (httpContext.method === 'GET') {
		if (requestPath === '/keypair') {
			return runResolver(() => handleGenerateKeyPair());
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
