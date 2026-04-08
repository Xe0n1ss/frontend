import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useEffect, useMemo, useState } from "react";
import { getArticles } from "../../services/knowledge.service";

type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  readTime: string;
};

type KnowledgeBasePageProps = {
  onOpenArticle: (article: KnowledgeArticle) => void;
};

const categories = ["Все", "React", "API", "UI", "Team Build", "Deploy"];

export function KnowledgeBasePage({ onOpenArticle }: KnowledgeBasePageProps) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      setLoading(true);
      setError("");

      try {
        const response = await getArticles();

        if (!cancelled) {
          setArticles(response);
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить статьи базы знаний");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticles();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = activeCategory === "Все" || article.category === activeCategory;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery === "" ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.summary.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, articles, query]);

  return (
    <section className="page-section">
      <article className="knowledge-hero">
        <span>Knowledge Base</span>
        <h1>База знаний</h1>
        <p>Список статей и гайдов для хакатонов: фильтры, поиск и быстрый доступ к полезным материалам.</p>
      </article>

      <label className="search-field search-field--light">
        <SearchRoundedIcon fontSize="small" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по статьям и темам"
        />
      </label>

      <div className="chips-row">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`chip ${activeCategory === category ? "chip--active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <div className="state-card">Загружаем статьи...</div>}
      {error && <div className="state-card state-card--error">{error}</div>}
      {!loading && !error && visibleArticles.length === 0 && (
        <div className="state-card">Ничего не найдено по текущему фильтру или поисковому запросу</div>
      )}

      <div className="knowledge-list">
        {visibleArticles.map((article) => (
          <article key={article.id} className="knowledge-card">
            <div className="knowledge-card__icon">
              <AutoStoriesRoundedIcon fontSize="small" />
            </div>
            <div className="knowledge-card__content">
              <div className="knowledge-card__meta">
                <span>{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
            </div>
            <button className="knowledge-card__action" type="button" aria-label={`Открыть ${article.title}`} onClick={() => onOpenArticle(article)}>
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
