import BN from 'bn.js';

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
	const { amount, walletAddress } = payload;

	if (!walletAddress) throw new Error('missing walletAddress param!');
	if (!amount) throw new Error('missing amount param!');

	try {
		parsedAmount = new BN(amount);
		console.log('parsedAmount', parsedAmount);
	} catch {
		throw new Error('invalid amount, must be bn.js value in string!');
	}

	if (walletAddress === null) throw new Error('invalid wallet address');
	return {
		message: 'success, received send-reward command',
		parsedAmount,
		payload,
	};
};
