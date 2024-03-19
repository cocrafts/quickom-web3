import cors from 'cors';
import type { Express } from 'express';

import { handleIncomingHook } from './resolvers/hook';

/* eslint-disable-next-line */
export const configure = async (express: any) => {
	const app: Express = express();

	app.use(cors());
	app.use(express.json());

	app.post('/hook', async (req, res) => {
		try {
			const result = await handleIncomingHook(req.body);
			res.json(result);
		} catch (error) {
			return res.status(400).send({ error, message: String(error) });
		}
	});

	return app;
};
