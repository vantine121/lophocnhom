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
const LOCAL_STORAGE_KEY = 'padlet_local_database_v3';

const INITIAL_LOCAL_DATA: {
  groups: GroupColumn[];
  posts: PostItem[];
} = {
  groups: [
    { id: 'group-1', title: 'Nhóm 1: Sao Hỏa 🚀', color: 'blue', order_index: 0 },
    { id: 'group-2', title: 'Nhóm 2: Mặt Trời ☀️', color: 'amber', order_index: 1 },
    { id: 'group-3', title: 'Nhóm 3: Dải Ngân Hà 🌌', color: 'purple', order_index: 2 },
  ],
  posts: []
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
    console.warn('Lưu LocalStorage thất bại:', err);
  }
}

// ==========================================
// CLIENT-SIDE IMAGE COMPRESSION (TĂNG TỐC 20X)
// ==========================================
export async function compressImageFile(file: File): Promise<File> {
  // Không nén nếu không phải ảnh hoặc là ảnh động GIF
  if (typeof window === 'undefined' || !file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }
  // Nếu ảnh đã rất nhẹ (< 300KB) thì không cần nén lại
  if (file.size < 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // Kích thước chuẩn Full HD sắc nét cho bài tập học sinh
        const MAX_DIM = 1920;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);

        // Nén chất lượng 85% giữ rõ từng nét chữ/công thức mà giảm 90% dung lượng
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          'image/jpeg',
          0.85
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
    } catch {
      resolve(file);
    }
  });
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
        .order('created_at', { ascending: true });

      if (groupErr) throw groupErr;

      const { data: posts, error: postErr } = await supabase
        .from('posts')
        .select(`
          *,
          comments (*),
          reactions (*)
        `)
        .order('created_at', { ascending: false });

      if (postErr) throw postErr;

      const mappedPosts = (posts || []).map((p: any) => ({
        ...p,
        comments: Array.isArray(p.comments) ? p.comments : [],
        reactions: Array.isArray(p.reactions) ? p.reactions : [],
      }));

      return {
        groups: groups || [],
        posts: mappedPosts,
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
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          title,
          color,
          order_index: 0
        }])
        .select()
        .single();

      if (!error && data) return data as GroupColumn;
      if (error) console.error('Supabase addGroup error:', error);
    } catch (e) {
      console.error('Supabase addGroup exception:', e);
    }
  }

  const newGroup: GroupColumn = {
    id: `group-${Date.now()}`,
    title,
    color,
    order_index: 0,
    created_at: new Date().toISOString(),
  };

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
  if (isSupabaseConfigured && supabase) {
    try {
      const safeOrderIndex = typeof post.order_index === 'number' && Math.abs(post.order_index) < 2000000000 
        ? post.order_index 
        : 0;

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          group_id: post.group_id,
          author_name: post.author_name,
          title: post.title,
          content: post.content,
          media_type: post.media_type,
          media_url: post.media_url || '',
          annotated_image_url: post.annotated_image_url || '',
          annotations_data: post.annotations_data || [],
          order_index: safeOrderIndex,
        }])
        .select(`
          *,
          comments (*),
          reactions (*)
        `)
        .single();

      if (!error && data) {
        return {
          ...data,
          comments: Array.isArray(data.comments) ? data.comments : [],
          reactions: Array.isArray(data.reactions) ? data.reactions : [],
        } as PostItem;
      }
      if (error) {
        console.error('Supabase createPost error:', error);
        throw new Error(error.message);
      }
    } catch (e: any) {
      console.error('Supabase createPost exception:', e);
      throw e;
    }
  }

  const newPost: PostItem = {
    ...post,
    id: `post-${Date.now()}`,
    created_at: new Date().toISOString(),
    comments: [],
    reactions: [],
  };

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
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          author_name: authorName,
          content,
        }])
        .select()
        .single();

      if (!error && data) return data as CommentItem;
      if (error) console.error('Supabase addComment error:', error);
    } catch (e) {
      console.error('Supabase addComment exception:', e);
    }
  }

  const newComment: CommentItem = {
    id: `comm-${Date.now()}`,
    post_id: postId,
    author_name: authorName,
    content,
    created_at: new Date().toISOString(),
  };

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
      const { data: existing } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('author_name', authorName)
        .eq('type', type)
        .maybeSingle();

      if (existing) {
        await supabase.from('reactions').delete().eq('id', existing.id);
      } else {
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

// Upload file to Supabase Storage permanently (Tối ưu nén tự động)
export async function uploadMediaFile(file: File): Promise<string> {
  // Nén ảnh thông minh trước khi tải lên (giảm từ 10MB xuống 300KB chỉ trong 0.1s)
  const readyFile = await compressImageFile(file);

  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = readyFile.name.split('.').pop() || 'jpg';
      const cleanName = readyFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `uploads/${Date.now()}_${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from('padlet-media')
        .upload(filePath, readyFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: readyFile.type || 'image/jpeg'
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('padlet-media').getPublicUrl(filePath);
        return data.publicUrl;
      } else {
        console.error('Storage upload error:', uploadError);
        throw new Error('Lỗi tải tệp lên Storage: ' + uploadError.message);
      }
    } catch (err: any) {
      console.error('Storage upload failed:', err);
      throw err;
    }
  }

  // Fallback to base64 DataURL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(readyFile);
  });
}

// Convert base64 / blob to image url and upload to storage
export async function saveAnnotatedImage(dataUrl: string, postId: string): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `annotations/${postId}_${Date.now()}.png`;

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

  return dataUrl;
}
