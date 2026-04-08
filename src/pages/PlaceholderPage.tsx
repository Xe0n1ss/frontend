type PlaceholderPageProps = {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
};

export function PlaceholderPage({ title, subtitle, description, bullets }: PlaceholderPageProps) {
  return (
    <section className="page-section">
      <article className="knowledge-hero">
        <span>Скоро</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </article>

      <article className="placeholder-panel">
        <p className="placeholder-panel__description">{description}</p>

        <div className="placeholder-panel__list">
          {bullets.map((item) => (
            <div key={item} className="placeholder-panel__item">
              {item}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
