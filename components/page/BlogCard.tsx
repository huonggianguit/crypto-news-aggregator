// components/page/BlogCard.tsx
import { Calendar, ArrowRight } from "lucide-react";

interface BlogCardProps {
  image: string;
  category: string;
  date: string;
  title: string;
  shortContent: string;
  slug: string;
  onClick?: () => void;
}

export function BlogCard({
  image,
  category,
  date,
  title,
  shortContent,
  onClick,
}: BlogCardProps) {
  return (
    <article
      onClick={onClick}
      className="h-full flex flex-col group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-red-200 hover:-translate-y-2"
    >
      <div className="relative overflow-hidden aspect-[16/10] flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Category Badge */}
        <span className="absolute top-5 left-5 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-full text-xs uppercase tracking-wider shadow-xl backdrop-blur-sm">
          {category}
        </span>

        {/* Date Badge */}
        <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
          <Calendar className="w-4 h-4 text-red-500" />
          <time className="text-sm text-gray-700">{date}</time>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-7">
        <h3 className="mb-4 text-gray-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-snug min-h-[3.5rem]">
          {title}
        </h3>

        <p className="text-gray-600 leading-relaxed line-clamp-3 mb-5 flex-1">
          {shortContent}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
          <span className="text-red-600 inline-flex items-center gap-2 transition-all group-hover:gap-3">
            <span>Đọc tiếp</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>

          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 group-hover:scale-125 transition-transform" />
            <div className="w-2 h-2 rounded-full bg-pink-400 group-hover:scale-125 transition-transform delay-75" />
            <div className="w-2 h-2 rounded-full bg-red-300 group-hover:scale-125 transition-transform delay-150" />
          </div>
        </div>
      </div>
    </article>
  );
}
