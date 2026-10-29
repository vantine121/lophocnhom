import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GroupColumn, PostItem, CommentItem, ReactionItem } from '@/types/padlet';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// LOCAL STORAGE MOCK DATA & FALLBACK MANAGER
// ==========================================
const LOCAL_STORAGE_KEY = 'padlet_local_database_v1';

const INITIAL_LOCAL_DATA: {
  groups: GroupColumn[];
  posts: PostItem[];
  comments: CommentItem[];
  reactions: ReactionItem[];
} = {
  groups: [
    { id: 'group-1', title: 'Nhóm 1: Sao Hỏa 🚀', color: 'blue', order_index: 0 },
    { id: 'group-2', title: 'Nhóm 2: Mặt Trời ☀️', color: 'amber', order_index: 1 },
    { id: 'group-3', title: 'Nhóm 3: Dải Ngân Hà 🌌', color: 'purple', order_index: 2 },
  ],
  posts: [
    {
      id: 'post-demo-1',
      group_id: 'group-1',
      author_name: 'Cô Thu Hương (GV)',
      title: 'Chào mừng các em đến với buổi nộp bài nhóm! 🌟',
      content: 'Mỗi nhóm hãy cử đại diện hoặc từng thành viên tải ảnh bài tập, sơ đồ tư duy hoặc video thuyết trình lên cột nhóm của mình. Thầy cô và các bạn có thể nhấp vào nút "Vẽ / Chú thích" để chấm điểm và khoanh tròn nhận xét trực tiếp lên ảnh nhé!',
      media_type: 'image',
      media_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
      order_index: 0,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      comments: [
        {
          id: 'comm-1',
          post_id: 'post-demo-1',
          author_name: 'Minh Triết',
          content: 'Nhóm 1 chúng em đã hoàn thành sơ đồ và đang chụp ảnh tải lên ạ! 🔥',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      reactions: [
        { id: 'react-1', post_id: 'post-demo-1', author_name: 'Minh Triết', type: 'heart' },
        { id: 'react-2', post_id: 'post-demo-1', author_name: 'Bảo Trâm', type: 'like' },
        { id: 'react-3', post_id: 'post-demo-1', author_name: 'Hải Đăng', type: 'star' }
      ]
    },
    {
      id: 'post-demo-2',
      group_id: 'group-2',
      author_name: 'Hải Đăng (Nhóm 2)',
      title: 'Bài tập Sinh học: Quá trình Quang hợp 🌿',
      content: 'Nhóm 2 xin nộp sơ đồ minh họa cơ chế pha sáng và pha tối của quang hợp ở thực vật. Mời thầy cô và các bạn góp ý giúp nhóm!',
      media_type: 'image',
      media_url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1200&q=80',
      order_index: 0,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      comments: [],
      reactions: [
        { id: 'react-4', post_id: 'post-demo-2', author_name: 'Thanh Thảo', type: 'celebrate' }
      ]
    }
  ],
  comments: [],
  reactions: []
};

function getLocalData() {
  if (typeof window === 'undefined') return INITIAL_LOCAL_DATA;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_LOCAL_DATA));
      return INITIAL_LOCAL_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOCAL_DATA;
  }
}

function saveLocalData(data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Lỗi lưu LocalStorage:', err);
  }
}

// ==========================================
// DATA API (SUPABASE HOẶC FALLBACK LOCALSTORAGE)
// ==========================================

export async function fetchAllBoardData(): Promise<{
  groups: GroupColumn[];
  posts: PostItem[];
}> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: groups, error: groupErr } = await supabase
        .from('groups')
        .select('*')
        .order('order_index', { ascending: true });

      if (groupErr) throw groupErr;

      const { data: posts, error: postErr } = await supabase
        .from('posts')
        .select(`
          *,
          comments (*),
          reactions (*)
        `)
        .order('order_index', { ascending: false });

      if (postErr) throw postErr;

      return {
        groups: groups || [],
        posts: posts || [],
      };
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // Fallback to local
  const local = getLocalData();
  return {
    groups: local.groups || [],
    posts: local.posts || [],
  };
}

export async function addGroupToDB(title: string, color: string = 'blue'): Promise<GroupColumn> {
  const newGroup: GroupColumn = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `group-${Date.now()}`,
    title,
    color,
    order_index: Date.now(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          id: newGroup.id,
          title: newGroup.title,
          color: newGroup.color,
          order_index: newGroup.order_index
        }])
        .select()
        .single();

      if (!error && data) return data as GroupColumn;
    } catch (e) {
      console.error('Supabase addGroup error:', e);
    }
  }

  const local = getLocalData();
  local.groups.push(newGroup);
  saveLocalData(local);
  return newGroup;
}

export async function updateGroupInDB(id: string, updates: Partial<GroupColumn>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('groups').update(updates).eq('id', id);
      return;
    } catch (e) {
      console.error('Supabase updateGroup error:', e);
    }
  }

  const local = getLocalData();
  local.groups = local.groups.map((g: GroupColumn) => (g.id === id ? { ...g, ...updates } : g));
  saveLocalData(local);
}

