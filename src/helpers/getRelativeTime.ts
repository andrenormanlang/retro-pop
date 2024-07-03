// function to display latest time of a post
export const getRelativeTime = (date: Date | string | number | null): string => {
	if (!date) return 'No posts';

	const now = new Date();
	const postDate = new Date(date);
	const diffInSeconds = (now.getTime() - postDate.getTime()) / 1000;

	if (diffInSeconds < 60) return 'Just now';
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;

	const daysDiff = Math.floor(diffInSeconds / 86400);
	if (daysDiff < 7) {
	  return postDate.toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric' });
	}

	return postDate.toLocaleDateString();
  };
