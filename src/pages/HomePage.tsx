import CalendarTodaySharpIcon from "@mui/icons-material/CalendarTodaySharp";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchSharpIcon from "@mui/icons-material/SearchSharp";
import TuneSharpIcon from "@mui/icons-material/TuneSharp";
import AttachMoneySharpIcon from "@mui/icons-material/AttachMoneySharp";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import NewspaperSharpIcon from "@mui/icons-material/NewspaperSharp";
import EmojiEventsSharpIcon from "@mui/icons-material/EmojiEventsSharp";
import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { getEvents } from "../../services/events.service";
import { getTeams } from "../../services/members.service";
import { getArticles } from "../../services/knowledge.service";
import type { Event } from "../../types/event";
import type { TeamListing } from "../../types/team";

type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  readTime: string;
};

const filterChips = ["Все", "Онлайн", "Москва", "Краснодар", "Frontend", "AI", "Ростов", "FinTech", "Web-design"];

type HomePageProps = {
  onOpenArticle: (article: KnowledgeArticle) => void;
  onOpenTeam: (
    team: TeamListing,
    meta: { activityScore?: number; repoUrl?: string; githubUsername?: string; achievementsCount?: number; contributions?: number }
  ) => void;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((item) => item[0])
    .join("");
}

function onCardKeyDown(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

function getEventStatus(event: Event) {
  const now = Date.now();
  const start = new Date(event.startAt).getTime();
  const end = new Date(event.endAt).getTime();

  if (end < now) {
    return { label: "Завершён", tone: "past" as const };
  }

  if (start <= now && end >= now) {
    return { label: "Идёт сейчас", tone: "live" as const };
  }

  return { label: "Скоро", tone: "upcoming" as const };
}

export function HomePage({ onOpenArticle, onOpenTeam }: HomePageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<TeamListing[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedChip, setSelectedChip] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      setLoading(true);
      setError("");

      try {
        const [eventsResponse, teamsResponse, articlesResponse] = await Promise.all([
          getEvents(),
          getTeams(),
          getArticles(),
        ]);

        if (!cancelled) {
          setEvents(eventsResponse);
          setTeams(teamsResponse);
          setArticles(articlesResponse);
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить главный экран");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHomeData();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesChip =
        selectedChip === "Все" ||
        event.tags.includes(selectedChip) ||
        event.city === selectedChip ||
        (selectedChip === "Онлайн" && event.format === "online");

      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        query === "" ||
        event.title.toLowerCase().includes(query) ||
        (event.subtitle || "").toLowerCase().includes(query) ||
        event.tags.join(" ").toLowerCase().includes(query);

      return matchesChip && matchesQuery;
    });
  }, [events, searchQuery, selectedChip]);

  const highlightedNews = useMemo(() => articles.slice(0, 2), [articles]);
  const preferredTeams = useMemo(() => teams.slice(0, 2), [teams]);
  const futureEvents = useMemo(
    () => visibleEvents.filter((event) => getEventStatus(event).tone !== "past"),
    [visibleEvents]
  );
  const featuredEvent = futureEvents[0];
  const sideEvents = futureEvents.slice(1, 5);

  return (
    <section className="page-section home-page">
      <div className="search-row">
        <label className="search-field">
          <SearchSharpIcon fontSize="small" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по названию или теме..."
          />
        </label>

        <button className="icon-button" type="button" aria-label="Фильтры">
          <TuneSharpIcon fontSize="small" />
        </button>
      </div>

      <div className="toolbar-row">
        <button className="toolbar-pill" type="button">
          <CalendarTodaySharpIcon fontSize="inherit" />
          Эта неделя
        </button>

        <button className="toolbar-link" type="button">
          По дате
        </button>
      </div>

      <div className="chips-row">
        {filterChips.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`chip ${selectedChip === chip ? "chip--active" : ""}`}
            onClick={() => setSelectedChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {loading && <div className="state-card">Загружаем историю участника, будущие хакатоны и новости...</div>}
      {error && <div className="state-card state-card--error">{error}</div>}
      {!loading && !error && visibleEvents.length === 0 && <div className="state-card">По выбранным фильтрам пока ничего не найдено</div>}

      {!loading && !error && featuredEvent && (
        <section className="home-section">
          <div className="home-section__header">
            <h2>Будущие хакатоны</h2>
            <span className="section-note">{futureEvents.length} впереди</span>
          </div>

          <div className="event-list">
          {[featuredEvent, ...sideEvents].map((event) => {
            const status = getEventStatus(event);

            return (
              <article
                key={event.id}
                className={`event-tile event-tile--${event.accentVariant ?? "neutral"} ${status.tone === "past" ? "event-tile--past" : ""}`}
                role="button"
                tabIndex={0}
                onKeyDown={(currentEvent) => onCardKeyDown(currentEvent, () => {})}
              >
                <div className="event-tile__content">
                  <div className="event-tile__head">
                    <div>
                      <span className={`event-tile__status event-tile__status--${status.tone}`}>{status.label}</span>
                      <h3 className="event-tile__title">{event.title}</h3>
                      <p className="event-tile__subtitle">{event.subtitle}</p>
                    </div>
                    <button className="event-tile__arrow" type="button" aria-label={`Открыть ${event.title}`}>
                      <ArrowForwardIosSharpIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>

                  <div className="event-tile__meta">
                    <span>
                      <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                      {event.locationLabel}
                    </span>
                    <span>
                      <CalendarTodaySharpIcon sx={{ fontSize: 16 }} />
                      {formatEventDate(event.startAt)}-{formatEventDate(event.endAt)}
                    </span>
                  </div>

                  <div className="event-tile__footer">
                    <span className="money-pill">
                      <AttachMoneySharpIcon sx={{ fontSize: 14 }} />
                      ${event.prizePoolUsd?.toLocaleString()}
                    </span>
                    <span className="participants-inline">
                      <div className="avatar-stack">
                        <span />
                        <span />
                        <span />
                      </div>
                      {event.participantsCount} участников
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </section>
      )}

      {!loading && !error && (
        <section className="home-columns">
          <article className="home-panel">
            <div className="home-section__header">
              <h2>Команды</h2>
            </div>

            <div className="compact-list">
              {preferredTeams.map((team) => (
                <div key={team.id} className="compact-list__item">
                  <div className="compact-list__avatar">{initials(team.name)}</div>
                  <div className="compact-list__content">
                    <strong>{team.name}</strong>
                    <span>{team.targetRoles.join(", ")}</span>
                  </div>
                  <button
                    className="compact-list__action"
                    type="button"
                    aria-label={`Открыть ${team.name}`}
                    onClick={() =>
                      onOpenTeam(team, {
                        achievementsCount: 3,
                        contributions: 12,
                        githubUsername: "team",
                        activityScore: 64,
                      })
                    }
                  >
                    <ArrowForwardIosSharpIcon sx={{ fontSize: 12 }} />
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="home-panel">
            <div className="home-section__header">
              <h2>Новости</h2>
            </div>

            <div className="compact-list">
              {highlightedNews.map((article) => (
                <div key={article.id} className="compact-list__item compact-list__item--news">
                  <div className="compact-list__avatar compact-list__avatar--news">
                    <NewspaperSharpIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div className="compact-list__content">
                    <strong>{article.title}</strong>
                    <span>{article.readTime}</span>
                  </div>
                  <button className="compact-list__action" type="button" aria-label={`Открыть ${article.title}`} onClick={() => onOpenArticle(article)}>
                    <ArrowForwardIosSharpIcon sx={{ fontSize: 12 }} />
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </section>
  );
}
