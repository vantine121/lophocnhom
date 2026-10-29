'use client';

import React, { useState } from 'react';
import { 
  Edit3, Trash2, Video, Image as ImageIcon, 
  ExternalLink, Layers, Eye
} from 'lucide-react';
import { PostItem, ReactionItem } from '@/types/padlet';
import ReactionBar from './ReactionBar';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: PostItem;
  currentNickname: string;
  onOpenDrawingModal: (post: PostItem) => void;
  onToggleReaction: (postId: string, type: ReactionItem['type']) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onOpenNicknameModal?: () => void;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export default function PostCard({
  post,
  currentNickname,
  onOpenDrawingModal,
  onToggleReaction,
  onAddComment,
  onDeletePost,
  onOpenNicknameModal,
}: PostCardProps) {
  // Toggle between viewing original media and annotated overlay
  const [showAnnotationView, setShowAnnotationView] = useState(Boolean(post.annotated_image_url));

  const hasAnnotation = Boolean(post.annotated_image_url);
  const activeImageUrl = showAnnotationView && post.annotated_image_url
    ? post.annotated_image_url
    : post.media_url;

  const ytEmbedUrl = post.media_type === 'youtube' ? getYouTubeEmbedUrl(post.media_url) : null;

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Post Header: Author & Controls */}
      <div className="p-3.5 pb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
            {post.author_name ? post.author_name.charAt(0) : 'H'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>{post.author_name}</span>
              {post.author_name.toLowerCase().includes('gv') || post.author_name.toLowerCase().includes('cô') || post.author_name.toLowerCase().includes('thầy') ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                  Giáo viên
                </span>
              ) : null}
            </h4>
            <span className="text-[10px] text-slate-400">
              {new Date(post.created_at).toLocaleDateString('vi-VN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Delete Post Button */}
        <button
          onClick={() => {
            if (confirm(`Bạn có chắc muốn xóa bài đăng "${post.title || 'này'}" không?`)) {
              onDeletePost(post.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
          title="Xóa bài đăng"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Post Body: Title & Content */}
      <div className="px-3.5 py-1">
        {post.title && (
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-snug">
            {post.title}
          </h3>
        )}
        {post.content && (
          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}
      </div>

      {/* Media Display Area */}
      {post.media_type === 'image' && post.media_url && (
        <div className="mt-2 relative bg-slate-950/5 dark:bg-slate-950/40 border-y border-slate-100 dark:border-slate-800/80">
          {/* Annotation Switcher Badge */}
          {hasAnnotation && (
            <div className="absolute top-2 left-2 z-10 flex items-center bg-slate-900/85 backdrop-blur-sm rounded-lg p-0.5 border border-slate-700/60 shadow">
              <button
                onClick={() => setShowAnnotationView(false)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                  !showAnnotationView ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Gốc
              </button>
              <button
                onClick={() => setShowAnnotationView(true)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md flex items-center gap-1 transition ${
                  showAnnotationView ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-2.5 h-2.5" />
                <span>Đã vẽ chú thích</span>
              </button>
            </div>
          )}

          {/* Canvas Draw Trigger Button */}
          <button
            onClick={() => onOpenDrawingModal(post)}
            className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 backdrop-blur-sm text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition transform active:scale-95"
            title="Mở bảng vẽ để chấm bài hoặc ghi chú trực tiếp lên ảnh"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Vẽ / Chú thích 🎨</span>
          </button>

          {/* Image */}
          <div className="relative overflow-hidden flex items-center justify-center max-h-80 group/img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImageUrl}
              alt={post.title || 'Bài tập'}
              className="w-full object-contain max-h-80 hover:scale-[1.01] transition-transform duration-200"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {post.media_type === 'video' && post.media_url && (
        <div className="mt-2 bg-black border-y border-slate-100 dark:border-slate-800">
          <video
            src={post.media_url}
            controls
            className="w-full max-h-72 object-contain"
          />
        </div>
      )}

      {post.media_type === 'youtube' && ytEmbedUrl && (
        <div className="mt-2 aspect-video w-full bg-black border-y border-slate-100 dark:border-slate-800">
          <iframe
            src={ytEmbedUrl}
            title={post.title || 'YouTube Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      )}

      {/* Interactions: Reactions & Comments */}
      <div className="p-3.5 pt-2 flex flex-col gap-2 mt-auto">
        <ReactionBar
          postId={post.id}
          reactions={post.reactions || []}
          currentNickname={currentNickname}
          onToggleReaction={onToggleReaction}
        />

        <CommentSection
          postId={post.id}
          comments={post.comments || []}
          currentNickname={currentNickname}
          onAddComment={onAddComment}
          onOpenNicknameModal={onOpenNicknameModal}
        />
      </div>
    </div>
  );
}

