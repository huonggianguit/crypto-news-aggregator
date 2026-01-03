import type { Metadata } from "next";
import "./globals.css";
import { GlobalHeader } from "@/components/header-web/GlobalHeader";
import { Footer } from "@/components/footer-web/Footer";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "Crypto News Hub - Tin tức tiền mã hóa",
  description: "Cổng thông tin hàng đầu về tiền mã hóa, Bitcoin, Ethereum, DeFi và Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..700,0..1,-50..200"
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        <GlobalHeader />
        {children}
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}
