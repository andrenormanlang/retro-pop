export const useCustomRouter = () => {
	const navigate = (path: string) => {
	  window.location.href = path;
	};

	return { navigate };
  };
