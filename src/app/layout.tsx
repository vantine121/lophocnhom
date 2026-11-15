import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THCS ĐẰNG LÂM - Môn Lịch sử & Địa lí 8 - Lớp Học Nhóm",
  description: "Chuyên đề môn Lịch sử - Địa lí 8 trường THCS Đằng Lâm: Tích hợp năng lực số và hoạt động nhóm tương tác.",
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
