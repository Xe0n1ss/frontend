import type { Event } from "../../types/event";
import "./EventCard.css";

type Props = {
  event: Event;
};

export function EventCard({ event }: Props) {
  return (
    <article className={`event-card event-card--${event.accentVariant ?? "neutral"}`}>
      <div className="event-card__body">
        <h3 className="event-card__title">{event.title}</h3>

        <div className="event-card__meta">
          <span>{event.locationLabel}</span>
          <span>
            {new Date(event.startAt).toLocaleDateString("ru-RU")} —{" "}
            {new Date(event.endAt).toLocaleDateString("ru-RU")}
          </span>
        </div>

        <div className="event-card__footer">
          {event.prizePoolUsd && <span>${event.prizePoolUsd.toLocaleString()}</span>}
          {event.participantsCount && <span>{event.participantsCount} участников</span>}
        </div>
      </div>
    </article>
  );
}