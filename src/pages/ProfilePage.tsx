import GitHubIcon from "@mui/icons-material/GitHub";
import EmojiEventsSharpIcon from "@mui/icons-material/EmojiEventsSharp";
import InsightsSharpIcon from "@mui/icons-material/InsightsSharp";
import AutoAwesomeSharpIcon from "@mui/icons-material/AutoAwesomeSharp";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import QueryStatsSharpIcon from "@mui/icons-material/QueryStatsSharp";
import UpdateSharpIcon from "@mui/icons-material/UpdateSharp";
import WorkspacePremiumSharpIcon from "@mui/icons-material/WorkspacePremiumSharp";
import MilitaryTechSharpIcon from "@mui/icons-material/MilitaryTechSharp";
import LocalActivitySharpIcon from "@mui/icons-material/LocalActivitySharp";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/profile.service";

type SeasonExperience = {
  id: string;
  seasonId: string;
  season: string;
  xp: number;
  level: number;
  rank: number;
  eventsParticipated: number;
  winsCount: number;
  certificatesCount: number;
};

type ProfileResult = {
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
};

type ProfileData = {
  fullName: string;
  role: string;
  location: string;
  githubUsername: string;
  githubStats: {
    repos: number;
    stars: number;
    contributions: number;
  };
  githubDetails?: {
    repoUrl?: string;
    activityScore?: number;
    lastCommitDate?: string;
  };
  streak: string;
  seasonExperience: SeasonExperience[];
  results: ProfileResult[];
};

