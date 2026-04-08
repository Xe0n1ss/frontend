import api from "./api";
import { mockArticles } from "../data/mockArticles";
import { mapArticle } from "./mappers";
import { shuffleArray } from "../utils/shuffleArray";

type ArticlesListResponse = {
  articles: Array<{
    article_id: string;
    title: string;
    content?: string;
    preview?: string;
    category: string;
    tags?: string[];
    views_count?: number;
    likes_count?: number;
    published?: boolean;
  }>;
};

export async function getArticles() {
  try {
    const response = await api.get<ArticlesListResponse>("/articles?published=true&limit=20");
    return shuffleArray(response.articles.map(mapArticle));
  } catch {
    return shuffleArray(mockArticles);
  }
}
