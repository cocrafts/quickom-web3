import {
	ACCOUNT_SIZE,
	createTransferInstruction,
	getAssociatedTokenAddress,
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

import type { Config } from './config';
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
	const { secretKey, mint } = validateConfig(config);
	const { amount, walletAddress } = validateSendRewardPayload(payload);

	try {
		const parsedAmount = parseTransactionAmount(amount);
		const mintPubkey = new PublicKey(mint);
		const keyBuffer = secretKey.split(',').map((i) => parseInt(i));
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

		const instruction = createTransferInstruction(
			sourceATAddress.address,
			destinationATAddress.address,
			keypair.publicKey,
			parsedAmount as never,
		);
		const transaction = new Transaction().add(instruction);
		await injectTransactionField(transaction, { feePayer: keypair.publicKey });

		const transactionId = await sendAndConfirmTransaction(
			connection,
			transaction,
			[keypair],
		);

		return {
			message: `successfully send ${amount} $QKT to ${walletAddress}`,
			transactionId,
		};
	} catch (err) {
		console.log(err);
		throw new Error('something went wrong during gas estimation');
	}
};

export const handleEstimateFee = async (payload: SendRewardPayload) => {
	let accumulatedFee = 0;
	const { secretKey, mint } = validateConfig(config);
	const { amount, walletAddress } = validateSendRewardPayload(payload);

	try {
		const parsedAmount = parseTransactionAmount(amount);
		const mintPubkey = new PublicKey(mint);
		const keyBuffer = secretKey.split(',').map((i) => parseInt(i));
		const keypair = Keypair.fromSecretKey(new Uint8Array(keyBuffer));

		const associatedAddress = await getAssociatedTokenAddress(
			mintPubkey,
			new PublicKey(walletAddress),
		);
		const accountInfo = await connection.getAccountInfo(associatedAddress);

		if (!accountInfo) {
			const rentFee =
				await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);
			accumulatedFee += rentFee || 0;
		}

		const sourceATAddress = await getAssociatedTokenAddress(
			mintPubkey,
			keypair.publicKey,
		);

		const destinationATAddress = await getAssociatedTokenAddress(
			mintPubkey,
			new PublicKey(walletAddress),
		);

		const instruction = createTransferInstruction(
			sourceATAddress,
			destinationATAddress,
			keypair.publicKey,
			parsedAmount as never,
		);
		const transaction = new Transaction().add(instruction);
		await injectTransactionField(transaction, { feePayer: keypair.publicKey });

		const transactionFee = await transaction.getEstimatedFee(connection);
		accumulatedFee += transactionFee || 0;

		return accumulatedFee / LAMPORTS_PER_SOL;
	} catch (err) {
		console.log(err);
		throw new Error('something went wrong during gas estimation');
	}
};

export const injectTransactionField = async (
	transaction: Transaction,
	fields: object,
): Promise<Transaction> => {
	const { blockhash } = await connection.getLatestBlockhash();
	transaction.recentBlockhash = blockhash;

	for (const key in fields) {
		transaction[key] = fields[key];
	}

	return transaction;
};

export const validateSendRewardPayload = (
	value: SendRewardPayload,
): SendRewardPayload => {
	if (!value.walletAddress) throw new Error('missing walletAddress param!');
	if (!value.amount) throw new Error('missing amount param!');

	return value;
};

export const validateConfig = (value: Config): Config => {
	if (!value.secretKey) throw new Error('missing secret key');
	if (!value.mint) throw new Error('missing mint address');

	return value;
};

export const parseTransactionAmount = (amount: string): BN => {
	const [primary, float] = amount.split('.');
	const primaryLamports = new BN(primary).mul(new BN(LAMPORTS_PER_SOL));
	const floatLamports = new BN(parseFloat(`0.${float}`) * LAMPORTS_PER_SOL);

	return primaryLamports.add(floatLamports);
};
