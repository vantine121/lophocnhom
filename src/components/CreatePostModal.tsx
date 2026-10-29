'use client';

import React, { useState } from 'react';
import { 
  X, Image as ImageIcon, Video, Play, FileText, 
  Upload, AlertCircle, RefreshCw, Sparkles 
} from 'lucide-react';
import { MediaType, GroupColumn } from '@/types/padlet';
import { uploadMediaFile } from '@/lib/supabase';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groups: GroupColumn[];
  currentNickname: string;
  onPostCreated: (postData: {
    group_id: string;
    author_name: string;
    title: string;
    content: string;
    media_type: MediaType;
    media_url: string;
  }) => Promise<void>;
  onOpenNicknameModal?: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  groupId,
  groups,
  currentNickname,
  onPostCreated,
  onOpenNicknameModal,
}: CreatePostModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(groupId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    setSelectedGroupId(groupId);
  }, [groupId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSelectedFile(file);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim() && !selectedFile && !mediaUrl.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề, nội dung hoặc đính kèm tệp ảnh/video.');
      return;
    }

    if (!currentNickname) {
      if (onOpenNicknameModal) onOpenNicknameModal();
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      let finalMediaUrl = mediaUrl.trim();

      // Upload file directly to Supabase Storage
      if (selectedFile) {
        finalMediaUrl = await uploadMediaFile(selectedFile);
      }

      await onPostCreated({
        group_id: selectedGroupId || groups[0]?.id || 'group-1',
        author_name: currentNickname,
        title: title.trim(),
        content: content.trim(),
        media_type: selectedFile ? mediaType : (mediaUrl ? mediaType : 'none'),
        media_url: finalMediaUrl,
      });

      // Reset
      setTitle('');
      setContent('');
      setSelectedFile(null);
      setPreviewUrl('');
      setMediaUrl('');
      onClose();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setErrorMsg(err.message || 'Có lỗi xảy ra khi đăng bài. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-5 sm:fade-in sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 px-5 bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Nộp bài tập mới
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tải lên ảnh chụp bài làm, sơ đồ hoặc video thuyết trình
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}

          {/* Group & Author Bar */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nộp cho cột nhóm:
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Người nộp:
              </label>
              <div 
                onClick={onOpenNicknameModal}
                className="w-full px-3 py-2 text-sm sm:text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-between cursor-pointer hover:border-indigo-400"
                title="Nhấp để đổi tên"
              >
                <span className="truncate">{currentNickname || 'Chưa đặt tên'}</span>
                <span className="text-[11px] text-indigo-500 font-normal shrink-0 ml-1">Đổi</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề bài nộp (ví dụ: Bài tập nhóm tuần 4):
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ngắn gọn..."
              className="w-full px-3.5 py-2.5 text-base sm:text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nội dung mô tả bài làm:
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ghi chú các thành viên tham gia, nội dung tóm tắt..."
              className="w-full px-3.5 py-2.5 text-base sm:text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Media Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Đính kèm tệp phương tiện:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  mediaType === 'image'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Ảnh (PNG/JPG)</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  mediaType === 'video'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Video MP4</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('youtube')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  mediaType === 'youtube'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                <span className="truncate">YouTube</span>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          {(mediaType === 'image' || mediaType === 'video') && (
            <div>
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/40 active:scale-[0.99]">
                <input
                  type="file"
                  accept={mediaType === 'image' ? 'image/*' : 'video/mp4,video/webm'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-center px-2 truncate max-w-full">
                  {selectedFile ? selectedFile.name : `Nhấp để chọn tệp ${mediaType === 'image' ? 'ảnh' : 'video'}`}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Hỗ trợ PNG, JPG, GIF hoặc MP4
                </span>
              </label>

              {previewUrl && mediaType === 'image' && (
                <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-44 flex justify-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Xem trước" className="max-h-44 object-contain" />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* YouTube input */}
          {mediaType === 'youtube' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Đường dẫn liên kết video YouTube:
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 text-base sm:text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </form>

        {/* Sticky Submit Footer: Always visible on mobile! */}
        <div className="p-3.5 px-5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tải lên...</span>
              </>
            ) : (
              <span>Đăng bài nộp ✨</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
