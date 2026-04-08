import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import type { TeamListing } from "../../types/team";

type TeamDetailPageProps = {
  team: TeamListing;
  activityScore?: number;
  repoUrl?: string;
  githubUsername?: string;
  achievementsCount?: number;
  contributions?: number;
  onBack: () => void;
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

export function TeamDetailPage({
  team,
  activityScore = 64,
  repoUrl,
  githubUsername,
  achievementsCount = 0,
  contributions = 0,
  onBack,
}: TeamDetailPageProps) {
  const healthTone = getHealthTone(activityScore);

  return (
    <section className="page-section">
      <button className="toolbar-pill" type="button" onClick={onBack}>
        <ArrowBackRoundedIcon fontSize="inherit" />
        Назад к командам
      </button>

      <article className="study-card team-tracker-panel">
        <div className="study-card__header">
          <div>
            <span className="study-card__label">Команда</span>
            <h3>{team.name}</h3>
            <p>{team.eventName}</p>
          </div>
          <div className={`health-pill health-pill--${healthTone}`}>
            <FavoriteRoundedIcon sx={{ fontSize: 16 }} />
            <strong>{activityScore}/100</strong>
            <span>health</span>
          </div>
        </div>

        <div className="study-hero__repo">
          <GitHubIcon fontSize="small" />
          <span>{repoUrl || "Репозиторий подключится после sync"}</span>
        </div>
      </article>

      <div className="study-grid">
        <article className="study-card study-card--metric">
          <div className="study-card__icon">
            <GitHubIcon fontSize="small" />
          </div>
          <strong>{contributions}</strong>
          <h3>GitHub-активность</h3>
          <p>Коммитов в рабочем цикле команды</p>
        </article>

        <article className="study-card study-card--metric">
          <div className="study-card__icon">
            <FlagRoundedIcon fontSize="small" />
          </div>
          <strong>{team.participantsCount}</strong>
          <h3>Состав команды</h3>
          <p>Участников уже внутри рабочего трека</p>
        </article>

        <article className="study-card study-card--metric">
          <div className="study-card__icon">
            <EmojiEventsRoundedIcon fontSize="small" />
          </div>
          <strong>{achievementsCount}</strong>
          <h3>Прогресс</h3>
          <p>Открытых достижений и выполненных шагов</p>
        </article>
      </div>

      <div className="study-grid">
        <article className="study-card">
          <div className="study-card__header">
            <div>
              <span className="study-card__label">Фокус</span>
              <h3>Текущий ритм команды</h3>
            </div>
            <div className="study-card__icon">
              <AutoGraphRoundedIcon fontSize="small" />
            </div>
          </div>
          <p className="study-card__lead">
            @{githubUsername || "team"} ведёт команду {team.name} и помогает держать рабочий темп для {team.eventName}.
          </p>
          <div className="study-progress">
            <div className="study-progress__bar">
              <span style={{ width: `${Math.min(100, Math.max(18, activityScore))}%` }} />
            </div>
            <small>Активность обновляется после синхронизации backend с GitHub API.</small>
          </div>
        </article>

        <article className="study-card">
          <div className="study-card__header">
            <div>
              <span className="study-card__label">Подбор</span>
              <h3>Что важно команде</h3>
            </div>
            <div className="study-card__icon">
              <AutoAwesomeRoundedIcon fontSize="small" />
            </div>
          </div>
          <div className="study-achievements">
            <div className="study-achievement">
              <strong>Нужные роли</strong>
              <p>{team.targetRoles.join(", ")}</p>
            </div>
            <div className="study-achievement">
              <strong>Ключевые навыки</strong>
              <p>{team.skillsSummary.join(", ")}</p>
            </div>
            <div className="study-achievement">
              <strong>Контекст</strong>
              <p>Команда участвует в {team.eventName} и уже готова переходить к рабочему спринту.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
