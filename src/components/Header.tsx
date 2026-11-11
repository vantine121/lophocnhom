'use client';

import React from 'react';
import { Plus, School, PlaySquare, Sparkles, Microscope, Languages } from 'lucide-react';

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
    <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20 shrink-0">
            <School className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-base sm:text-lg xl:text-xl font-black uppercase tracking-wider bg-gradient-to-r from-blue-700 via-indigo-600 to-rose-600 bg-clip-text text-transparent drop-shadow-xs">
                THCS ĐẰNG LÂM
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Lớp Học Nhóm
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              Nộp bài tập • Chấm điểm & Vẽ chú thích trực tiếp • Thảo luận nhóm
            </p>
          </div>
        </div>

        {/* Center: Chuyên đề KHTN */}
        <div className="hidden md:flex flex-col items-center justify-center text-center px-3.5 py-1 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/70 to-purple-50 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-800/80 border border-indigo-100/90 dark:border-indigo-900/40 shadow-xs mx-auto max-w-md lg:max-w-lg xl:max-w-xl shrink">
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-teal-600 to-indigo-600 text-white tracking-wider shadow-xs">
              <Microscope className="w-3 h-3 text-teal-200" />
              KHTN 6
            </span>
            <span className="text-xs sm:text-[13px] font-extrabold text-slate-800 dark:text-white tracking-tight">
              Bài 20: Sự lớn lên và sinh sản của tế bào
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1 leading-tight mt-0.5">
            <Languages className="w-3 h-3 shrink-0 text-indigo-500" />
            <span className="truncate max-w-[360px] lg:max-w-[460px]">
              Chuyên đề: Phát triển năng lực số & Tích hợp Tiếng Anh chuyên ngành
            </span>
          </p>
        </div>

        {/* Right Actions: Presentation, Add Group, User Nickname */}
        <div className="flex items-center gap-2 shrink-0">
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

      {/* Mobile Topic Ribbon (chỉ hiện trên màn hình nhỏ di động) */}
      <div className="md:hidden mt-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-800 flex flex-col items-center gap-0.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/40">
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-600 text-white">
            KHTN 6
          </span>
          <span className="text-[11px] font-bold text-slate-800 dark:text-white truncate max-w-[240px]">
            Bài 20: Sự lớn lên và sinh sản của tế bào
          </span>
        </div>
        <p className="text-[9.5px] font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[300px]">
          Chuyên đề: Phát triển năng lực số & Tích hợp Tiếng Anh chuyên ngành
        </p>
      </div>
    </header>
  );
}
