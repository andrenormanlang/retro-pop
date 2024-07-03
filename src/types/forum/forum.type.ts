export type Forum = {
    id: string;
    image: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
};

export interface Topic {
	id: string;
	title: string;
	description: string;
	created_at: string;
	authorId: string;
	voiceCount?: number;
	postCount?: number;
	lastPostTime?: string;
	profiles: {
	  username: string;
	  avatar_url: string;
	};
}

export type Post = {
    id: string;
    topic_id: string;
    content: string;
    image_url?: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string;
		is_admin?: boolean;
    };
};

export type User = {
	id: string;
	email: string | null;
	avatar_url: string;
	username: string;
	is_admin?: boolean;
};

export type Params = {
    id: string;
    params: {
        id: string;
        topicId?: string;
    };
};
