'use client';

import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface HeaderProps {
  onAddGroup: () => void;
  currentNickname: string;
  currentAvatar: string;
  onOpenNicknameModal: () => void;
  onOpenSupabaseGuide: () => void;
}

export default function Header({
  onAddGroup,
  currentNickname,
  currentAvatar,
  onOpenNicknameModal,
  onOpenSupabaseGuide,
}: HeaderProps) {
  return (
    <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 shadow-xs">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Lớp Học Thông Minh</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Padlet Nhóm
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Nộp bài tập • Chấm điểm & Vẽ chú thích trực tiếp • Thảo luận nhóm
            </p>
          </div>
        </div>

        {/* Right Actions: Add Group, User Nickname, Supabase Status */}
        <div className="flex items-center gap-2">
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

          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSupabaseGuide}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
              isSupabaseConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
            }`}
            title="Xem trạng thái Supabase"
          >
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="hidden md:inline">
              {isSupabaseConfigured ? 'Supabase Online' : 'Kết nối Supabase'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
