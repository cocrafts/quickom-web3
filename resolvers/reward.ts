import {
	createTransferInstruction,
	getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	sendAndConfirmTransaction,
	Transaction,
} from '@solana/web3.js';
import BN from 'bn.js';

import config, { connection } from './config';

export interface QuickomResource {
	time?: number;
	banwhich?: number;
}

export interface SendRewardPayload {
	amount: string /* note: receive bn.js string-value */;
	walletAddress: string;
	resource?: QuickomResource;
}

export const handleSendReward = async (payload: SendRewardPayload) => {
	let parsedAmount: BN;
	let transactionId: string;
	const { amount, walletAddress } = payload;

	if (!walletAddress) throw new Error('missing walletAddress param!');
	if (!amount) throw new Error('missing amount param!');

	try {
		parsedAmount = new BN(amount).mul(new BN(LAMPORTS_PER_SOL));

		if (!config.secretKey) throw new Error('missing secret key');
		if (!config.mint) throw new Error('missing mint address');

		const mintPubkey = new PublicKey(config.mint);
		const keyBuffer = config.secretKey.split(',').map((i) => parseInt(i));
		const keypair = Keypair.fromSecretKey(new Uint8Array(keyBuffer));

		const sourceATAddress = await getOrCreateAssociatedTokenAccount(
			connection,
			keypair,
			mintPubkey,
			keypair.publicKey,
		);

		const destinationWallet = new PublicKey(walletAddress);
		const destinationATAddress = await getOrCreateAssociatedTokenAccount(
			connection,
			keypair,
			mintPubkey,
			destinationWallet,
		);

		const transaction = new Transaction().add(
			createTransferInstruction(
				sourceATAddress.address,
				destinationATAddress.address,
				keypair.publicKey,
				parsedAmount as never,
			),
		);

		transactionId = await sendAndConfirmTransaction(connection, transaction, [
			keypair,
		]);
		console.log(transactionId);
	} catch (err) {
		console.log(err);
		throw new Error('invalid amount, must be bn.js value in string!');
	}

	if (walletAddress === null) throw new Error('invalid wallet address');
	return {
		message: `successfully send ${amount} $QKT to ${walletAddress}`,
		transactionId,
	};
};
