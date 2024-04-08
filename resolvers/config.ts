import { clusterApiUrl, Connection } from '@solana/web3.js';

export interface Config {
	secretKey: string;
	mint: string;
}

export default {
	secretKey: process.env.SECRET_KEY as string,
	mint: process.env.MINT as string,
} satisfies Config;

export const connection = new Connection(
	clusterApiUrl(process.env.CLUSTER as never),
);
