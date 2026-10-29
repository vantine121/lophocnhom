-- ========================================================
-- SCRIPT CẤU HÌNH CƠ SỞ DỮ LIỆU SUPABASE CHO CLASS PADLET
-- Chạy toàn bộ script này trong mục: SQL Editor của Supabase
-- ========================================================

-- 1. TẠO BẢNG NHÓM (GROUPS / COLUMNS)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Nhóm mới',
    color TEXT DEFAULT 'blue',
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TẠO BẢNG BÀI ĐĂNG (POSTS)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL DEFAULT 'Học sinh',
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    media_type TEXT DEFAULT 'none', -- 'none' | 'image' | 'video' | 'youtube'
    media_url TEXT DEFAULT '',
    annotated_image_url TEXT DEFAULT '',
    annotations_data JSONB DEFAULT '[]'::jsonb,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TẠO BẢNG BÌNH LUẬN (COMMENTS)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TẠO BẢNG CẢM XÚC (REACTIONS)
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'like', 'heart', 'star', 'fire', 'celebrate'
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_post_reaction UNIQUE (post_id, author_name, type)
);

-- 5. TẠO INDEXES ĐỂ TRUY VẤN CỰC NHANH
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);

-- 6. THIẾT LẬP ROW LEVEL SECURITY (RLS)
-- Cho phép Học sinh & Giáo viên không cần đăng nhập vẫn xem, đăng bài, vẽ và bình luận (Role: anon)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Policies cho groups
CREATE POLICY "Public full access groups" ON public.groups FOR ALL USING (true) WITH CHECK (true);

-- Policies cho posts
CREATE POLICY "Public full access posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

-- Policies cho comments
CREATE POLICY "Public full access comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- Policies cho reactions
CREATE POLICY "Public full access reactions" ON public.reactions FOR ALL USING (true) WITH CHECK (true);

-- 7. KÍCH HOẠT SUPABASE REALTIME
-- Bật realtime để học sinh và giáo viên thấy cập nhật tức thì không cần tải lại trang
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;

-- 8. TẠO BUCKET LƯU TRỮ TỆP ẢNH / VIDEO (STORAGE BUCKET: padlet-media)
INSERT INTO storage.buckets (id, name, public)
VALUES ('padlet-media', 'padlet-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Thiết lập phân quyền cho Storage Bucket
CREATE POLICY "Public Access padlet-media select"
ON storage.objects FOR SELECT
USING (bucket_id = 'padlet-media');

CREATE POLICY "Public Access padlet-media insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'padlet-media');

CREATE POLICY "Public Access padlet-media update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'padlet-media');

CREATE POLICY "Public Access padlet-media delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'padlet-media');

-- 9. CHÈN DỮ LIỆU MẪU BAN ĐẦU (3 NHÓM MẪU)
DO $$
DECLARE
    g1_id UUID := gen_random_uuid();
    g2_id UUID := gen_random_uuid();
    g3_id UUID := gen_random_uuid();
    p1_id UUID := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.groups) THEN
        INSERT INTO public.groups (id, title, color, order_index) VALUES
            (g1_id, 'Nhóm 1: Sao Hỏa 🚀', 'blue', 0),
            (g2_id, 'Nhóm 2: Mặt Trời ☀️', 'amber', 1),
            (g3_id, 'Nhóm 3: Dải Ngân Hà 🌌', 'purple', 2);

        INSERT INTO public.posts (id, group_id, author_name, title, content, media_type, media_url, order_index) VALUES
            (p1_id, g1_id, 'Giáo viên Chủ nhiệm', 'Chào mừng cả lớp! 👋', 'Các nhóm hãy cùng nhau thảo luận, tải sơ đồ tư duy hoặc chụp ảnh bài làm lên đây nhé! Thầy cô và các bạn có thể chấm điểm và vẽ trực tiếp lên bài để góp ý.', 'none', '', 0);

        INSERT INTO public.comments (post_id, author_name, content) VALUES
            (p1_id, 'Minh Anh', 'Dạ chúng em đã sẵn sàng nộp bài rồi ạ! ✨');

        INSERT INTO public.reactions (post_id, author_name, type) VALUES
            (p1_id, 'Minh Anh', 'heart'),
            (p1_id, 'Thanh Phong', 'like'),
            (p1_id, 'Bảo Ngọc', 'star');
    END IF;
END $$;

