export function LandingPage({ isAuthenticated, onOpenParticipant, onOpenOrganizer, onOpenAuth }) {
  return (
    <div className="landing-page">
      <div className="landing-page__inner">
        <span className="landing-page__eyebrow">YAHacks Platform</span>
        <h1>Одна платформа для участников и организаторов хакатонов</h1>
        <p>
          Сначала вход, затем работа по URL-маршрутам. Каждый раздел открывается прямой ссылкой и защищён сессией.
        </p>

        <div className="landing-page__actions">
          {!isAuthenticated && (
            <button type="button" className="cta-button cta-button--dark" onClick={onOpenAuth}>
              Войти в аккаунт
            </button>
          )}

          <button type="button" className="cta-button cta-button--purple" onClick={onOpenParticipant}>
            {isAuthenticated ? "Участник" : "Участник (после входа)"}
          </button>
          <button type="button" className="cta-button cta-button--lime" onClick={onOpenOrganizer}>
            {isAuthenticated ? "Организатор" : "Организатор (после входа)"}
          </button>
        </div>

        <div className="landing-page__routes">
          <strong>Маршруты:</strong>
          <code>/auth</code>
          <code>/participant/home</code>
          <code>/participant/teams</code>
          <code>/participant/knowledge</code>
          <code>/participant/profile</code>
          <code>/organizer</code>
        </div>
      </div>
    </div>
  );
}
