import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "时光印记 Pro - AI Bulk Restoration",
  description:
    "AI 老照片批量修复：自动识别照片边缘、裁剪背景、去污上色",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
