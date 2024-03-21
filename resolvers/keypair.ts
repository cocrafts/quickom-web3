import { Keypair } from '@solana/web3.js';

export interface UniversalKeypair {
	public: string;
	private: string;
}

export const handleGenerateKeyPair = async (): Promise<UniversalKeypair> => {
	const keypair = Keypair.generate();

	return {
		public: keypair.publicKey.toString(),
		private: keypair.secretKey.toString(),
	};
};
