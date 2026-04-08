import api from "./api";
import { mockEvents } from "../data/mockEvents";
import type { Event } from "../types/event";
import { mapEvent } from "./mappers";
import { shuffleArray } from "../utils/shuffleArray";

type EventsListResponse = {
  events: Array<{
    event_id: string;
    title: string;
    description?: string;
    type: "hackathon" | "workshop" | "meetup" | "webinar";
    date_start: string;
    date_end: string;
    location?: string;
    organizer?: string;
    registration_url?: string;
    tags?: string[];
    participants_count?: number;
  }>;
};

export async function getEvents() {
  try {
    const response = await api.get<EventsListResponse>("/events?upcoming=true&limit=20");
    return shuffleArray(response.events.map(mapEvent)) satisfies Event[];
  } catch {
    return shuffleArray(mockEvents);
  }
}