export async function deleteGroupFromDB(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('groups').delete().eq('id', id);
      return;
    } catch (e) {
      console.error('Supabase deleteGroup error:', e);
    }
  }

  const local = getLocalData();
  local.groups = local.groups.filter((g: GroupColumn) => g.id !== id);
  local.posts = local.posts.filter((p: PostItem) => p.group_id !== id);
  saveLocalData(local);
}

export async function createPostInDB(post: Omit<PostItem, 'id' | 'created_at'>): Promise<PostItem> {
  const newPost: PostItem = {
    ...post,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}`,
    created_at: new Date().toISOString(),
    comments: [],
    reactions: [],
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          id: newPost.id,
          group_id: newPost.group_id,
          author_name: newPost.author_name,
          title: newPost.title,
          content: newPost.content,
          media_type: newPost.media_type,
          media_url: newPost.media_url || '',
          annotated_image_url: newPost.annotated_image_url || '',
          annotations_data: newPost.annotations_data || [],
          order_index: newPost.order_index || 0,
        }])
        .select()
        .single();

      if (!error && data) {
        return {
          ...data,
          comments: [],
          reactions: [],
        } as PostItem;
      }
    } catch (e) {
      console.error('Supabase createPost error:', e);
    }
  }

  const local = getLocalData();
  local.posts.unshift(newPost);
  saveLocalData(local);
  return newPost;
}

export async function updatePostInDB(id: string, updates: Partial<PostItem>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const dbUpdates: any = { ...updates };
      delete dbUpdates.comments;
      delete dbUpdates.reactions;
      await supabase.from('posts').update(dbUpdates).eq('id', id);
      return;
    } catch (e) {
      console.error('Supabase updatePost error:', e);
    }
  }

  const local = getLocalData();
  local.posts = local.posts.map((p: PostItem) => (p.id === id ? { ...p, ...updates } : p));
  saveLocalData(local);
}

export async function deletePostFromDB(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('posts').delete().eq('id', id);
      return;
    } catch (e) {
      console.error('Supabase deletePost error:', e);
    }
  }

  const local = getLocalData();
  local.posts = local.posts.filter((p: PostItem) => p.id !== id);
  saveLocalData(local);
}

export async function addCommentToDB(postId: string, authorName: string, content: string): Promise<CommentItem> {
  const newComment: CommentItem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `comm-${Date.now()}`,
    post_id: postId,
    author_name: authorName,
    content,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select()
        .single();

      if (!error && data) return data as CommentItem;
    } catch (e) {
      console.error('Supabase addComment error:', e);
    }
  }

  const local = getLocalData();
  local.posts = local.posts.map((p: PostItem) => {
    if (p.id === postId) {
      const comments = p.comments || [];
      return { ...p, comments: [...comments, newComment] };
    }
    return p;
  });
  saveLocalData(local);
  return newComment;
}

export async function toggleReactionInDB(
  postId: string,
  authorName: string,
  type: ReactionItem['type']
): Promise<ReactionItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Check existing reaction
      const { data: existing } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('author_name', authorName)
        .eq('type', type)
        .maybeSingle();

      if (existing) {
        // Remove it
        await supabase.from('reactions').delete().eq('id', existing.id);
      } else {
        // Add it
        await supabase.from('reactions').insert([{
          post_id: postId,
          author_name: authorName,
          type
        }]);
      }

      const { data: updated } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId);

      return (updated as ReactionItem[]) || [];
    } catch (e) {
      console.error('Supabase toggleReaction error:', e);
    }
  }

  // Local storage toggle
  const local = getLocalData();
  let updatedReactions: ReactionItem[] = [];

  local.posts = local.posts.map((p: PostItem) => {
    if (p.id === postId) {
      const current = p.reactions || [];
      const hasReacted = current.find(r => r.author_name === authorName && r.type === type);
      let next: ReactionItem[];
      if (hasReacted) {
        next = current.filter(r => !(r.author_name === authorName && r.type === type));
      } else {
        const newReaction: ReactionItem = {
          id: `react-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          post_id: postId,
          author_name: authorName,
          type,
          created_at: new Date().toISOString()
        };
        next = [...current, newReaction];
      }
      updatedReactions = next;
      return { ...p, reactions: next };
    }
    return p;
  });

  saveLocalData(local);
  return updatedReactions;
}

// Upload file to Supabase Storage or convert to Data URL for instant local preview
export async function uploadMediaFile(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('padlet-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('padlet-media').getPublicUrl(filePath);
        return data.publicUrl;
      } else {
        console.warn('Storage upload error, falling back to base64:', uploadError);
      }
    } catch (err) {
      console.warn('Storage upload failed, using DataURL:', err);
    }
  }

  // Fallback to base64 DataURL (works offline, no server needed!)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert base64 / blob to image url and upload to storage if possible
export async function saveAnnotatedImage(dataUrl: string, postId: string): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      // convert base64 dataUrl to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `annotations/${postId}-${Date.now()}.png`;

      const { error } = await supabase.storage
        .from('padlet-media')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!error) {
        const { data } = supabase.storage.from('padlet-media').getPublicUrl(fileName);
        return data.publicUrl;
      }
    } catch (e) {
      console.warn('Failed to upload annotation to supabase storage:', e);
    }
  }

  // Return dataUrl directly
  return dataUrl;
}

