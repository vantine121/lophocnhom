'use client';

import React, { useState } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { CommentItem } from '@/types/padlet';

interface CommentSectionProps {
  postId: string;
  comments: CommentItem[];
  currentNickname: string;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onOpenNicknameModal?: () => void;
}

export default function CommentSection({
  postId,
  comments = [],
  currentNickname,
  onAddComment,
  onOpenNicknameModal,
}: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (!currentNickname) {
      if (onOpenNicknameModal) onOpenNicknameModal();
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(postId, content.trim());
      setContent('');
      setIsExpanded(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleComments = isExpanded ? comments : comments.slice(-2);
  const hiddenCount = comments.length - visibleComments.length;

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
      {/* Comments Header / Toggle */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span>Bình luận ({comments.length})</span>
        </span>

        {comments.length > 2 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {isExpanded ? (
              <>
                <span>Thu gọn</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Xem thêm {hiddenCount} nhận xét</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-xs"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {comment.author_name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(comment.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs break-words leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic py-0.5">
          Chưa có nhận xét nào. Thầy cô và các bạn hãy gửi lời góp ý nhé!
        </p>
      )}

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Bình luận (${currentNickname || 'Bạn chưa đặt tên'})...`}
          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition flex items-center justify-center shrink-0 shadow-sm"
          title="Gửi bình luận"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

