export type EventFormat = "online" | "offline" | "hybrid";

export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;

  city: string;
  country?: string;
  locationLabel: string; // "Moscow", "Online", "St.Piterburg"
  format: EventFormat;

  startAt: string; // ISO
  endAt: string;   // ISO

  prizePoolUsd?: number;
  participantsCount?: number;

  tags: string[]; // ["AI", "Frontend", "FinTech"]
  imageUrl?: string;
  accentVariant?: "purple" | "lime" | "orange" | "neutral";

  isFeatured?: boolean;
}