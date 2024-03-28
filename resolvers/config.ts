import { clusterApiUrl, Connection } from '@solana/web3.js';

export default {
	secretKey: process.env.SECRET_KEY,
	mint: process.env.MINT,
};

export const connection = new Connection(
	clusterApiUrl(process.env.CLUSTER as never),
);
