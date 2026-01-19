export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  createdAt: Date | string;
  categories?: { name: string; slug: string }[];
  stats?: { views?: number; likes?: number } | null;
}

export interface HomePageProps {
  bitcoinArticles: Article[];
  ethereumArticles: Article[];
  altcoinArticles: Article[];
  marketArticles: Article[];
  topViewedArticles: Article[];
  topLikedArticles: Article[];
  featuredArticles: Article[];
}
