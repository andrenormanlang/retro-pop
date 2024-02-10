export const extractIdFromURI = (URI: string) => {
	const match = URI.match(/\/(\d+)$/);
	return match ? match[1] : null;
  };
