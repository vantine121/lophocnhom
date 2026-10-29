export type MediaType = 'none' | 'image' | 'video' | 'youtube';

export interface GroupColumn {
  id: string;
  title: string;
  color?: string;
  order_index: number;
  created_at?: string;
}

export interface ReactionItem {
  id: string;
  post_id: string;
  author_name: string;
  type: 'like' | 'heart' | 'star' | 'fire' | 'celebrate';
  created_at?: string;
}

export interface CommentItem {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface PostItem {
  id: string;
  group_id: string;
  author_name: string;
  title: string;
  content: string;
  media_type: MediaType;
  media_url?: string;
  annotated_image_url?: string;
  annotations_data?: any;
  order_index: number;
  created_at: string;
  updated_at?: string;
  reactions?: ReactionItem[];
  comments?: CommentItem[];
}

export type LayoutMode = 'split-2' | 'split-3' | 'dynamic';

export interface UserProfile {
  nickname: string;
  avatar: string;
}

