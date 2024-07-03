export type Forum = {
    id: string;
    image: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
};

export type Topic = {
    id: string;
    forum_id: string;
    title: string;
    description: string;
    author_id: string;
    created_at: string;
    updated_at: string;
	profiles: {
        username: string;
        avatar_url: string;
    };
};

export type Post = {
    id: string;
    topic_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string;
    };
};

export type User = {
	id: string;
	email: string | null;
	avatar_url: string;
	username: string;
  };

export type Params = {
    id: string;
    params: {
        id: string;
        topicId?: string;
    };
};
