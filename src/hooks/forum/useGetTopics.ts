import { useQuery } from '@tanstack/react-query';

const fetchTopics = async (forumId: string) => {
    const response = await fetch(`/api/fetch-topics?forum_id=${forumId}`);
    if (!response.ok) {
        throw new Error('Error fetching topics');
    }
    return response.json();
};

export const useGetTopics = (forumId: string) => {
    return useQuery({
        queryKey: ['topics', forumId],
        queryFn: () => fetchTopics(forumId),
        enabled: !!forumId,
    });
};
