import AdminPanelSettingsSharpIcon from "@mui/icons-material/AdminPanelSettingsSharp";
import AddSharpIcon from "@mui/icons-material/AddSharp";
import ChecklistSharpIcon from "@mui/icons-material/ChecklistSharp";
import WorkspacePremiumSharpIcon from "@mui/icons-material/WorkspacePremiumSharp";
import AutoAwesomeSharpIcon from "@mui/icons-material/AutoAwesomeSharp";
import QueryStatsSharpIcon from "@mui/icons-material/QueryStatsSharp";
import EmojiEventsSharpIcon from "@mui/icons-material/EmojiEventsSharp";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/layout/Header";
import {
  createProfileResult,
  createSeasonStat,
  getProfile,
  getSeasonOptions,
  type SeasonOption,
} from "../../services/profile.service";

type OrganizerWorkspacePageProps = {
  platformTheme: string;
};

type ProfileData = {
  fullName: string;
  seasonExperience: Array<{
    id: string;
    seasonId: string;
    season: string;
    xp: number;
    level: number;
    rank: number;
    eventsParticipated: number;
    winsCount: number;
    certificatesCount: number;
  }>;
  results: Array<{
    id: string;
    seasonId: string;
    season: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    resultType: string;
    resultTitle: string;
    placement: number;
    certificateUrl: string;
    notes: string;
  }>;
};

const customSeasonValue = "__custom__";

function buildSeasonFormState() {
  return {
    seasonId: "",
    seasonName: "",
    xp: "0",
    level: "1",
    rank: "0",
    eventsParticipated: "1",
    winsCount: "0",
    certificatesCount: "0",
  };
}

function buildResultFormState() {
  return {
    seasonId: "",
    seasonName: "",
    eventName: "",
    eventType: "hackathon",
    eventDate: "",
    resultType: "participation",
    resultTitle: "",
    placement: "0",
    certificateUrl: "",
    notes: "",
  };
}

function formatPlacement(placement: number) {
  if (!placement) {
    return "Без призового места";
  }

  return `${placement} место`;
}

