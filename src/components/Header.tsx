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
        {/* Brand / Logo (Trường THCS Đằng Lâm - thu nhỏ gọn gàng, trang trọng) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 ring-1 ring-blue-500/20">
            <School className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block leading-tight text-left">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Trường THCS</span>
            <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight block">
              Đằng Lâm
            </span>
          </div>
        </div>

        {/* Center: Chuyên đề KHTN - Nổi bật & To rõ theo đúng poster chuyên đề */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4 mx-2 min-w-0">
          {/* Top badges */}
          <div className="flex items-center gap-1.5 justify-center mb-0.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-600 text-white tracking-wider shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              CHUYÊN ĐỀ
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Môn KHTN 6
            </span>
            <span className="hidden xl:inline-block text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              • GV báo cáo: Lê Thị Thanh Nhàn - Tổ KHTN
            </span>
          </div>

          {/* Dòng 1: Tiêu đề chuyên đề to rõ */}
          <h2 className="text-xs sm:text-sm md:text-[15px] xl:text-base font-black tracking-tight text-blue-950 dark:text-white uppercase leading-tight line-clamp-1">
            PHÁT TRIỂN NĂNG LỰC SỐ VÀ TÍCH HỢP TIẾNG ANH CHUYÊN NGÀNH
          </h2>

          {/* Dòng 2: Tên bài học nổi bật màu đỏ rực rỡ chuẩn poster */}
          <p className="text-[11px] sm:text-xs md:text-[13px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide leading-tight line-clamp-1 mt-0.5">
            QUA BÀI 20 - SỰ LỚN LÊN VÀ SINH SẢN CỦA TẾ BÀO
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
      <div className="md:hidden mt-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-800 flex flex-col items-center gap-1 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
          CHUYÊN ĐỀ MÔN KHTN 6
        </div>
        <div className="text-[11px] font-black text-blue-950 dark:text-white uppercase leading-tight">
          Phát triển năng lực số & Tích hợp Tiếng Anh chuyên ngành
        </div>
        <div className="text-[10.5px] font-black text-rose-600 dark:text-rose-400 uppercase">
          Bài 20 - Sự lớn lên và sinh sản của tế bào
        </div>
      </div>
    </header>
  );
}
