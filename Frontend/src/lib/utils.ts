import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  Laptop,
  Projector,
  Armchair,
  Volume2,
  Tablet,
  Library,
} from "lucide-react";

export function getIconByName(name: string): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    Projector,
    Laptop,
    Armchair,
    Volume2,
    BookMarked,
    Tablet,
    Library,
  };
  return icons[name] || Library;
}

export function dateLabel(date: string): string {
  return new Date(`${date}T12:00:00`)
    .toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/\./g, "");
}

export function timeLabel(date: string): string {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function today(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3.5 py-3 text-sm text-foreground transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-muted disabled:text-muted-foreground";

export const shifts = ["Mañana · 08:00–12:00", "Tarde · 13:00–17:00"] as const;

export const modules = {
  "Mañana · 08:00–12:00": [
    "Módulo 1 · 08:00–09:20",
    "Módulo 2 · 09:30–10:50",
    "Módulo 3 · 11:00–12:00",
  ],
  "Tarde · 13:00–17:00": [
    "Módulo 1 · 13:00–14:20",
    "Módulo 2 · 14:30–15:50",
    "Módulo 3 · 16:00–17:00",
  ],
} as const;
