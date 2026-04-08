import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import { useState } from "react";
import { login, register, type RegisterPayload } from "../../services/auth.service";

const tabs = ["Вход", "Регистрация"] as const;

const defaultRegisterState = {
  full_name: "",
  email: "",
  password: "",
  role: "frontend",
  skills: "React, TypeScript",
  timezone: "Europe/Moscow",
  bio: "",
  github_username: "",
};

type AuthPageProps = {
  onAuthSuccess: () => void;
  onNavigate: (screen: "home" | "profile" | "onboarding") => void;
};

export function AuthPage({ onAuthSuccess, onNavigate }: AuthPageProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Вход");
  const [loginState, setLoginState] = useState({ email: "", password: "" });
  const [registerState, setRegisterState] = useState(defaultRegisterState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(loginState);
      onAuthSuccess();
      onNavigate("profile");
    } catch {
      setError("Не удалось войти. Проверь email и пароль.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload: RegisterPayload = {
        ...registerState,
        skills: registerState.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await register(payload);
      onAuthSuccess();
      onNavigate("onboarding");
    } catch {
      setError("Не удалось зарегистрироваться. Проверь поля и попробуй ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-section">
      <article className="knowledge-hero">
        <span>Auth</span>
        <h1>Вход и быстрый старт</h1>
        <p>Минимальная авторизация для демо: вход, регистрация и переход к заполнению профиля без лишних шагов.</p>
      </article>

      <div className="segmented-control auth-tabs">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            className={`segmented-control__item ${tab === item ? "is-active" : ""}`}
            onClick={() => {
              setTab(item);
              setError("");
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {error && <div className="state-card state-card--error">{error}</div>}

      {tab === "Вход" ? (
        <form className="auth-card auth-form" onSubmit={handleLoginSubmit}>
          <div className="auth-card__header">
            <div className="study-card__icon">
              <LoginRoundedIcon fontSize="small" />
            </div>
            <div>
              <h2>Войти в профиль</h2>
              <p>Используй email и пароль участника.</p>
            </div>
          </div>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={loginState.email}
              onChange={(event) => setLoginState((current) => ({ ...current, email: event.target.value }))}
              placeholder="alex@example.com"
              required
            />
          </label>

          <label className="auth-field">
            <span>Пароль</span>
            <input
              type="password"
              value={loginState.password}
              onChange={(event) => setLoginState((current) => ({ ...current, password: event.target.value }))}
              placeholder="Минимум 8 символов"
              required
            />
          </label>

          <button className="cta-button cta-button--dark auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Входим..." : "Войти"}
          </button>
        </form>
      ) : (
        <form className="auth-card auth-form" onSubmit={handleRegisterSubmit}>
          <div className="auth-card__header">
            <div className="study-card__icon">
              <PersonAddAlt1RoundedIcon fontSize="small" />
            </div>
            <div>
              <h2>Создать участника</h2>
              <p>Сразу создаём реального пользователя в Postgres и затем логиним его.</p>
            </div>
          </div>

          <div className="auth-grid">
            <label className="auth-field">
              <span>Имя и фамилия</span>
              <input
                type="text"
                value={registerState.full_name}
                onChange={(event) => setRegisterState((current) => ({ ...current, full_name: event.target.value }))}
                placeholder="Анастасия Смирнова"
                required
              />
            </label>

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={registerState.email}
                onChange={(event) => setRegisterState((current) => ({ ...current, email: event.target.value }))}
                placeholder="nastya@example.com"
                required
              />
            </label>

            <label className="auth-field">
              <span>Пароль</span>
              <input
                type="password"
                value={registerState.password}
                onChange={(event) => setRegisterState((current) => ({ ...current, password: event.target.value }))}
                placeholder="Минимум 8 символов"
                required
              />
            </label>

            <label className="auth-field">
              <span>Роль</span>
              <select
                value={registerState.role}
                onChange={(event) => setRegisterState((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="design">Design</option>
                <option value="pm">PM</option>
                <option value="qa">QA</option>
                <option value="analyst">Analyst</option>
              </select>
            </label>

            <label className="auth-field">
              <span>Навыки</span>
              <input
                type="text"
                value={registerState.skills}
                onChange={(event) => setRegisterState((current) => ({ ...current, skills: event.target.value }))}
                placeholder="React, TypeScript, UI"
                required
              />
            </label>

            <label className="auth-field">
              <span>Часовой пояс</span>
              <input
                type="text"
                value={registerState.timezone}
                onChange={(event) => setRegisterState((current) => ({ ...current, timezone: event.target.value }))}
                placeholder="Europe/Moscow"
                required
              />
            </label>
          </div>

          <label className="auth-field">
            <span>GitHub username</span>
            <input
              type="text"
              value={registerState.github_username}
              onChange={(event) => setRegisterState((current) => ({ ...current, github_username: event.target.value }))}
              placeholder="nastya-ui"
            />
          </label>

          <label className="auth-field">
            <span>Bio</span>
            <textarea
              value={registerState.bio}
              onChange={(event) => setRegisterState((current) => ({ ...current, bio: event.target.value }))}
              placeholder="Frontend-разработчик, люблю хакатоны и product UI."
              rows={4}
            />
          </label>

          <button className="cta-button cta-button--purple auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Создаём..." : "Создать и войти"}
          </button>
        </form>
      )}
    </section>
  );
}
