import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Article } from "@/types";

export default function ArticleSideCard({ article }: { article: Article }) {
  return (
    <div className="flex-1">
      <Link
        href={`/article/${article.slug}`}
        className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1"
      >
        <div className="flex items-start gap-4 p-4 h-full">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
            <Image
              src={article.thumbnail || "/placeholder.jpg"}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {article.title}
            </h3>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Clock size={12} />
                {new Date(article.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
