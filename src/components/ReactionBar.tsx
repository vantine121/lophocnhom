'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { ReactionItem } from '@/types/padlet';

interface ReactionBarProps {
  postId: string;
  reactions: ReactionItem[];
  currentNickname: string;
  onToggleReaction: (postId: string, type: ReactionItem['type']) => void;
}

const REACTION_CONFIG: { type: ReactionItem['type']; emoji: string; label: string; activeColor: string }[] = [
  { type: 'heart', emoji: '❤️', label: 'Thả tim', activeColor: 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800' },
  { type: 'like', emoji: '👍', label: 'Thích', activeColor: 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800' },
  { type: 'star', emoji: '⭐', label: 'Xuất sắc', activeColor: 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800' },
  { type: 'fire', emoji: '🔥', label: 'Cháy quá', activeColor: 'bg-orange-50 border-orange-300 text-orange-600 dark:bg-orange-950/40 dark:border-orange-800' },
  { type: 'celebrate', emoji: '🎉', label: 'Chúc mừng', activeColor: 'bg-purple-50 border-purple-300 text-purple-600 dark:bg-purple-950/40 dark:border-purple-800' },
];

export default function ReactionBar({
  postId,
  reactions = [],
  currentNickname,
  onToggleReaction,
}: ReactionBarProps) {
  const safeReactions = Array.isArray(reactions) ? reactions : [];

  const handleReactionClick = (e: React.MouseEvent<HTMLButtonElement>, type: ReactionItem['type']) => {
    // Confetti effect at button position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 22,
      spread: 50,
      origin: { x, y },
      ticks: 160,
      colors: ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'],
    });

    onToggleReaction(postId, type);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
      {REACTION_CONFIG.map(({ type, emoji, label, activeColor }) => {
        const matchingReactions = safeReactions.filter((r) => r.type === type);
        const count = matchingReactions.length;
        const hasReacted = Boolean(
          currentNickname && matchingReactions.some((r) => r.author_name === currentNickname)
        );

        return (
          <button
            key={type}
            onClick={(e) => handleReactionClick(e, type)}
            title={`${label} (${matchingReactions.map((r) => r.author_name).join(', ') || 'Chưa có ai'})`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all transform active:scale-90 ${
              hasReacted
                ? `${activeColor} shadow-xs font-bold scale-105`
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-sm select-none">{emoji}</span>
            <span className={`text-[11px] font-bold ${
              hasReacted 
                ? 'text-inherit font-extrabold' 
                : count > 0 
                  ? 'text-slate-800 dark:text-slate-200' 
                  : 'text-slate-400 dark:text-slate-500 font-medium'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
