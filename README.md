# 🏫 Class Padlet - Không Gian Nộp Bài Tập Nhóm & Chú Thích Trực Tuyến

Ứng dụng web nộp bài tập nhóm phong cách Padlet dành riêng cho học sinh và giáo viên, được xây dựng bằng **Next.js (App Router)**, **Tailwind CSS**, **Lucide Icons** và kết nối cơ sở dữ liệu thời gian thực **Supabase** (PostgreSQL + Storage + Realtime), sẵn sàng triển khai 1-click lên **Vercel**.

---

## ✨ Các Tính Năng Nổi Bật

### 1. Bố Cục & Quản Lý Nhóm Linh Hoạt (Layout & Columns)
- **Tùy chỉnh bố cục tức thì**:
  - **2 Màn hình (Split 2)**: Chia đôi màn hình so sánh 2 nhóm trực quan.
  - **3 Màn hình (Split 3)**: Hiển thị 3 cột nhóm cân đối.
  - **Tất cả nhóm (Dynamic)**: Cuộn ngang không giới hạn (Kanban/Padlet) với nút thêm nhóm mới.
- **Đổi tên nhóm trực tiếp**: Nhấp vào tên nhóm hoặc biểu tượng bút chì để chỉnh sửa và lưu ngay lập tức.
- **Đổi màu chủ đề từng cột nhóm** (Xanh dương, Xanh lá, Vàng, Tím, Đỏ cam, Chàm).
- **Thiết kế Responsive**: Mượt mà trên cả máy tính, máy chiếu lớp học, iPad và điện thoại.

### 2. Đăng Tải Nội Dung Đa Phương Tiện (Content Upload)
- Nộp bài vào từng cột nhóm tương ứng.
- Đính kèm **Ảnh (JPG, PNG, GIF, WebP)** và **Video (MP4, WebM)**.
- Hỗ trợ nhúng link **YouTube** (tự động nhận diện link video/shorts và phát trực tiếp).
- Viết tiêu đề và mô tả bài tập chi tiết.

### 3. Vẽ & Chú Thích Trực Tiếp Lên Bài Đăng (Canvas Drawing Overlay)
- Tích hợp công cụ vẽ trực tiếp lên ảnh bài làm của học sinh:
  - **Bút viết (Pen)** với các cỡ nét (Mảnh, Vừa, Dày, Lớn).
  - **Bút dạ quang (Highlighter)**: Trong suốt 40% để tô sáng các đoạn văn, công thức quan trọng.
  - **Khoanh tròn (Circle)** & **Khung vuông (Rectangle)**: Khoanh lỗi sai hoặc đóng khung khen ngợi.
  - **Tẩy (Eraser)** & **Hoàn tác (Undo)** nhiều bước.
  - **Bảng màu chấm điểm chuẩn**: Đỏ (sửa lỗi), Xanh lá (đúng/khen), Vàng (lưu ý), Xanh dương, Tím, Đen, Trắng.
  - **Chế độ xem so sánh**: Dễ dàng chuyển đổi giữa *Bản gốc* và *Bản đã vẽ chú thích*.
  - Hỗ trợ vẽ mượt mà bằng chuột hoặc bút cảm ứng trên iPad/máy tính bảng.
  - Nút **Tải về máy (Download PNG)** và **Lưu trực tiếp vào bài đăng**.

### 4. Tương Tác & Phản Hồi Realtime (Reactions & Comments)
- **Thả cảm xúc sinh động**: Thả tim ❤️, Thích 👍, Xuất sắc ⭐, Cháy quá 🔥, Chúc mừng 🎉 với hiệu ứng pháo hoa confetti rực rỡ và bộ đếm thời gian thực.
- **Bình luận góp ý**: Khung thảo luận trao đổi nhận xét giữa giáo viên và học sinh dưới mỗi bài nộp.
- **Không cần đăng nhập**: Học sinh và thầy cô chỉ cần nhập **Biệt danh (Nickname)** kèm biểu tượng cảm xúc yêu thích (🎒, 🚀, 🌟, 🎨, ...) là có thể tham gia ngay lập tức.

---

## 🛠️ Cấu Trúc Thư Mục Dự Án

