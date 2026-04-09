import { useMemo, useState } from "react";
import { Header } from "../components/layout/Header";
import { BottomNav } from "../components/layout/BottomNav";
import { HomePage } from "./HomePage";
import { TeamBuildPage } from "./TeamBuildPage";
import { ProfilePage } from "./ProfilePage";
import { KnowledgeBasePage } from "./KnowledgeBasePage";
import { PlaceholderPage } from "./PlaceholderPage";
import { ArticleDetailPage } from "./ArticleDetailPage";
import { TeamDetailPage } from "./TeamDetailPage";

export const screenMap = {
  discover: "discover",
  search: "search",
  home: "home",
  profile: "profile",
  article: "article",
  teamDetail: "teamDetail",
  auth: "auth",
  onboarding: "onboarding",
  notifications: "notifications",
  profileEdit: "profileEdit",
};

const placeholderContent = {
  auth: {
    title: "Вход / регистрация",
    subtitle: "Быстрый старт без лишней сложности",
    description: "Экран авторизации для первого входа, создания аккаунта и перехода к заполнению профиля.",
    bullets: ["Вход по email", "Быстрая регистрация", "Переход в онбординг"],
  },
  onboarding: {
    title: "Онбординг",
    subtitle: "Заполнение анкеты участника",
    description: "Здесь будет многошаговая форма с навыками, ролью, опытом и интересами пользователя.",
    bullets: ["Роль и стек", "Навыки и опыт", "Интересы и формат участия", "Переход в Team Build"],
  },
  notifications: {
    title: "Настройки уведомлений",
    subtitle: "Подписки, напоминания и интересы",
    description: "Экран управления уведомлениями для хакатонов, дедлайнов и командных приглашений.",
    bullets: ["Темы уведомлений", "Telegram / email каналы", "Напоминания по событиям", "Интересующие категории"],
  },
  profileEdit: {
    title: "Редактирование профиля",
    subtitle: "Настройки публичного профиля участника",
    description: "Экран редактирования навыков, описания, ссылок на портфолио и GitHub.",
    bullets: ["Обновление bio", "Навыки и роль", "Портфолио и GitHub", "Публичность профиля"],
  },
};

function HackathonsPage({ platformTheme, initialScreen = screenMap.home, domains, onPrimaryNavigate }) {
  const [activeScreen, setActiveScreen] = useState(initialScreen);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamMeta, setSelectedTeamMeta] = useState(null);

  const screenContent = useMemo(() => {
    if (activeScreen === screenMap.discover) {
      return (
        <KnowledgeBasePage
          onOpenArticle={(article) => {
            setSelectedArticle(article);
            setActiveScreen(screenMap.article);
          }}
        />
      );
    }

    if (activeScreen === screenMap.home) {
      return (
        <HomePage
          onOpenArticle={(article) => {
            setSelectedArticle(article);
            setActiveScreen(screenMap.article);
          }}
          onOpenTeam={(team, meta) => {
            setSelectedTeam(team);
            setSelectedTeamMeta(meta);
            setActiveScreen(screenMap.teamDetail);
          }}
        />
      );
    }

    if (activeScreen === screenMap.search) {
      return (
        <TeamBuildPage
          onOpenTeam={(team, meta) => {
            setSelectedTeam(team);
            setSelectedTeamMeta(meta);
            setActiveScreen(screenMap.teamDetail);
          }}
        />
      );
    }

    if (activeScreen === screenMap.profile) {
      return <ProfilePage />;
    }

    if (activeScreen === screenMap.article && selectedArticle) {
      return <ArticleDetailPage article={selectedArticle} onBack={() => setActiveScreen(screenMap.discover)} />;
    }

    if (activeScreen === screenMap.teamDetail && selectedTeam) {
      return (
        <TeamDetailPage
          team={selectedTeam}
          activityScore={selectedTeamMeta?.activityScore}
          repoUrl={selectedTeamMeta?.repoUrl}
          githubUsername={selectedTeamMeta?.githubUsername}
          achievementsCount={selectedTeamMeta?.achievementsCount}
          contributions={selectedTeamMeta?.contributions}
          onBack={() => setActiveScreen(screenMap.search)}
        />
      );
    }

    const placeholder = placeholderContent[activeScreen];

    if (placeholder) {
      return <PlaceholderPage {...placeholder} />;
    }

    return <HomePage onOpenArticle={() => {}} onOpenTeam={() => {}} />;
  }, [activeScreen, selectedArticle, selectedTeam, selectedTeamMeta]);

  const headerContent = useMemo(() => {
    if (activeScreen === screenMap.discover) {
      return <Header title="База знаний" subtitle="Статьи, фильтры и быстрый поиск по темам" />;
    }

    if (activeScreen === screenMap.search || activeScreen === screenMap.teamDetail) {
      return null;
    }

    if (activeScreen === screenMap.profile) {
      return <Header title="Профиль пользователя" subtitle="GitHub-статистика и достижения по сезонам" showSearch={false} />;
    }

    if (activeScreen === screenMap.article && selectedArticle) {
      return <Header title="Новость" subtitle={selectedArticle.category} showSearch={false} />;
    }

    if (placeholderContent[activeScreen]) {
      return <Header title={placeholderContent[activeScreen].title} subtitle={placeholderContent[activeScreen].subtitle} />;
    }

    return null;
  }, [activeScreen, selectedArticle]);

  const bottomNavKey = ["discover", "search", "home", "profile"].includes(activeScreen) ? activeScreen : "home";

  return (
    <div className={`app-shell app-shell--${platformTheme}`}>
      {headerContent}
      <main className="app-screen">{screenContent}</main>
      <BottomNav
        activeTab={bottomNavKey}
        onChange={(tab) => {
          setActiveScreen(tab);
          onPrimaryNavigate?.(tab);
        }}
        domains={domains}
      />
    </div>
  );
}

export default HackathonsPage;
