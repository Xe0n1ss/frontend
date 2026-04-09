import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";
import AutoStoriesSharpIcon from "@mui/icons-material/AutoStoriesSharp";

type ArticleDetail = {
  id: string;
  title: string;
  category: string;
  summary: string;
  readTime: string;
};

type ArticleDetailPageProps = {
  article: ArticleDetail;
  onBack: () => void;
};

export function ArticleDetailPage({ article, onBack }: ArticleDetailPageProps) {
  return (
    <section className="page-section">
      <button className="toolbar-pill" type="button" onClick={onBack}>
        <ArrowBackSharpIcon fontSize="inherit" />
        Назад к новостям
      </button>

      <article className="knowledge-hero">
        <span>{article.category}</span>
        <h1>{article.title}</h1>
        <p>{article.readTime}</p>
      </article>

      <article className="detail-card">
        <div className="detail-card__header">
          <div className="detail-card__icon">
            <AutoStoriesSharpIcon fontSize="small" />
          </div>
          <div>
            <strong>Коротко о материале</strong>
            <p>{article.summary}</p>
          </div>
        </div>

        <div className="detail-copy">
          <p>
            Эта страница открывается из блока новостей и базы знаний, поэтому пользователь сразу попадает в конкретный материал, а не
            в общий список.
          </p>
          <p>
            Для демо здесь оставлен чистый и понятный формат чтения: заголовок, категория, время чтения и краткая выжимка по теме.
          </p>
        </div>
      </article>
    </section>
  );
}
