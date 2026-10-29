'use client';

import React, { useState } from 'react';
import { 
  Plus, Edit2, Check, Trash2, Palette, 
  FileText, Sparkles, Folder
} from 'lucide-react';
import { GroupColumn as GroupColumnType, PostItem, ReactionItem } from '@/types/padlet';
import PostCard from './PostCard';

interface GroupColumnProps {
  group: GroupColumnType;
  posts: PostItem[];
  currentNickname: string;
  onUpdateGroupTitle: (groupId: string, newTitle: string) => void;
  onUpdateGroupColor: (groupId: string, newColor: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onOpenCreatePost: (groupId: string) => void;
  onOpenDrawingModal: (post: PostItem) => void;
  onOpenPresentation?: (post: PostItem) => void;
  onToggleReaction: (postId: string, type: ReactionItem['type']) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onOpenNicknameModal?: () => void;
}

const THEME_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/60', accent: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/60', accent: 'bg-emerald-600' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/60', accent: 'bg-amber-600' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/60', accent: 'bg-purple-600' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/60', accent: 'bg-rose-600' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/60', accent: 'bg-indigo-600' },
};

export default function GroupColumn({
  group,
  posts = [],
  currentNickname,
  onUpdateGroupTitle,
  onUpdateGroupColor,
  onDeleteGroup,
  onOpenCreatePost,
  onOpenDrawingModal,
  onOpenPresentation,
  onToggleReaction,
  onAddComment,
  onDeletePost,
  onOpenNicknameModal,
}: GroupColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(group.title);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const theme = THEME_COLORS[group.color || 'blue'] || THEME_COLORS.blue;

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput.trim() !== group.title) {
      onUpdateGroupTitle(group.id, titleInput.trim());
    } else {
      setTitleInput(group.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') {
      setTitleInput(group.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 min-w-[310px] max-w-full">
      {/* Top Accent Strip */}
      <div className={`h-1.5 w-full ${theme.accent}`} />

      {/* Column Header */}
      <div className="p-3 bg-white/90 dark:bg-slate-850/90 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-3 h-3 rounded-full ${theme.accent} shrink-0`} />

          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-2 py-0.5 text-sm font-bold rounded-lg border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-1.5 cursor-pointer group/title flex-1 min-w-0"
              title="Nhấp để đổi tên nhóm"
            >
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 truncate">
                {group.title}
              </h3>
              <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-indigo-600 shrink-0 opacity-0 group-hover/title:opacity-100 transition" />
            </div>
          )}

          {/* Post count badge */}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            {posts.length}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 relative">
          {/* Color theme toggle */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Đổi màu thẻ nhóm"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {showColorPicker && (
            <div className="absolute right-0 top-8 z-30 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex gap-1.5">
              {Object.keys(THEME_COLORS).map((colorKey) => (
                <button
                  key={colorKey}
                  onClick={() => {
                    onUpdateGroupColor(group.id, colorKey);
                    setShowColorPicker(false);
                  }}
                  className={`w-5 h-5 rounded-full ${THEME_COLORS[colorKey].accent} hover:scale-110 transition`}
                  title={colorKey}
                />
              ))}
            </div>
          )}

          {/* Delete group button */}
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa nhóm "${group.title}" và toàn bộ bài đăng trong nhóm này?`)) {
                onDeleteGroup(group.id);
              }
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Xóa cột nhóm này"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Button: + Thêm bài nộp */}
      <div className="p-3 pb-1">
        <button
          onClick={() => onOpenCreatePost(group.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white/70 dark:bg-slate-850/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all shadow-sm group"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>+ Nộp bài cho {group.title}</span>
        </button>
      </div>

      {/* Scrollable Posts Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar min-h-[300px]">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentNickname={currentNickname}
              onOpenDrawingModal={onOpenDrawingModal}
              onOpenPresentation={onOpenPresentation}
              onToggleReaction={onToggleReaction}
              onAddComment={onAddComment}
              onDeletePost={onDeletePost}
              onOpenNicknameModal={onOpenNicknameModal}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
            <div className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center">
              <Folder className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-medium">Chưa có bài nộp nào trong nhóm này</p>
            <p className="text-[11px] text-slate-400">
              Nhấp vào <strong>"+ Nộp bài"</strong> ở trên để nộp ảnh sơ đồ, bài làm hoặc video nhé!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

