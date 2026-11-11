'use client';

import React from 'react';
import { Plus, School, PlaySquare, Sparkles, Microscope, Languages, QrCode } from 'lucide-react';

interface HeaderProps {
  onAddGroup: () => void;
  onOpenPresentation?: () => void;
  onOpenQrCode?: () => void;
  currentNickname: string;
  currentAvatar: string;
  onOpenNicknameModal: () => void;
}

export default function Header({
  onAddGroup,
  onOpenPresentation,
  onOpenQrCode,
  currentNickname,
  currentAvatar,
  onOpenNicknameModal,
}: HeaderProps) {
  return (
    <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo (Trường THCS Đằng Lâm - To rõ, trang trọng, lấp đầy không gian) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 shrink-0">
            <School className="w-6 h-6 text-white" />
          </div>
          <div className="leading-tight text-left">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              UBND QUẬN HẢI AN
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-blue-950 dark:text-white">
                THCS ĐẰNG LÂM
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Tổ KHTN
              </span>
            </div>
            <p className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
              Lớp học nhóm số • Tương tác trực tuyến
            </p>
          </div>
        </div>

        {/* Center: Chuyên đề KHTN - Nổi bật trong card tinh tế, cân bằng khoảng trống */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-1.5 mx-2 lg:mx-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-blue-100/90 dark:border-slate-700/60 shadow-xs min-w-0 max-w-2xl xl:max-w-3xl">
          {/* Top badges */}
          <div className="flex items-center gap-2 justify-center mb-0.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-600 text-white tracking-wider shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              CHUYÊN ĐỀ
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              Môn KHTN 6
            </span>
            <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300">
              • GV: Lê Thị Thanh Nhàn
            </span>
          </div>

          {/* Dòng 1: Tiêu đề chuyên đề to rõ */}
          <h2 className="text-xs sm:text-sm lg:text-[15px] font-black tracking-tight text-blue-950 dark:text-white uppercase leading-tight line-clamp-1">
            PHÁT TRIỂN NĂNG LỰC SỐ VÀ TÍCH HỢP TIẾNG ANH CHUYÊN NGÀNH
          </h2>

          {/* Dòng 2: Tên bài học nổi bật màu đỏ rực rỡ chuẩn poster */}
          <p className="text-[11px] sm:text-xs lg:text-[13px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide leading-tight line-clamp-1 mt-0.5">
            QUA BÀI 20 - SỰ LỚN LÊN VÀ SINH SẢN CỦA TẾ BÀO
          </p>
        </div>

        {/* Right Actions: Presentation, Add Group, User Nickname */}
        <div className="flex items-center gap-2 shrink-0">
          {/* QR Code Button */}
          {onOpenQrCode && (
            <button
              onClick={onOpenQrCode}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 shadow-xs transition transform active:scale-95"
              title="Mở mã QR để học sinh hoặc người tham dự quét vào lớp ngay"
            >
              <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Mã QR</span>
            </button>
          )}

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
