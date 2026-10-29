'use client';

import React, { useState } from 'react';
import { User, Sparkles, Check, X } from 'lucide-react';

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNickname: string;
  currentAvatar: string;
  onSave: (nickname: string, avatar: string) => void;
  isInitialPrompt?: boolean;
}

const AVATAR_OPTIONS = ['🎒', '🚀', '🌟', '🎨', '📚', '🦁', '🐱', '💡', '🔬', '🏆', '🎯', '🧑‍🏫'];

export default function NicknameModal({
  isOpen,
  onClose,
  currentNickname,
  currentAvatar,
  onSave,
  isInitialPrompt = false,
}: NicknameModalProps) {
  const [name, setName] = useState(currentNickname || '');
  const [avatar, setAvatar] = useState(currentAvatar || '🎒');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên hoặc biệt danh của bạn!');
      return;
    }
    onSave(name.trim(), avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center">
          {/* Avatar circle */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-3xl flex items-center justify-center mx-auto mb-3 border border-indigo-200 dark:border-indigo-800 shadow-inner">
            {avatar}
          </div>

          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {isInitialPrompt ? 'Chào mừng bạn đến với lớp học!' : 'Thay đổi Biệt danh của bạn'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Không cần tài khoản hay mật khẩu, chỉ cần nhập tên để thầy cô và các bạn nhận ra bạn nhé.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-left">
            {error && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg text-center font-medium">
                {error}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tên / Biệt danh hiển thị:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Ví dụ: Minh Triết (Nhóm 1) hoặc Cô Thu Hương"
                autoFocus
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Chọn biểu tượng đại diện:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-9 rounded-xl text-lg flex items-center justify-center transition border ${
                      avatar === emoji
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-500 scale-105 shadow'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {!isInitialPrompt && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center"
                >
                  Đóng
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition text-center flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Vào lớp học</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

