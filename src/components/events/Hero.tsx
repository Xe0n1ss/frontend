import "./Hero.css";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <span className="hero__badge">Hackathons & Team Build</span>
        <h1 className="hero__title">Найди хакатон и собери команду</h1>
        <p className="hero__subtitle">
          Ближайшие события, карточки участников и быстрый поиск по ролям и навыкам.
        </p>
      </div>
    </section>
  );
}