```
class-padlet/
├── src/
│   ├── app/
│   │   ├── globals.css              # Style Tailwind CSS & custom scrollbar
│   │   ├── layout.tsx               # Cấu trúc gốc và Meta tags
│   │   └── page.tsx                 # Trang chính tích hợp toàn bộ không gian Padlet
│   ├── components/
│   │   ├── Header.tsx               # Thanh điều hướng, đổi layout (2, 3 cột), avatar
│   │   ├── GroupColumn.tsx          # Cột nhóm, đổi tên in-place, màu sắc, nút nộp bài
│   │   ├── PostCard.tsx             # Thẻ bài nộp, trình phát video/ảnh/youtube
│   │   ├── DrawingCanvasModal.tsx   # Bảng vẽ Canvas HTML5 chú thích & chấm điểm bài
│   │   ├── ReactionBar.tsx          # Thanh thả cảm xúc kèm hiệu ứng pháo hoa
│   │   ├── CommentSection.tsx       # Khung bình luận thảo luận
│   │   ├── CreatePostModal.tsx      # Modal nộp bài tập (Upload ảnh, MP4, link Youtube)
│   │   ├── NicknameModal.tsx        # Modal đặt biệt danh học sinh / giáo viên
│   │   └── SupabaseGuideModal.tsx   # Modal hướng dẫn cấu hình Supabase & Vercel
│   ├── lib/
│   │   └── supabase.ts              # Kết nối Supabase Client, Storage & Fallback LocalStorage
│   ├── types/
│   │   └── padlet.ts                # Định nghĩa Typescript cho Group, Post, Comment, Reaction
│   └── sql/
│       └── supabase_schema.sql      # Toàn bộ mã SQL tạo bảng, RLS, Storage và Realtime
├── .env.example                     # Mẫu biến môi trường Supabase
├── package.json
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

1. Di chuyển vào thư mục dự án:
```bash
cd "C:\Users\Admin\.gemini\antigravity\scratch\class-padlet"
```

2. Khởi chạy máy chủ phát triển (Development Server):
```bash
npm run dev
```

3. Mở trình duyệt và truy cập: **`http://localhost:3000`**

*(Ghi chú: Ứng dụng đã được tích hợp sẵn chế độ Offline/LocalStorage Fallback. Bạn có thể trải nghiệm ngay lập tức đầy đủ mọi tính năng vẽ, nộp bài, bình luận trước khi cấu hình Supabase!)*

---

## 🗄️ Cấu Hình Supabase (Chỉ Mất 2 Phút)

Để dữ liệu đồng bộ thời gian thực giữa các máy tính của học sinh và giáo viên:

1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard) và tạo một Project mới.
2. Mở mục **SQL Editor**, sao chép toàn bộ nội dung trong tệp **`src/sql/supabase_schema.sql`** và bấm **Run**. Script này sẽ tự động:
   - Tạo các bảng: `groups`, `posts`, `comments`, `reactions`.
   - Cấp quyền truy cập mở (Row Level Security - RLS) cho người dùng không cần đăng nhập (`anon`).
   - Kích hoạt **Realtime** cho tất cả các bảng.
   - Tạo **Storage Bucket `padlet-media`** với chế độ Public để lưu trữ ảnh và video.
   - Thêm dữ liệu mẫu ban đầu cho 3 nhóm.
3. Vào **Project Settings > API**, sao chép:
   - **Project URL**
   - **anon public key**
4. Tạo tệp `.env.local` trong thư mục gốc và dán:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

---

## ☁️ Triển Khai Lên Vercel (Deploy to Vercel)

1. Đẩy dự án lên GitHub của bạn:
```bash
git init
git add .
git commit -m "feat: initial class padlet app"
git branch -M main
git remote add origin https://github.com/your-username/class-padlet.git
git push -u origin main
```
2. Đăng nhập [Vercel](https://vercel.com) > Chọn **Add New...** > **Project** > Chọn kho lưu trữ GitHub vừa tạo.
3. Trong mục **Environment Variables**, thêm 2 biến:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Sau ~1 phút, bạn sẽ nhận được đường link web chia sẻ cho cả lớp học!
