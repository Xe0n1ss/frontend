import AddBusinessRoundedIcon from "@mui/icons-material/AddBusinessRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import type { FormEvent } from "react";
import { useState } from "react";

type OrganizerPageProps = {
  onBack: () => void;
};

const initialForm = {
  title: "",
  description: "",
  city: "",
  format: "offline",
  startAt: "",
  endAt: "",
  prizePool: "",
  tags: "",
  registrationUrl: "",
};

export function OrganizerPage({ onBack }: OrganizerPageProps) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function updateField<Key extends keyof typeof initialForm>(key: Key, value: (typeof initialForm)[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setIsSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <section className="page-section">
      <button className="toolbar-pill" type="button" onClick={onBack}>
        <ArrowBackRoundedIcon fontSize="inherit" />
        Назад на главную
      </button>

      <article className="knowledge-hero knowledge-hero--secondary">
        <span>Organizer Desk</span>
        <h1>Добавление хакатона</h1>
        <p>Отдельный интерфейс для организаторов: заполните форму и передайте событие в публикацию без ручной сборки карточек.</p>
      </article>

      <form className="organizer-form" onSubmit={handleSubmit}>
        <div className="organizer-form__header">
          <div className="organizer-form__icon">
            <AddBusinessRoundedIcon fontSize="small" />
          </div>
          <div>
            <h2>Данные события</h2>
            <p>Название, описание, даты, формат и регистрационная ссылка.</p>
          </div>
        </div>

        <div className="organizer-grid">
          <label className="organizer-field organizer-field--full">
            <span>Название хакатона</span>
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Например, HackAI Moscow 2026" />
          </label>

          <label className="organizer-field organizer-field--full">
            <span>Краткое описание</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Какая тема, для кого событие и что получают участники"
              rows={4}
            />
          </label>

          <label className="organizer-field">
            <span>Город</span>
            <input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Москва" />
          </label>

          <label className="organizer-field">
            <span>Формат</span>
            <select value={form.format} onChange={(event) => updateField("format", event.target.value)}>
              <option value="offline">Офлайн</option>
              <option value="online">Онлайн</option>
              <option value="hybrid">Гибрид</option>
            </select>
          </label>

          <label className="organizer-field">
            <span>Дата старта</span>
            <div className="organizer-field__control">
              <CalendarTodayRoundedIcon fontSize="small" />
              <input type="date" value={form.startAt} onChange={(event) => updateField("startAt", event.target.value)} />
            </div>
          </label>

          <label className="organizer-field">
            <span>Дата окончания</span>
            <div className="organizer-field__control">
              <CalendarTodayRoundedIcon fontSize="small" />
              <input type="date" value={form.endAt} onChange={(event) => updateField("endAt", event.target.value)} />
            </div>
          </label>

          <label className="organizer-field">
            <span>Призовой фонд, USD</span>
            <input value={form.prizePool} onChange={(event) => updateField("prizePool", event.target.value)} placeholder="20000" />
          </label>

          <label className="organizer-field">
            <span>Теги</span>
            <input value={form.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="AI, FinTech, Frontend" />
          </label>

          <label className="organizer-field organizer-field--full">
            <span>Ссылка на регистрацию</span>
            <input
              value={form.registrationUrl}
              onChange={(event) => updateField("registrationUrl", event.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>

        <div className="organizer-actions">
          <button className="cta-button cta-button--dark" type="button" onClick={onBack}>
            Отменить
          </button>
          <button className="cta-button cta-button--purple" type="submit">
            <PublishRoundedIcon sx={{ fontSize: 18 }} />
            Опубликовать
          </button>
        </div>

        {isSubmitted && (
          <div className="state-card organizer-success">
            Хакатон подготовлен к публикации. Дальше backend может сохранить форму и отправить событие в общий список.
          </div>
        )}
      </form>
    </section>
  );
}
