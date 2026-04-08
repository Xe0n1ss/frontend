import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useEffect, useMemo, useState } from "react";
import { getMembers, getTeams } from "../../services/members.service";
import { getProfile } from "../../services/profile.service";
import type { TeamListing, TeamMember } from "../../types/team";

const modeTabs = ["Участники", "Команды"] as const;
const filters = ["Навыки", "Онлайн", "Локация", "AI news", "Рядом со мной", "UX/UI", "Сезонные мероприятия", "В команде"];

type TeamBuildPageProps = {
  onOpenTeam: (
    team: TeamListing,
    meta: { activityScore?: number; repoUrl?: string; githubUsername?: string; achievementsCount?: number; contributions?: number }
  ) => void;
};

type ProfileData = {
  githubUsername: string;
  githubStats: {
    contributions: number;
  };
  githubDetails?: {
    repoUrl?: string;
    activityScore?: number;
  };
  achievements: Array<{
    id: string;
  }>;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((item) => item[0])
    .join("");
}

function onCardKeyDown(event: React.KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}

export function TeamBuildPage({ onOpenTeam }: TeamBuildPageProps) {
  const [mode, setMode] = useState<(typeof modeTabs)[number]>("Команды");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<TeamListing[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>(["Онлайн"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [membersResponse, teamsResponse, profileResponse] = await Promise.all([getMembers(), getTeams(), getProfile()]);

        if (!cancelled) {
          setMembers(membersResponse);
          setTeams(teamsResponse);
          setProfile(profileResponse);
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить участников и команды");
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

  function toggleFilter(chip: string) {
    setActiveFilters((current) => (current.includes(chip) ? current.filter((item) => item !== chip) : [...current, chip]));
  }

  const visibleTeams = useMemo(() => {
    return teams.filter((team) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        query === "" ||
        team.name.toLowerCase().includes(query) ||
        team.skillsSummary.join(" ").toLowerCase().includes(query) ||
        team.eventName.toLowerCase().includes(query);

      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.some((filter) =>
          `${team.skillsSummary.join(" ")} ${team.eventName}`.toLowerCase().includes(filter.toLowerCase())
        );

      return matchesQuery && matchesFilters;
    });
  }, [activeFilters, searchQuery, teams]);

  const visibleMembers = useMemo(() => {
    return members.filter((member) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        query === "" ||
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.skills.join(" ").toLowerCase().includes(query);

      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.some((filter) =>
          `${member.role} ${member.skills.join(" ")} ${member.city || ""} ${member.bio || ""}`
            .toLowerCase()
            .includes(filter.toLowerCase())
        );

      return matchesQuery && matchesFilters;
    });
  }, [activeFilters, members, searchQuery]);

  return (
    <section className="page-section">
      <div className="search-row search-row--compact">
        <button className="icon-button" type="button" aria-label="Уведомления">
          <SearchRoundedIcon fontSize="small" />
        </button>

        <label className="search-field">
          <SearchRoundedIcon fontSize="small" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск (навык, команда)"
          />
        </label>

        <button className="icon-button" type="button" aria-label="Поиск">
          <SearchRoundedIcon fontSize="small" />
        </button>
      </div>

      <div className="segmented-control">
        {modeTabs.map((item) => (
          <button key={item} type="button" className={`segmented-control__item ${mode === item ? "is-active" : ""}`} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="toolbar-row">
        <button className="toolbar-pill" type="button">
          <CalendarTodayRoundedIcon fontSize="inherit" />
          Эта неделя
        </button>

        <button className="toolbar-link" type="button">
          По дате
        </button>
      </div>

      <div className="chips-row">
        {filters.map((chip) => (
          <button
            key={chip}
            type="button"
            className={`chip ${activeFilters.includes(chip) ? "chip--active" : ""} ${
              chip === "UX/UI" || chip === "AI news" ? "chip--purple" : ""
            }`}
            onClick={() => toggleFilter(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {loading && <div className="state-card">Собираем карточки для Team Build...</div>}
      {error && <div className="state-card state-card--error">{error}</div>}
      {!loading && !error && mode === "Команды" && visibleTeams.length === 0 && (
        <div className="state-card">По выбранным фильтрам и поиску пока ничего не найдено</div>
      )}
      {!loading && !error && mode === "Участники" && visibleMembers.length === 0 && (
        <div className="state-card">По выбранным фильтрам и поиску пока ничего не найдено</div>
      )}

      {!loading && !error && mode === "Команды" && (
        <div className="team-list">
          {visibleTeams.map((team) => (
            <article
              key={team.id}
              className="team-card"
              onClick={() =>
                onOpenTeam(team, {
                  activityScore: profile?.githubDetails?.activityScore ?? 64,
                  repoUrl: profile?.githubDetails?.repoUrl,
                  githubUsername: profile?.githubUsername,
                  achievementsCount: profile?.achievements.length ?? 0,
                  contributions: profile?.githubStats.contributions ?? 0,
                })
              }
              onKeyDown={(event) =>
                onCardKeyDown(event, () =>
                  onOpenTeam(team, {
                    activityScore: profile?.githubDetails?.activityScore ?? 64,
                    repoUrl: profile?.githubDetails?.repoUrl,
                    githubUsername: profile?.githubUsername,
                    achievementsCount: profile?.achievements.length ?? 0,
                    contributions: profile?.githubStats.contributions ?? 0,
                  })
                )
              }
              role="button"
              tabIndex={0}
            >
              <div className={`team-card__avatar team-card__avatar--${team.accent}`} />

              <div className="team-card__body">
                <div className="team-card__head">
                  <div>
                    <h3>{team.name}</h3>
                    <p>Ищут: {team.targetRoles.join(", ")}</p>
                  </div>

                  <button className="cta-button cta-button--dark" type="button">
                    Подать заявку
                  </button>
                </div>

                <div className="member-bubbles">
                  {team.membersPreview.map((member) => (
                    <span key={member} className="member-bubbles__item">
                      {member[0]}
                    </span>
                  ))}
                  <span className="member-bubbles__more">+{Math.max(0, team.participantsCount - team.membersPreview.length)}</span>
                </div>

                <p className="team-card__skills">Участвуют: {team.skillsSummary.join(", ")}</p>
                <div className="team-card__footer">
                  <span>Участвуют в {team.eventName}</span>
                  <button className="team-card__arrow" type="button" aria-label={`Открыть ${team.name}`}>
                    <ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && mode === "Участники" && (
        <div className="team-list">
          {visibleMembers.map((member) => (
            <article key={member.id} className="member-card">
              <div className="member-card__header">
                <div className="member-card__avatar">{initials(member.name)}</div>
                <div>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>

              <div className="member-card__skills">Skills: {member.skills.join(" - ")}</div>
              <p className="member-card__status">{member.bio}</p>

              <div className="member-card__actions">
                <button className="cta-button cta-button--lime" type="button">
                  Пригласить
                </button>
                <button className="cta-button cta-button--purple" type="button">
                  Написать
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="sticky-actions">
        <button className="cta-button cta-button--lime" type="button">
          Создать команду
        </button>
        <button className="cta-button cta-button--purple" type="button">
          Создать участника
        </button>
      </div>
    </section>
  );
}
