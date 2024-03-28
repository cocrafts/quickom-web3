import {
	createTransferInstruction,
	getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
	Keypair,
	PublicKey,
	sendAndConfirmTransaction,
	Transaction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { decode } from 'bs58';

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
		parsedAmount = new BN(amount);
		console.log('parsedAmount', parsedAmount);

		if (!config.secretKey) throw new Error('missing secret key');
		if (!config.mint) throw new Error('missing mint address');

		const mintPubkey = new PublicKey(config.mint);
		const keypair = Keypair.fromSecretKey(decode(config.secretKey as string));
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
				parsedAmount,
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
		message: 'success, received send-reward command',
		parsedAmount,
		payload,
	};
};
