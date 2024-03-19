import { existsSync, readFileSync } from 'fs';

import { parse as parseEnvironment } from 'dotenv';
import type { SSTConfig } from 'sst';
import type { StackContext } from 'sst/constructs';
import { Api, Function } from 'sst/constructs';

export const Relayer = ({ stack, app }: StackContext) => {
	const environment = environmentFromStage(app.stage);
	const handlerFunction = new Function(stack, 'relayer', {
		handler: 'lambda.handler',
		environment,
	});

	const relayer = new Api(stack, 'relayer', {
		cors: {
			allowOrigins: ['*'],
			allowHeaders: ['Content-Type', 'Authorization'],
			allowMethods: ['GET', 'POST'],
		},
		routes: {
			'POST /hook': {
				function: handlerFunction,
			},
		},
	});

	stack.addOutputs({
		relayerUrl: relayer.url,
	});
};

const environmentFileMap: Record<string, string> = {
	production: '.env.production',
	staging: '.env.staging',
	development: '.env.development',
};

const environmentFromStage = (stage: string): Record<string, string> => {
	const envFile = environmentFileMap[stage] || environmentFileMap.development;
	let environmentBuf: Buffer;

	if (existsSync(envFile)) {
		environmentBuf = readFileSync(envFile);
	} else if (existsSync('.env')) {
		environmentBuf = readFileSync('.env');
	} else {
		return {};
	}

	return parseEnvironment(environmentBuf);
};

export default {
	config() {
		return {
			name: 'quickom-web3',
			region: 'ap-south-1',
		};
	},
	stacks(app) {
		app.stack(Relayer);
	},
} satisfies SSTConfig;