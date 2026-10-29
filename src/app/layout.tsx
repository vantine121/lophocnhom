import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Class Padlet - Nộp Bài Tập Nhóm & Chú Thích Trực Tuyến",
  description: "Ứng dụng web nộp bài tập nhóm cho học sinh và giáo viên: chia cột linh hoạt, vẽ chú thích chấm bài trên ảnh, bình luận và thả cảm xúc realtime.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