function formatCommitDate(value?: string) {
  if (!value) {
    return "Нет данных";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

function formatResultDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatResultType(type: string) {
  const map: Record<string, string> = {
    participation: "Участие",
    certificate: "Сертификат",
    finalist: "Финал",
    winner: "Победа",
    award: "Награда",
  };

  return map[type.toLowerCase()] || type;
}

function formatEventType(type: string) {
  const map: Record<string, string> = {
    hackathon: "Хакатон",
    championship: "Чемпионат",
    workshop: "Воркшоп",
    meetup: "Митап",
  };

  return map[type.toLowerCase()] || type;
}

function formatRank(rank: number) {
  if (!rank) {
    return "Без ранга";
  }

  return `#${rank}`;
}

function formatPlacement(placement: number) {
  if (!placement) {
    return "Без места";
  }

  return `${placement} место`;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participantTab, setParticipantTab] = useState<"seasons" | "results">("seasons");

  useEffect(() => {
    let cancelled = false;

    async function loadProfileData() {
      setLoading(true);
      setError("");

      try {
        const profileResponse = await getProfile();

        if (!cancelled) {
          setProfile(profileResponse);
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить профиль участника.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfileData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="page-section page-section--profile">
        <div className="state-card">Загружаем профиль участника, опыт по сезонам и результаты...</div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="page-section page-section--profile">
        <div className="state-card state-card--error">{error || "Профиль пока недоступен."}</div>
      </section>
    );
  }

  return (
    <section className="page-section page-section--profile">
      <article className="profile-overview">
        <div className="profile-overview__top">
          <div className="profile-overview__avatar">YA</div>

          <div>
            <h1>{profile.fullName}</h1>
            <p>{profile.role}</p>
            <span>{profile.location}</span>
          </div>
        </div>

        <div className="profile-overview__github">
          <GitHubIcon fontSize="small" />
          <strong>@{profile.githubUsername}</strong>
          <span>{profile.streak}</span>
        </div>
      </article>

      <div className="profile-stats">
        <article className="profile-stat-card">
          <InsightsSharpIcon fontSize="small" />
          <strong>{profile.githubStats.repos}</strong>
          <span>репозиториев</span>
        </article>

        <article className="profile-stat-card">
          <AutoAwesomeSharpIcon fontSize="small" />
          <strong>{profile.githubStats.stars}</strong>
          <span>pull requests</span>
        </article>

        <article className="profile-stat-card">
          <EmojiEventsSharpIcon fontSize="small" />
          <strong>{profile.githubStats.contributions}</strong>
          <span>коммитов</span>
        </article>
      </div>

      <div className="profile-github-grid">
        <article className="profile-detail-card">
          <div className="profile-detail-card__icon">
            <LinkSharpIcon fontSize="small" />
          </div>
          <div>
            <strong>Репозиторий</strong>
            <p className="profile-detail-card__mono">{profile.githubDetails?.repoUrl || "Не подключён"}</p>
          </div>
        </article>

        <article className="profile-detail-card">
          <div className="profile-detail-card__icon">
            <QueryStatsSharpIcon fontSize="small" />
          </div>
          <div>
            <strong>Индекс активности</strong>
            <p>{profile.githubDetails?.activityScore ?? "Нет данных"}</p>
          </div>
        </article>

        <article className="profile-detail-card">
          <div className="profile-detail-card__icon">
            <UpdateSharpIcon fontSize="small" />
          </div>
          <div>
            <strong>Последний коммит</strong>
            <p>{formatCommitDate(profile.githubDetails?.lastCommitDate)}</p>
          </div>
        </article>
      </div>

      <article className="achievement-panel">
        <div className="achievement-panel__header">
          <h2>Профиль участника</h2>
          <span>{participantTab === "seasons" ? profile.seasonExperience.length : profile.results.length}</span>
        </div>

        <div className="segmented-control profile-tabs" role="tablist" aria-label="Данные участника">
          <button
            type="button"
            role="tab"
            aria-selected={participantTab === "seasons"}
            className={`segmented-control__item ${participantTab === "seasons" ? "is-active" : ""}`}
            onClick={() => setParticipantTab("seasons")}
          >
            Опыт по сезонам
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={participantTab === "results"}
            className={`segmented-control__item ${participantTab === "results" ? "is-active" : ""}`}
            onClick={() => setParticipantTab("results")}
          >
            Результаты
          </button>
        </div>

        {participantTab === "seasons" ? (
          <div className="season-experience-list">
            {profile.seasonExperience.map((season) => (
              <article key={season.id} className="season-experience-card">
                <div className="season-experience-card__header">
                  <div>
                    <strong>{season.season}</strong>
                    <p>
                      Уровень {season.level} · {formatRank(season.rank)}
                    </p>
                  </div>
                  <div className="season-experience-card__count">
                    <span>{season.xp}</span>
                    <small>XP</small>
                  </div>
                </div>

                <div className="season-badges season-badges--stats">
                  <span className="season-badge season-badge--metric">
                    <LocalActivitySharpIcon sx={{ fontSize: 16 }} />
                    {season.eventsParticipated} событий
                  </span>
                  <span className="season-badge season-badge--metric">
                    <EmojiEventsSharpIcon sx={{ fontSize: 16 }} />
                    {season.winsCount} побед
                  </span>
                  <span className="season-badge season-badge--metric">
                    <MilitaryTechSharpIcon sx={{ fontSize: 16 }} />
                    {season.certificatesCount} сертификатов
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="result-list">
            {profile.results.map((result) => (
              <article key={result.id} className="result-card">
                <div className="result-card__icon">
                  <WorkspacePremiumSharpIcon fontSize="small" />
                </div>
                <div className="result-card__content">
                  <div className="result-card__meta">
                    <span>{formatResultType(result.resultType)}</span>
                    <span>{result.season}</span>
                    <span>{formatResultDate(result.eventDate)}</span>
                  </div>
                  <h3>{result.resultTitle}</h3>
                  <strong>{result.eventName}</strong>
                  <div className="result-card__meta result-card__meta--secondary">
                    <span>{formatEventType(result.eventType)}</span>
                    <span>{formatPlacement(result.placement)}</span>
                    {result.certificateUrl ? <span>Сертификат доступен</span> : null}
                  </div>
                  <p>{result.notes}</p>
                  {result.certificateUrl ? (
                    <a
                      className="result-card__link"
                      href={result.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть сертификат
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
