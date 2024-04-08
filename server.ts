import cors from 'cors';
import type { Express } from 'express';

import { handleGenerateKeyPair } from './resolvers/keypair';
import { handleEstimateFee, handleSendReward } from './resolvers/reward';

/* eslint-disable-next-line */
export const configure = async (express: any) => {
	const app: Express = express();

	app.use(cors());
	app.use(express.json());

	app.post('/send-reward', async (req, res) => {
		try {
			const result = await handleSendReward(req.body);
			res.json(result);
		} catch (error) {
			return res.status(400).send({ error, message: String(error) });
		}
	});

	app.post('/estimate-fee', async (req, res) => {
		try {
			const result = await handleEstimateFee(req.body);
			res.json(result);
		} catch (error) {
			return res.status(400).send({ error, message: String(error) });
		}
	});

	app.get('/keypair', async (_req, res) => {
		try {
			const result = await handleGenerateKeyPair();
			res.json(result);
		} catch (error) {
			return res.status(400).send({ error, message: String(error) });
		}
	});

	return app;
};
