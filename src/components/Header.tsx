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
    <header className="bg-white/95 dark:bg-slate-900/95 border-b border-rose-100 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo (Trường THCS Đằng Lâm - Tổ KHXH) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-400/30 shrink-0">
            <School className="w-6 h-6 text-white" />
          </div>
          <div className="leading-tight text-left">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              UBND PHƯỜNG HẢI AN
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                THCS ĐẰNG LÂM
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Tổ KHXH
              </span>
            </div>
            <p className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
              Lớp học nhóm số • Tương tác trực tuyến
            </p>
          </div>
        </div>

        {/* Center: Chuyên đề KHXH (Lịch sử - Địa lí 8) chuẩn mẫu ảnh */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-3 sm:px-6 mx-1 sm:mx-3 py-1.5 rounded-3xl bg-white dark:bg-slate-900/90 border border-rose-100 dark:border-slate-700/60 shadow-sm min-w-0 max-w-4xl">
          {/* Top badges */}
          <div className="flex items-center gap-2 justify-center mb-1 flex-wrap">
            <span className="px-3 py-0.5 rounded-full text-[10.5px] font-black uppercase bg-slate-900 text-white tracking-wider shadow-xs">
              CHUYÊN ĐỀ
            </span>
            <span className="px-3 py-0.5 rounded-full text-[10.5px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
              Môn Lịch sử - Địa lí 8
            </span>
          </div>

          {/* Dòng 1: Tiêu đề chuyên đề to rõ */}
          <h2 className="text-xs sm:text-[14px] md:text-base lg:text-[17px] font-black tracking-tight text-slate-900 dark:text-white uppercase leading-snug">
            CHUYÊN ĐỀ MÔN LỊCH SỬ - ĐỊA LÍ 8
          </h2>

          {/* Dòng 2: Nội dung tích hợp nổi bật màu đỏ rực rỡ chuẩn mẫu ảnh */}
          <p className="text-[11px] sm:text-xs md:text-[13px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide leading-snug mt-0.5">
            TÍCH HỢP NĂNG LỰC SỐ VÀ HOẠT ĐỘNG NHÓM TƯƠNG TÁC
          </p>
        </div>

        {/* Right Actions: Thu gọn tinh tế theo biểu tượng để nhường toàn bộ không gian cho tiêu đề */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* QR Code Button */}
          {onOpenQrCode && (
            <button
              onClick={onOpenQrCode}
              className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-rose-300 border border-rose-200 dark:border-slate-700 shadow-xs flex items-center justify-center transition transform active:scale-95"
              title="Mở mã QR lớp học"
            >
              <QrCode className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </button>
          )}

          {/* Fullscreen Presentation Mode Button */}
          {onOpenPresentation && (
            <button
              onClick={onOpenPresentation}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center transition transform active:scale-95"
              title="Chế độ trình chiếu toàn màn hình"
            >
              <PlaySquare className="w-4 h-4 text-emerald-100" />
            </button>
          )}

          {/* Add Group Button */}
          <button
            onClick={onAddGroup}
            className="w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center justify-center transition transform active:scale-95"
            title="Thêm cột nhóm mới"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* User Nickname Button */}
          <button
            onClick={onOpenNicknameModal}
            className="h-9 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200/80 dark:border-slate-700 shadow-xs hover:border-rose-400 transition flex items-center gap-1.5"
            title={`Biệt danh của bạn: ${currentNickname || 'Chưa đặt'}`}
          >
            <span className="text-base select-none leading-none">{currentAvatar || '🎒'}</span>
            <span className="hidden xl:inline text-xs font-bold text-slate-800 dark:text-white max-w-[80px] truncate leading-none">
              {currentNickname || 'Bạn là'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Topic Ribbon (chỉ hiện trên màn hình nhỏ di động) */}
      <div className="md:hidden mt-2 pt-1.5 border-t border-rose-100 dark:border-slate-800 flex flex-col items-center gap-1 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
          CHUYÊN ĐỀ MÔN LỊCH SỬ - ĐỊA LÍ 8
        </div>
        <div className="text-[10.5px] font-black text-rose-600 dark:text-rose-400 uppercase">
          Tích hợp năng lực số và hoạt động nhóm tương tác
        </div>
      </div>
    </header>
  );
}
