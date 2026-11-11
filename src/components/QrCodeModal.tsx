'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Download, X, ExternalLink, Sparkles } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QrCodeModal({ isOpen, onClose }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://lophocnhom.vercel.app');
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin ? window.location.origin : window.location.href;
      setCurrentUrl(url);
      setImgSrc(`https://api.qrserver.com/v1/create-qr-code/?size=450x450&margin=12&data=${encodeURIComponent(url)}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement('input');
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể sao chép liên kết:', err);
    }
  };

  const handleDownloadQr = async () => {
    try {
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'ma-qr-thcs-dang-lam.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imgSrc, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                <span>Mã QR Lớp Học</span>
                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  THCS Đằng Lâm
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Quét mã để tham gia nộp bài & tương tác
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: QR Code Presentation */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* QR Frame - High contrast white background for fast camera scanning */}
          <div className="p-4 bg-white rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-700 relative group">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt="Mã QR tham gia lớp học"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                onError={() => {
                  setImgSrc(`https://quickchart.io/qr?text=${encodeURIComponent(currentUrl)}&size=450`);
                }}
              />
            ) : (
              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-slate-400">
                Đang tạo mã QR...
              </div>
            )}
            
            {/* Corner scan deco */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-sm pointer-events-none" />
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mở Camera điện thoại hoặc Zalo để quét</span>
          </div>

          {/* Website Link Box */}
          <div className="w-full mt-4 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate text-left pl-1">
              {currentUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              <Download className="w-4 h-4" />
              <span>Tải ảnh QR</span>
            </button>

            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở trang web</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}