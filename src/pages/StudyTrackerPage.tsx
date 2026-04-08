import GitHubIcon from "@mui/icons-material/GitHub";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import { useEffect, useMemo, useState } from "react";
import { getProfile } from "../../services/profile.service";
import { getTeams } from "../../services/members.service";

type ProfileData = {
  fullName: string;
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
  achievements: Array<{
    id: string;
    title: string;
    description: string;
  }>;
};

function getHealthTone(score: number) {
  if (score >= 75) {
    return "good";
  }

  if (score >= 45) {
    return "mid";
  }

  return "risk";
}

export function StudyTrackerPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTracker() {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, teamsResponse] = await Promise.all([getProfile(), getTeams()]);

        if (!cancelled) {
          setProfile(profileResponse);
          setTeamCount(teamsResponse.length);
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить Study Tracker");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTracker();
    return () => {
      cancelled = true;
    };
  }, []);

  const healthScore = profile?.githubDetails?.activityScore ?? 64;
  const healthTone = getHealthTone(healthScore);

  const sprintCards = useMemo(
    () => [
      {
        id: "github",
        title: "GitHub активность",
        value: profile?.githubStats.contributions ?? 0,
        caption: "коммитов в рабочем цикле",
        icon: <GitHubIcon fontSize="small" />,
      },
      {
        id: "teams",
        title: "Командный фокус",
        value: teamCount,
        caption: "команд следят за прогрессом",
        icon: <FlagRoundedIcon fontSize="small" />,
      },
      {
        id: "wins",
        title: "Достижения",
        value: profile?.achievements.length ?? 0,
        caption: "ачивок уже открыто",
        icon: <EmojiEventsRoundedIcon fontSize="small" />,
      },
    ],
    [profile, teamCount]
  );

  const checkpoints = [
    "Синхронизировать репозиторий команды",
    "Проверить дедлайны и обязательные deliverables",
    "Закрыть блокеры по ролям перед демо-днём",
  ];

  if (loading) {
    return (
      <section className="page-section">
        <div className="state-card">Собираем Study Tracker и командные метрики...</div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="page-section">
        <div className="state-card state-card--error">{error || "Study Tracker пока недоступен"}</div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <article className="study-hero">
        <span className="study-hero__eyebrow">Study Tracker</span>
        <h2>Держи команду в одном ритме от идеи до демо</h2>
        <p>
          Экран собирает health, GitHub-активность и ближайшие шаги, чтобы команда не теряла темп во
          время хакатона.
        </p>

        <div className="study-hero__footer">
          <div className={`health-pill health-pill--${healthTone}`}>
            <FavoriteRoundedIcon sx={{ fontSize: 16 }} />
            <strong>{healthScore}/100</strong>
            <span>health status</span>
          </div>

          <div className="study-hero__repo">
            <GitHubIcon fontSize="small" />
            <span>{profile.githubDetails?.repoUrl || "Репозиторий подключится после sync"}</span>
          </div>
        </div>
      </article>

      <div className="study-grid">
        {sprintCards.map((card) => (
          <article key={card.id} className="study-card study-card--metric">
            <div className="study-card__icon">{card.icon}</div>
            <strong>{card.value}</strong>
            <h3>{card.title}</h3>
            <p>{card.caption}</p>
          </article>
        ))}
      </div>

      <article className="study-card study-card--timeline">
        <div className="study-card__header">
          <div>
            <span className="study-card__label">Сегодня в фокусе</span>
            <h3>Что проверить перед следующим пушем</h3>
          </div>
          <button type="button" className="study-card__action" aria-label="Открыть все шаги">
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 12 }} />
          </button>
        </div>

        <div className="study-checkpoints">
          {checkpoints.map((item, index) => (
            <div key={item} className="study-checkpoint">
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="study-grid">
        <article className="study-card">
          <div className="study-card__header">
            <div>
              <span className="study-card__label">Прогресс</span>
              <h3>GitHub синхронизация</h3>
            </div>
            <div className="study-card__icon">
              <AutoGraphRoundedIcon fontSize="small" />
            </div>
          </div>
          <p className="study-card__lead">
            @{profile.githubUsername} ведёт команду по репозиторию и уже собрал {profile.githubStats.repos} активных
            рабочих потоков.
          </p>
          <div className="study-progress">
            <div className="study-progress__bar">
              <span style={{ width: `${Math.min(100, Math.max(18, healthScore))}%` }} />
            </div>
            <small>Активность команды обновляется после синхронизации backend с GitHub API.</small>
          </div>
        </article>

        <article className="study-card">
          <div className="study-card__header">
            <div>
              <span className="study-card__label">Геймификация</span>
              <h3>Последние ачивки</h3>
            </div>
            <div className="study-card__icon">
              <EmojiEventsRoundedIcon fontSize="small" />
            </div>
          </div>
          <div className="study-achievements">
            {profile.achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="study-achievement">
                <strong>{achievement.title}</strong>
                <p>{achievement.description}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
