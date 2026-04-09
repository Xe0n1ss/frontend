import SaveSharpIcon from "@mui/icons-material/SaveSharp";
import { useEffect, useState } from "react";
import { getMe, updateMe, type AuthUser } from "../../services/auth.service";

type ProfileSetupPageProps = {
  mode: "onboarding" | "edit";
  onSaved: () => void;
  onNavigate: (screen: "profile") => void;
};

type FormState = {
  full_name: string;
  email: string;
  role: string;
  skills: string;
  timezone: string;
  bio: string;
  github_username: string;
  password: string;
};

function toFormState(user: AuthUser): FormState {
  return {
    full_name: user.fullName,
    email: user.email,
    role: user.role || "frontend",
    skills: user.skills.join(", "),
    timezone: user.timezone || "Europe/Moscow",
    bio: user.bio || "",
    github_username: user.githubUsername || "",
    password: "",
  };
}

export function ProfileSetupPage({ mode, onSaved, onNavigate }: ProfileSetupPageProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const user = await getMe();

        if (!cancelled) {
          setForm(toFormState(user));
        }
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить текущий профиль.");
        }
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await updateMe({
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        skills: form.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        timezone: form.timezone,
        bio: form.bio,
        github_username: form.github_username,
        password: form.password || undefined,
      });

      onSaved();
      onNavigate("profile");
    } catch {
      setError("Не удалось сохранить профиль. Проверь поля и попробуй ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!form) {
    return (
      <section className="page-section">
        <div className="state-card">{error || "Загружаем форму профиля..."}</div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <article className="knowledge-hero">
        <span>{mode === "onboarding" ? "Onboarding" : "Profile Edit"}</span>
        <h1>{mode === "onboarding" ? "Заверши профиль" : "Редактирование профиля"}</h1>
        <p>
          {mode === "onboarding"
            ? "Пользователь уже создан. Осталось быстро проверить и сохранить ключевые данные."
            : "Минимальная рабочая форма редактирования, чтобы завтрашний показ был без вопросов."}
        </p>
      </article>

      {error && <div className="state-card state-card--error">{error}</div>}

      <form className="auth-card auth-form" onSubmit={handleSubmit}>
        <div className="auth-card__header">
          <div className="study-card__icon">
            <SaveSharpIcon fontSize="small" />
          </div>
          <div>
            <h2>Данные участника</h2>
            <p>Изменения сохраняются в backend и остаются в Postgres.</p>
          </div>
        </div>

        <div className="auth-grid">
          <label className="auth-field">
            <span>Имя и фамилия</span>
            <input
              type="text"
              value={form.full_name}
              onChange={(event) => setForm((current) => (current ? { ...current, full_name: event.target.value } : current))}
              required
            />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => (current ? { ...current, email: event.target.value } : current))}
              required
            />
          </label>

          <label className="auth-field">
            <span>Роль</span>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => (current ? { ...current, role: event.target.value } : current))}
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
            <span>Часовой пояс</span>
            <input
              type="text"
              value={form.timezone}
              onChange={(event) => setForm((current) => (current ? { ...current, timezone: event.target.value } : current))}
            />
          </label>

          <label className="auth-field auth-field--full">
            <span>Навыки</span>
            <input
              type="text"
              value={form.skills}
              onChange={(event) => setForm((current) => (current ? { ...current, skills: event.target.value } : current))}
              placeholder="React, TypeScript, UI"
            />
          </label>
        </div>

        <label className="auth-field">
          <span>GitHub username</span>
          <input
            type="text"
            value={form.github_username}
            onChange={(event) => setForm((current) => (current ? { ...current, github_username: event.target.value } : current))}
          />
        </label>

        <label className="auth-field">
          <span>Bio</span>
          <textarea
            value={form.bio}
            onChange={(event) => setForm((current) => (current ? { ...current, bio: event.target.value } : current))}
            rows={4}
          />
        </label>

        <label className="auth-field">
          <span>Новый пароль</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => (current ? { ...current, password: event.target.value } : current))}
            placeholder="Оставь пустым, если менять не нужно"
          />
        </label>

        <button className="cta-button cta-button--dark auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Сохраняем..." : "Сохранить профиль"}
        </button>
      </form>
    </section>
  );
}