export function OrganizerWorkspacePage({ platformTheme }: OrganizerWorkspacePageProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [seasonOptions, setSeasonOptions] = useState<SeasonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "seasonForm" | "resultForm">("dashboard");
  const [seasonForm, setSeasonForm] = useState(buildSeasonFormState);
  const [resultForm, setResultForm] = useState(buildResultFormState);
  const [savingSeason, setSavingSeason] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [seasonMessage, setSeasonMessage] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, seasonsResponse] = await Promise.all([getProfile(), getSeasonOptions()]);

        if (!cancelled) {
          setProfile(profileResponse);
          setSeasonOptions(seasonsResponse);
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить рабочее место организатора.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalXp = useMemo(
    () => profile?.seasonExperience.reduce((sum, season) => sum + season.xp, 0) ?? 0,
    [profile]
  );

  const totalCertificates = useMemo(
    () => profile?.seasonExperience.reduce((sum, season) => sum + season.certificatesCount, 0) ?? 0,
    [profile]
  );

  async function handleSeasonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setSavingSeason(true);
    setSeasonMessage("");

    try {
      const createdSeason = await createSeasonStat({
        seasonId: seasonForm.seasonId || undefined,
        seasonName: seasonForm.seasonName.trim(),
        xp: Number(seasonForm.xp) || 0,
        level: Math.max(1, Number(seasonForm.level) || 1),
        rank: Math.max(0, Number(seasonForm.rank) || 0),
        eventsParticipated: Math.max(0, Number(seasonForm.eventsParticipated) || 0),
        winsCount: Math.max(0, Number(seasonForm.winsCount) || 0),
        certificatesCount: Math.max(0, Number(seasonForm.certificatesCount) || 0),
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              seasonExperience: [createdSeason, ...current.seasonExperience],
            }
          : current
      );

      setSeasonOptions((current) => {
        if (current.some((option) => option.id === createdSeason.seasonId || option.name === createdSeason.season)) {
          return current;
        }

        return [{ id: createdSeason.seasonId, name: createdSeason.season }, ...current];
      });

      setSeasonForm(buildSeasonFormState());
      setSeasonMessage("Сезонная статистика участника сохранена.");
      setActiveTab("dashboard");
    } catch {
      setSeasonMessage("Не удалось сохранить сезонную статистику.");
    } finally {
      setSavingSeason(false);
    }
  }

  async function handleResultSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setSavingResult(true);
    setResultMessage("");

    try {
      const createdResult = await createProfileResult({
        seasonId: resultForm.seasonId || undefined,
        seasonName: resultForm.seasonName.trim(),
        eventName: resultForm.eventName.trim(),
        eventType: resultForm.eventType.trim(),
        eventDate: resultForm.eventDate,
        resultType: resultForm.resultType.trim(),
        resultTitle: resultForm.resultTitle.trim(),
        placement: Math.max(0, Number(resultForm.placement) || 0),
        certificateUrl: resultForm.certificateUrl.trim(),
        notes: resultForm.notes.trim(),
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              results: [createdResult, ...current.results],
            }
          : current
      );

      setSeasonOptions((current) => {
        if (current.some((option) => option.id === createdResult.seasonId || option.name === createdResult.season)) {
          return current;
        }

        return [{ id: createdResult.seasonId, name: createdResult.season }, ...current];
      });

      setResultForm(buildResultFormState());
      setResultMessage("Результат участника сохранён.");
      setActiveTab("dashboard");
    } catch {
      setResultMessage("Не удалось сохранить результат участника.");
    } finally {
      setSavingResult(false);
    }
  }

  return (
    <div className={`app-shell app-shell--${platformTheme}`}>
      <Header
        title="Версия для организаторов"
        subtitle="Отдельный контур для внесения сезонной статистики и результатов участников"
        showSearch={false}
      />
      <main className="app-screen">
        {loading && <div className="state-card">Загружаем рабочее место организатора...</div>}
        {error && <div className="state-card state-card--error">{error}</div>}

        {!loading && !error && profile && (
          <section className="page-section">
            <article className="organizer-hero-card organizer-hero-card--workspace">
              <div className="organizer-hero-card__icon">
                <AdminPanelSettingsSharpIcon fontSize="small" />
              </div>
              <div>
                <strong>Рабочее место организатора</strong>
                <p>
                  Здесь организатор ведёт профильную статистику участника отдельно от пользовательской версии:
                  заполняет сезоны, XP, ранги, результаты, сертификаты и участие в событиях.
                </p>
              </div>
            </article>

            <div className="organizer-dashboard-grid">
              <article className="organizer-stat-card">
                <ChecklistSharpIcon fontSize="small" />
                <strong>{profile.seasonExperience.length}</strong>
                <span>сезонов заведено</span>
              </article>
              <article className="organizer-stat-card">
                <WorkspacePremiumSharpIcon fontSize="small" />
                <strong>{profile.results.length}</strong>
                <span>результатов внесено</span>
              </article>
              <article className="organizer-stat-card">
                <AutoAwesomeSharpIcon fontSize="small" />
                <strong>{seasonOptions.length}</strong>
                <span>сезонов в справочнике</span>
              </article>
              <article className="organizer-stat-card">
                <QueryStatsSharpIcon fontSize="small" />
                <strong>{totalXp}</strong>
                <span>общий XP по сезонам</span>
              </article>
              <article className="organizer-stat-card">
                <EmojiEventsSharpIcon fontSize="small" />
                <strong>{totalCertificates}</strong>
                <span>сертификатов сохранено</span>
              </article>
            </div>

            <div className="segmented-control profile-tabs" role="tablist" aria-label="Организаторские вкладки">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "dashboard"}
                className={`segmented-control__item ${activeTab === "dashboard" ? "is-active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                Обзор
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "seasonForm"}
                className={`segmented-control__item ${activeTab === "seasonForm" ? "is-active" : ""}`}
                onClick={() => setActiveTab("seasonForm")}
              >
                Добавить сезонный опыт
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "resultForm"}
                className={`segmented-control__item ${activeTab === "resultForm" ? "is-active" : ""}`}
                onClick={() => setActiveTab("resultForm")}
              >
                Добавить результат
              </button>
            </div>

            {activeTab === "dashboard" && (
              <>
                {seasonMessage && <div className="state-card">{seasonMessage}</div>}
                {resultMessage && <div className="state-card">{resultMessage}</div>}

                <div className="organizer-dashboard-panels">
                  <article className="season-experience-card">
                    <div className="season-experience-card__header">
                      <div>
                        <strong>{profile.seasonExperience[0]?.season || "Сезон пока не добавлен"}</strong>
                        <p>
                          {profile.seasonExperience[0]
                            ? `Уровень ${profile.seasonExperience[0].level} · ранг ${
                                profile.seasonExperience[0].rank || "не задан"
                              }`
                            : "После первой записи здесь появится текущая сезонная статистика."}
                        </p>
                      </div>
                      <div className="season-experience-card__count">
                        <span>{profile.seasonExperience[0]?.xp || 0}</span>
                        <small>XP</small>
                      </div>
                    </div>
                    {profile.seasonExperience[0] ? (
                      <div className="season-badges season-badges--stats">
                        <span className="season-badge season-badge--metric">
                          {profile.seasonExperience[0].eventsParticipated} событий
                        </span>
                        <span className="season-badge season-badge--metric">
                          {profile.seasonExperience[0].winsCount} побед
                        </span>
                        <span className="season-badge season-badge--metric">
                          {profile.seasonExperience[0].certificatesCount} сертификатов
                        </span>
                      </div>
                    ) : null}
                  </article>

                  <article className="result-card result-card--organizer">
                    <div className="result-card__icon">
                      <WorkspacePremiumSharpIcon fontSize="small" />
                    </div>
                    <div className="result-card__content">
                      <div className="result-card__meta">
                        <span>{profile.results[0]?.resultType || "Результат"}</span>
                        <span>{profile.results[0]?.season || "Сезон не задан"}</span>
                      </div>
                      <h3>{profile.results[0]?.resultTitle || "Результаты пока не заведены"}</h3>
                      <strong>{profile.results[0]?.eventName || "Ожидает заполнения"}</strong>
                      <p>
                        {profile.results[0]
                          ? `${formatPlacement(profile.results[0].placement)} · ${
                              profile.results[0].notes || "Комментарий не указан."
                            }`
                          : "После добавления результата здесь появится последняя запись участника."}
                      </p>
                    </div>
                  </article>
                </div>
              </>
            )}

            {activeTab === "seasonForm" && (
              <form className="profile-entry-form" onSubmit={handleSeasonSubmit}>
                <div className="profile-entry-form__header">
                  <div className="profile-entry-form__icon">
                    <AddSharpIcon fontSize="small" />
                  </div>
                  <div>
                    <strong>Добавить сезонный опыт участника</strong>
                    <p>
                      Эта форма отправляет запись в <code>POST /api/v1/auth/me/season-stats</code> и использует
                      реальные поля сезонной статистики: XP, уровень, ранг, количество событий, побед и сертификатов.
                    </p>
                  </div>
                </div>

                <div className="organizer-grid">
                  <label className="organizer-field">
                    <span>Сезон</span>
                    <select
                      value={seasonForm.seasonId || ""}
                      onChange={(event) => {
                        if (event.target.value === customSeasonValue) {
                          setSeasonForm((current) => ({ ...current, seasonId: "", seasonName: "" }));
                          return;
                        }

                        const option = seasonOptions.find((item) => item.id === event.target.value);
                        setSeasonForm((current) => ({
                          ...current,
                          seasonId: event.target.value,
                          seasonName: option?.name || "",
                        }));
                      }}
                    >
                      <option value="">Выбрать сезон</option>
                      {seasonOptions.map((season) => (
                        <option key={season.id} value={season.id}>
                          {season.name}
                        </option>
                      ))}
                      <option value={customSeasonValue}>Создать новый сезон</option>
                    </select>
                  </label>

                  <label className="organizer-field">
                    <span>Новый сезон</span>
                    <input
                      value={seasonForm.seasonName}
                      onChange={(event) =>
                        setSeasonForm((current) => ({ ...current, seasonId: "", seasonName: event.target.value }))
                      }
                      placeholder="Например, Лето 2026"
                    />
                  </label>

                  <label className="organizer-field">
                    <span>XP</span>
                    <input
                      type="number"
                      min="0"
                      value={seasonForm.xp}
                      onChange={(event) => setSeasonForm((current) => ({ ...current, xp: event.target.value }))}
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Уровень</span>
                    <input
                      type="number"
                      min="1"
                      value={seasonForm.level}
                      onChange={(event) => setSeasonForm((current) => ({ ...current, level: event.target.value }))}
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Ранг</span>
                    <input
                      type="number"
                      min="0"
                      value={seasonForm.rank}
                      onChange={(event) => setSeasonForm((current) => ({ ...current, rank: event.target.value }))}
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Событий посещено</span>
                    <input
                      type="number"
                      min="0"
                      value={seasonForm.eventsParticipated}
                      onChange={(event) =>
                        setSeasonForm((current) => ({ ...current, eventsParticipated: event.target.value }))
                      }
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Побед</span>
                    <input
                      type="number"
                      min="0"
                      value={seasonForm.winsCount}
                      onChange={(event) => setSeasonForm((current) => ({ ...current, winsCount: event.target.value }))}
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Сертификатов</span>
                    <input
                      type="number"
                      min="0"
                      value={seasonForm.certificatesCount}
                      onChange={(event) =>
                        setSeasonForm((current) => ({ ...current, certificatesCount: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="profile-entry-form__actions">
                  <button className="cta-button cta-button--purple" type="submit" disabled={savingSeason}>
                    {savingSeason ? "Сохраняем..." : "Сохранить сезонный опыт"}
                  </button>
                </div>

                {seasonMessage && <div className="state-card">{seasonMessage}</div>}
              </form>
            )}

            {activeTab === "resultForm" && (
              <form className="profile-entry-form" onSubmit={handleResultSubmit}>
                <div className="profile-entry-form__header">
                  <div className="profile-entry-form__icon">
                    <AddSharpIcon fontSize="small" />
                  </div>
                  <div>
                    <strong>Добавить результат участника</strong>
                    <p>
                      Эта форма отправляет запись в <code>POST /api/v1/auth/me/results</code> и хранит событие, тип
                      результата, название достижения, место, ссылку на сертификат и заметки организатора.
                    </p>
                  </div>
                </div>

                <div className="organizer-grid">
                  <label className="organizer-field">
                    <span>Сезон</span>
                    <select
                      value={resultForm.seasonId || ""}
                      onChange={(event) => {
                        if (event.target.value === customSeasonValue) {
                          setResultForm((current) => ({ ...current, seasonId: "", seasonName: "" }));
                          return;
                        }

                        const option = seasonOptions.find((item) => item.id === event.target.value);
                        setResultForm((current) => ({
                          ...current,
                          seasonId: event.target.value,
                          seasonName: option?.name || "",
                        }));
                      }}
                    >
                      <option value="">Выбрать сезон</option>
                      {seasonOptions.map((season) => (
                        <option key={season.id} value={season.id}>
                          {season.name}
                        </option>
                      ))}
                      <option value={customSeasonValue}>Создать новый сезон</option>
                    </select>
                  </label>

                  <label className="organizer-field">
                    <span>Новый сезон</span>
                    <input
                      value={resultForm.seasonName}
                      onChange={(event) =>
                        setResultForm((current) => ({ ...current, seasonId: "", seasonName: event.target.value }))
                      }
                      placeholder="Например, Осень 2026"
                    />
                  </label>

                  <label className="organizer-field organizer-field--full">
                    <span>Название события</span>
                    <input
                      value={resultForm.eventName}
                      onChange={(event) => setResultForm((current) => ({ ...current, eventName: event.target.value }))}
                      placeholder="YaHacks Moscow 2026"
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Тип события</span>
                    <input
                      value={resultForm.eventType}
                      onChange={(event) => setResultForm((current) => ({ ...current, eventType: event.target.value }))}
                      placeholder="hackathon"
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Дата события</span>
                    <input
                      type="date"
                      value={resultForm.eventDate}
                      onChange={(event) => setResultForm((current) => ({ ...current, eventDate: event.target.value }))}
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Тип результата</span>
                    <input
                      value={resultForm.resultType}
                      onChange={(event) =>
                        setResultForm((current) => ({ ...current, resultType: event.target.value }))
                      }
                      placeholder="winner / finalist / participation"
                    />
                  </label>

                  <label className="organizer-field organizer-field--full">
                    <span>Название достижения</span>
                    <input
                      value={resultForm.resultTitle}
                      onChange={(event) =>
                        setResultForm((current) => ({ ...current, resultTitle: event.target.value }))
                      }
                      placeholder="Финалист, победитель, сертификат участия"
                    />
                  </label>

                  <label className="organizer-field">
                    <span>Место</span>
                    <input
                      type="number"
                      min="0"
                      value={resultForm.placement}
                      onChange={(event) =>
                        setResultForm((current) => ({ ...current, placement: event.target.value }))
                      }
                    />
                  </label>

                  <label className="organizer-field organizer-field--full">
                    <span>Ссылка на сертификат</span>
                    <input
                      value={resultForm.certificateUrl}
                      onChange={(event) =>
                        setResultForm((current) => ({ ...current, certificateUrl: event.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </label>

                  <label className="organizer-field organizer-field--full">
                    <span>Заметки</span>
                    <textarea
                      rows={3}
                      value={resultForm.notes}
                      onChange={(event) => setResultForm((current) => ({ ...current, notes: event.target.value }))}
                      placeholder="Краткое описание результата, роли в команде или ссылки на дипломы."
                    />
                  </label>
                </div>

                <div className="profile-entry-form__actions">
                  <button className="cta-button cta-button--purple" type="submit" disabled={savingResult}>
                    {savingResult ? "Сохраняем..." : "Сохранить результат"}
                  </button>
                </div>

                {resultMessage && <div className="state-card">{resultMessage}</div>}
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
