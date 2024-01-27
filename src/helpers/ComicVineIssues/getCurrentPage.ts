export const getCurrentPage = () => {
	if (typeof window !== 'undefined') {
		const searchParams = new URLSearchParams(window.location.search);
		return parseInt(searchParams.get('page') || '1', 10);
	}
	return 1;
	
};
