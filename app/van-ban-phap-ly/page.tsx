import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Scale,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  Clock,
  Eye,
  Search,
  Menu
} from "lucide-react";

export const revalidate = 60;

// Helper to format date
const formatDate = (date: Date | null | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Helper to get a placeholder image based on string
const getPlaceholderImage = (str: string) => {
  const images = [
    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",   
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80",   
    "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=800&q=80",   
    "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&w=800&q=80",   
    "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=800&q=80",   
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80"    
  ];
  // Simple hash function to pick consistent image for same title
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
};

export const metadata = {
  title: "Văn bản Pháp lý - Crypto News",
  description: "Tra cứu các văn bản pháp luật liên quan đến tiền mã hóa",
};

export default async function LegalNewsPage() {
  // Fetch a good amount of data to populate sections
  const allDocs = await prisma.legalDocument.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  // Partition data
  const featuredDoc = allDocs[0];
  const topNews = allDocs.slice(1, 5);
  const newDocs = allDocs.slice(5, 10);
  const policyDocs = allDocs.slice(10, 15);
  const adminDocs = allDocs.slice(15, 20);
  const sidebarDocs = allDocs.slice(20, 30);

  // Stats
  const total = await prisma.legalDocument.count();

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 pt-32">
      {/* Top Navigation Bar (Mimic) */}
      <div className="fixed top-28 left-0 right-0 bg-[#b91c1c] text-white text-sm z-40">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <Link href="/" className="font-bold hover:text-yellow-200 whitespace-nowrap">TRANG CHỦ</Link>
            <Link href="/van-ban-phap-ly" className="hover:text-yellow-200 whitespace-nowrap font-semibold border-b-2 border-yellow-400">THƯ VIỆN PHÁP LUẬT</Link>
            <span className="hover:text-yellow-200 whitespace-nowrap font-semibold text-yellow-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              VĂN BẢN MỚI
            </span>
            <Link href="/kho-bieu-mau" className="hover:text-yellow-200 whitespace-nowrap cursor-pointer">BIỂU MẪU</Link>
            <span className="hover:text-yellow-200 whitespace-nowrap cursor-pointer">CÔNG BÁO</span>  
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm văn bản..."
              className="bg-red-800 text-white placeholder-red-300 text-xs px-2 py-1 rounded border-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Banner Area */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-4">        
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg text-white">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-700 uppercase">Chính Sách & Pháp Luật</h1>   
              <p className="text-xs text-gray-500">Cập nhật văn bản pháp luật mới nhất 24/7</p>       
            </div>
          </div>
          <div className="hidden md:flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-red-600" />
              <span>{total} văn bản</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-red-600" />
              <span>{formatDate(new Date())}</span>
            </div>
          </div>
        </div>

        {/* TOP SECTION: Featured + Top List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Featured Article (Left - 2 cols) */}
          <div className="lg:col-span-2 group cursor-pointer">
            {featuredDoc && (
              <Link href={`/article/${featuredDoc.slug}`} className="block h-full relative overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200">
                <div className="h-64 w-full relative overflow-hidden">
                   <img
                      src={getPlaceholderImage(featuredDoc.title)}
                      alt={featuredDoc.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                   />
                   <div className="absolute bottom-0 left-0 bg-red-600 text-white text-xs px-3 py-1 font-bold uppercase">
                      Nổi bật
                   </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-3 line-clamp-2">
                    {featuredDoc.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(featuredDoc.promulgationDate)}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {featuredDoc.issuingAgency}</span>
                  </div>
                  <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                    {featuredDoc.summary || "Nội dung văn bản đang được cập nhật..."}
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* Top News List (Right - 1 col) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-4">   
              <h3 className="text-red-700 font-bold uppercase text-sm flex items-center gap-2">       
                <Clock className="w-4 h-4" /> Mới cập nhật
              </h3>
              <Link href="/van-ban-phap-ly" className="text-[10px] text-gray-500 hover:text-red-600 flex items-center">
                Xem tất cả <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {topNews.map((doc) => (
                <Link key={doc.id} href={`/article/${doc.slug}`} className="group flex gap-3 items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={getPlaceholderImage(doc.title)}
                      alt={doc.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-red-600 line-clamp-2 mb-1 leading-snug">
                      {doc.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      {formatDate(doc.promulgationDate)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN BODY: 2 Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Content Column (3 cols) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Section 1: Văn bản mới */}
            <SectionBlock title="Thông báo văn bản mới" icon={<FileText className="w-5 h-5" />} docs={newDocs} color="blue" />

            {/* Section 2: Chính sách mới */}
            <SectionBlock title="Chính sách nổi bật" icon={<Scale className="w-5 h-5" />} docs={policyDocs} color="orange" />

            {/* Section 3: Thủ tục hành chính */}
            <SectionBlock title="Thủ tục hành chính" icon={<Building2 className="w-5 h-5" />} docs={adminDocs} color="green" />

            {/* Section 4: Án lệ / Khác */}
            <SectionBlock title="Văn bản chỉ đạo điều hành" icon={<Menu className="w-5 h-5" />} docs={sidebarDocs.slice(0, 5)} color="purple" />

          </div>

          {/* Sidebar Column (1 col) */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Ad Placeholder */}
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-gray-300">
              Quảng cáo / Banner
            </div>

            {/* Most Viewed List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">    
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-gray-800 font-bold text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-red-600" /> Xem nhiều nhất
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {sidebarDocs.map((doc, idx) => (
                  <Link key={doc.id} href={`/article/${doc.slug}`} className="block p-3 hover:bg-gray-50 group">
                    <div className="flex gap-3">
                      <span className="text-2xl font-bold text-gray-200 group-hover:text-red-200 font-serif italic">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 group-hover:text-red-600 line-clamp-2 mb-1">
                          {doc.title}
                        </h4>
                        <span className="text-[10px] text-gray-400">{doc.issuingAgency}</span>        
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Useful Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-gray-800 font-bold text-sm mb-3 border-l-4 border-blue-600 pl-2">   
                Liên kết hữu ích
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li><a href="#" className="hover:underline flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Tra cứu Công báo</a></li>
                <li><a href="#" className="hover:underline flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Văn bản hợp nhất</a></li>
                <li><a href="#" className="hover:underline flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Dự thảo văn bản</a></li>
                <li><a href="#" className="hover:underline flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Điều ước quốc tế</a></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Section Component
function SectionBlock({ title, icon, docs, color }: { title: string, icon: React.ReactNode, docs: any[], color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "border-blue-600 text-blue-700",
    orange: "border-orange-600 text-orange-700",
    green: "border-green-600 text-green-700",
    purple: "border-purple-600 text-purple-700",
  };

  const mainDoc = docs[0];
  const listDocs = docs.slice(1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className={`px-4 py-2 border-t-4 ${colorClasses[color]} bg-gray-50 flex items-center justify-between`}>
        <h3 className="font-bold text-sm uppercase flex items-center gap-2">
          {icon} {title}
        </h3>
        <Link href="/van-ban-phap-ly" className="text-xs text-gray-500 hover:text-red-600">Xem thêm &raquo;</Link>   
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Main Highlighted Doc */}
        {mainDoc && (
          <Link href={`/article/${mainDoc.slug}`} className="group mb-4 block">
            <div className="flex gap-3 mb-2">
               <div className="w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                  <img
                    src={getPlaceholderImage(mainDoc.title)}
                    alt={mainDoc.title}
                    className="w-full h-full object-cover"
                  />
               </div>
               <div>
                 <h4 className="font-bold text-sm text-gray-900 group-hover:text-red-600 line-clamp-2 leading-snug">
                   {mainDoc.title}
                 </h4>
                 <span className="text-[10px] text-gray-500 mt-1 block">{formatDate(mainDoc.promulgationDate)}</span>
               </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 border-b border-gray-100 pb-3">
              {mainDoc.summary || "Tóm tắt nội dung văn bản..."}
            </p>
          </Link>
        )}

        {/* List Docs */}
        <ul className="space-y-3">
          {listDocs.map((doc) => (
            <li key={doc.id}>
              <Link href={`/article/${doc.slug}`} className="group flex items-start gap-2">
                <span className="text-red-500 mt-1 text-[10px]">●</span>
                <span className="text-xs text-gray-700 group-hover:text-red-600 line-clamp-2 font-medium">
                  {doc.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
