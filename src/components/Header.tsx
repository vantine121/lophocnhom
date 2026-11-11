'use client';

import React from 'react';
import { Plus, School, PlaySquare, Sparkles } from 'lucide-react';

interface HeaderProps {
  onAddGroup: () => void;
  onOpenPresentation?: () => void;
  currentNickname: string;
  currentAvatar: string;
  onOpenNicknameModal: () => void;
}

export default function Header({
  onAddGroup,
  onOpenPresentation,
  currentNickname,
  currentAvatar,
  onOpenNicknameModal,
}: HeaderProps) {
  return (
    <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 shadow-xs">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 flex-wrap">
              <span className="text-lg sm:text-xl font-black uppercase tracking-wider bg-gradient-to-r from-blue-700 via-indigo-600 to-rose-600 bg-clip-text text-transparent drop-shadow-xs">
                THCS ĐẰNG LÂM
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Lớp Học Nhóm
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              Nộp bài tập • Chấm điểm & Vẽ chú thích trực tiếp • Thảo luận nhóm
            </p>
          </div>
        </div>

        {/* Right Actions: Presentation, Add Group, User Nickname */}
        <div className="flex items-center gap-2">
          {/* Fullscreen Presentation Mode Button */}
          {onOpenPresentation && (
            <button
              onClick={onOpenPresentation}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition transform active:scale-95"
              title="Chế độ trình chiếu bài nộp toàn màn hình"
            >
              <PlaySquare className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Trình chiếu</span>
            </button>
          )}

          {/* Add Group Button */}
          <button
            onClick={onAddGroup}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm cột nhóm</span>
          </button>

          {/* User Nickname Button */}
          <button
            onClick={onOpenNicknameModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-400 transition"
            title="Nhấp để thay đổi tên hoặc biểu tượng hiển thị"
          >
            <span className="text-base select-none">{currentAvatar || '🎒'}</span>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block leading-tight">Bạn là</span>
              <span className="text-xs font-bold text-slate-850 dark:text-white max-w-[120px] truncate block leading-tight">
                {currentNickname || 'Đặt tên'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
