'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import GroupColumn from '@/components/GroupColumn';
import CreatePostModal from '@/components/CreatePostModal';
import DrawingCanvasModal from '@/components/DrawingCanvasModal';
import NicknameModal from '@/components/NicknameModal';
import SupabaseGuideModal from '@/components/SupabaseGuideModal';
import { 
  GroupColumn as GroupColumnType, 
  PostItem, 
  ReactionItem, 
  MediaType 
} from '@/types/padlet';
import { 
  fetchAllBoardData, 
  addGroupToDB, 
  updateGroupInDB, 
  deleteGroupFromDB,
  createPostInDB,
  updatePostInDB,
  deletePostFromDB,
  addCommentToDB,
  toggleReactionInDB,
  saveAnnotatedImage,
  isSupabaseConfigured,
  supabase
} from '@/lib/supabase';
import { Loader2, Plus, FolderPlus } from 'lucide-react';

export default function PadletPage() {
  const [groups, setGroups] = useState<GroupColumnType[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User Profile (Nickname & Avatar - No password needed)
  const [currentNickname, setCurrentNickname] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState('🎒');
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [isInitialNicknamePrompt, setIsInitialNicknamePrompt] = useState(false);

  // Modals
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [activeGroupIdForPost, setActiveGroupIdForPost] = useState('');
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [selectedPostForDrawing, setSelectedPostForDrawing] = useState<PostItem | null>(null);
  const [isSupabaseGuideOpen, setIsSupabaseGuideOpen] = useState(false);

  // Load User Profile from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('padlet_user_nickname');
      const savedAvatar = localStorage.getItem('padlet_user_avatar');
      if (savedName) {
        setCurrentNickname(savedName);
        if (savedAvatar) setCurrentAvatar(savedAvatar);
      } else {
        // First visit prompt
        setIsInitialNicknamePrompt(true);
        setIsNicknameModalOpen(true);
      }
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }
  }, []);

  // Fetch Board Data
  const loadData = useCallback(async () => {
    try {
      const data = await fetchAllBoardData();
      setGroups(data.groups || []);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load board data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime Subscription if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel('board-realtime-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => loadData())
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [loadData]);

  // Handle Nickname Save
  const handleSaveNickname = (nickname: string, avatar: string) => {
    setCurrentNickname(nickname);
    setCurrentAvatar(avatar);
    try {
      localStorage.setItem('padlet_user_nickname', nickname);
      localStorage.setItem('padlet_user_avatar', avatar);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  // Group Handlers
  const handleAddGroup = async () => {
    const groupCount = groups.length + 1;
    const defaultTitle = `Nhóm ${groupCount}`;
    const colors = ['blue', 'emerald', 'amber', 'purple', 'rose', 'indigo'];
    const chosenColor = colors[(groupCount - 1) % colors.length];

    const newGroup = await addGroupToDB(defaultTitle, chosenColor);
    setGroups(prev => [...prev, newGroup]);
  };

  const handleUpdateGroupTitle = async (groupId: string, newTitle: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, title: newTitle } : g));
    await updateGroupInDB(groupId, { title: newTitle });
  };

  const handleUpdateGroupColor = async (groupId: string, newColor: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, color: newColor } : g));
    await updateGroupInDB(groupId, { color: newColor });
  };

  const handleDeleteGroup = async (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setPosts(prev => prev.filter(p => p.group_id !== groupId));
    await deleteGroupFromDB(groupId);
  };

  // Post Handlers
  const handleOpenCreatePost = (groupId: string) => {
    setActiveGroupIdForPost(groupId);
    setIsCreatePostOpen(true);
  };

  const handlePostCreated = async (postData: {
    group_id: string;
    author_name: string;
    title: string;
    content: string;
    media_type: MediaType;
    media_url: string;
  }) => {
    const created = await createPostInDB({
      ...postData,
      order_index: 0,
    });
    setPosts(prev => [created, ...prev]);
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    await deletePostFromDB(postId);
  };

  // Drawing Annotation Handlers
  const handleOpenDrawingModal = (post: PostItem) => {
    setSelectedPostForDrawing(post);
    setIsDrawingOpen(true);
  };

  const handleSaveAnnotation = async (annotatedImageUrl: string) => {
    if (!selectedPostForDrawing) return;
    const postId = selectedPostForDrawing.id;

    const finalUrl = await saveAnnotatedImage(annotatedImageUrl, postId);

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, annotated_image_url: finalUrl };
      }
      return p;
    }));

    await updatePostInDB(postId, {
      annotated_image_url: finalUrl,
    });
  };

  // Interaction Handlers
  const handleToggleReaction = async (postId: string, type: ReactionItem['type']) => {
    const author = currentNickname || 'Học sinh ẩn danh';
    const updatedReactions = await toggleReactionInDB(postId, author, type);

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, reactions: updatedReactions };
      }
      return p;
    }));
  };

  const handleAddComment = async (postId: string, content: string) => {
    const author = currentNickname || 'Học sinh ẩn danh';
    const newComment = await addCommentToDB(postId, author, content);

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const comments = p.comments || [];
        return { ...p, comments: [...comments, newComment] };
      }
      return p;
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navigation */}
      <Header
        onAddGroup={handleAddGroup}
        currentNickname={currentNickname}
        currentAvatar={currentAvatar}
        onOpenNicknameModal={() => {
          setIsInitialNicknamePrompt(false);
          setIsNicknameModalOpen(true);
        }}
      />

      {/* Main Board Workspace: Cuộn ngang mượt mà cho tất cả các nhóm */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-semibold">Đang tải không gian lớp học...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderPlus className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Chưa có nhóm nào trong lớp
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hãy tạo cột nhóm đầu tiên để các bạn học sinh có thể nộp bài và thảo luận.
              </p>
            </div>
            <button
              onClick={handleAddGroup}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Nhóm 1</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto h-full pb-2 px-1 sm:px-0 custom-scrollbar snap-x snap-mandatory select-none">
            {groups.map((group) => (
              <div key={group.id} className="w-[86vw] max-w-[360px] sm:w-[350px] shrink-0 h-full snap-center">
                <GroupColumn
                  group={group}
                  posts={posts.filter((p) => p.group_id === group.id)}
                  currentNickname={currentNickname}
                  onUpdateGroupTitle={handleUpdateGroupTitle}
                  onUpdateGroupColor={handleUpdateGroupColor}
                  onDeleteGroup={handleDeleteGroup}
                  onOpenCreatePost={handleOpenCreatePost}
                  onOpenDrawingModal={handleOpenDrawingModal}
                  onToggleReaction={handleToggleReaction}
                  onAddComment={handleAddComment}
                  onDeletePost={handleDeletePost}
                  onOpenNicknameModal={() => setIsNicknameModalOpen(true)}
                />
              </div>
            ))}

            {/* Thẻ Thêm Cột Nhóm Mới ở cuối thanh cuộn ngang */}
            <div className="w-[260px] sm:w-[300px] shrink-0 h-full flex items-center justify-center p-2 snap-center">
              <button
                onClick={handleAddGroup}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold flex flex-col items-center justify-center gap-2.5 transition group shadow-xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span>+ Thêm cột nhóm mới</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        groupId={activeGroupIdForPost}
        groups={groups}
        currentNickname={currentNickname}
        onPostCreated={handlePostCreated}
        onOpenNicknameModal={() => setIsNicknameModalOpen(true)}
      />

      {isDrawingOpen && selectedPostForDrawing && (
        <DrawingCanvasModal
          isOpen={isDrawingOpen}
          onClose={() => {
            setIsDrawingOpen(false);
            setSelectedPostForDrawing(null);
          }}
          imageUrl={selectedPostForDrawing.annotated_image_url || selectedPostForDrawing.media_url || ''}
          postTitle={selectedPostForDrawing.title}
          authorName={selectedPostForDrawing.author_name}
          onSaveAnnotation={handleSaveAnnotation}
        />
      )}

      <NicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        currentNickname={currentNickname}
        currentAvatar={currentAvatar}
        onSave={handleSaveNickname}
        isInitialPrompt={isInitialNicknamePrompt}
      />

      <SupabaseGuideModal
        isOpen={isSupabaseGuideOpen}
        onClose={() => setIsSupabaseGuideOpen(false)}
      />
    </div>
  );
}
