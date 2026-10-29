'use client';

import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, X, ShieldCheck, Zap } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCRIPT_SHORT = `-- ========================================================
-- SCRIPT CẤU HÌNH SUPABASE CHO ỨNG DỤNG CLASS PADLET
-- Sao chép toàn bộ nội dung này và dán vào Supabase SQL Editor
-- ========================================================

CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Nhóm mới',
    color TEXT DEFAULT 'blue',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL DEFAULT 'Học sinh',
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    media_type TEXT DEFAULT 'none',
    media_url TEXT DEFAULT '',
    annotated_image_url TEXT DEFAULT '',
    annotations_data JSONB DEFAULT '[]'::jsonb,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_post_reaction UNIQUE (post_id, author_name, type)
);

-- RLS: Cho phép mọi người (anon) đọc, đăng bài, vẽ và bình luận tự do
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public groups" ON public.groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public reactions" ON public.reactions FOR ALL USING (true) WITH CHECK (true);

-- Bật Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;

-- Storage Bucket cho Ảnh/Video
INSERT INTO storage.buckets (id, name, public)
VALUES ('padlet-media', 'padlet-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access padlet-media select" ON storage.objects FOR SELECT USING (bucket_id = 'padlet-media');
CREATE POLICY "Public Access padlet-media insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'padlet-media');
CREATE POLICY "Public Access padlet-media update" ON storage.objects FOR UPDATE USING (bucket_id = 'padlet-media');
CREATE POLICY "Public Access padlet-media delete" ON storage.objects FOR DELETE USING (bucket_id = 'padlet-media');
`;

export default function SupabaseGuideModal({ isOpen, onClose }: SupabaseGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT_SHORT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Hướng dẫn cấu hình Supabase & Deploy Vercel
                {isSupabaseConfigured ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                    ✓ Đã kết nối Supabase
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                    Đang chạy chế độ Demo Local
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chỉ mất 2 phút để đồng bộ dữ liệu lớp học trực tuyến
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
          {/* Step 1 */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              Chạy mã SQL trên Supabase
            </h3>
            <p>
              Vào trang quản trị <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a> &gt; chọn dự án của bạn &gt; mở mục <strong>SQL Editor</strong> &gt; dán đoạn script bên dưới và nhấn <strong>Run</strong>:
            </p>

            <div className="relative mt-2">
              <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 border border-slate-800">
                {SQL_SCRIPT_SHORT}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép SQL!' : 'Sao chép SQL'}</span>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              Lấy API Keys và thêm vào biến môi trường (.env.local hoặc Vercel)
            </h3>
            <p>
              Vào <strong>Project Settings &gt; API</strong> trên Supabase, sao chép:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Project URL</strong>: gán vào <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">NEXT_PUBLIC_SUPABASE_URL</code></li>
              <li><strong>anon public key</strong>: gán vào <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            </ul>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
            </div>
          </div>

          {/* Step 3: Vercel Deploy */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              Triển khai lên Vercel (1 Click)
            </h3>
            <p>
              Đẩy mã nguồn lên GitHub, kết nối với <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline">Vercel</a>, sau đó dán 2 biến môi trường trên vào mục <strong>Environment Variables</strong> và bấm Deploy!
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Đã hiểu, quay lại lớp học
          </button>
        </div>
      </div>
    </div>
  );
}

