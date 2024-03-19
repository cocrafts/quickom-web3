export const handleIncomingHook = async (payload: object) => {
	console.log(payload, '<-- payload from incoming hook');
	return {
		message: 'success, incoming hook called',
	};
};
