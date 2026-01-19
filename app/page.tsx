import HomePage from "@/components/page/home/HomePage";
import {
  CATEGORY_SLUGS,
  ARTICLE_CONFIG,
} from "@/config/categories";
import {
  getArticlesByCategory,
  getTopViewedArticles,
  getTopLikedArticles,
  getRecentArticles,
  mapToUIArticle,
} from "@/lib/db/articles";

export default async function Home() {
  // Fetch all required data in parallel
  const [
    bitcoinRaw,
    ethereumRaw,
    altcoinRaw,
    marketRaw,
    topViewedRaw,
    topLikedRaw,
    featuredRaw,
  ] = await Promise.all([
    // Bitcoin Articles
    getArticlesByCategory(
      CATEGORY_SLUGS.BITCOIN,
      ARTICLE_CONFIG.HOME_SECTION_LIMIT
    ),
    // Ethereum Articles
    getArticlesByCategory(
      CATEGORY_SLUGS.ETHEREUM,
      ARTICLE_CONFIG.HOME_SECTION_LIMIT
    ),
    // Altcoin Articles
    getArticlesByCategory(
      CATEGORY_SLUGS.ALTCOIN,
      ARTICLE_CONFIG.HOME_SECTION_LIMIT
    ),
    // Market Articles
    getArticlesByCategory(
      CATEGORY_SLUGS.MARKET,
      ARTICLE_CONFIG.HOME_SECTION_LIMIT
    ),
    // Top Viewed Articles
    getTopViewedArticles(ARTICLE_CONFIG.HOME_TOP_VIEWED_LIMIT),
    // Top Liked Articles
    getTopLikedArticles(ARTICLE_CONFIG.HOME_TOP_LIKED_LIMIT),
    // Featured (recent articles for slider)
    getRecentArticles(ARTICLE_CONFIG.HOME_FEATURED_LIMIT),
  ]);

  return (
    <HomePage
      bitcoinArticles={bitcoinRaw.map(mapToUIArticle)}
      ethereumArticles={ethereumRaw.map(mapToUIArticle)}
      altcoinArticles={altcoinRaw.map(mapToUIArticle)}
      marketArticles={marketRaw.map(mapToUIArticle)}
      topViewedArticles={topViewedRaw.map(mapToUIArticle)}
      topLikedArticles={topLikedRaw.map(mapToUIArticle)}
      featuredArticles={featuredRaw.map(mapToUIArticle)}
    />
  );
}
