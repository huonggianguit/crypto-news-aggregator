import type { Metadata } from "next";
import "./globals.css";
import { GlobalHeader } from "@/components/header-web/GlobalHeader";
import { Footer } from "@/components/footer-web/Footer";
import { prisma } from "@/lib/db/index";
import ChatBot from "@/components/ChatBot";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Crypto News Hub - Tin tức tiền mã hóa",
  description: "Cổng thông tin hàng đầu về tiền mã hóa, Bitcoin, Ethereum, DeFi và Blockchain",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories for mega menu
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..700,0..1,-50..200"
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        <Providers>
          <GlobalHeader categories={categories} />
          {children}
          <Footer />
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
