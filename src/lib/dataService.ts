// Habit Tracker — dataService z Google Sheets jako backendem.
// Zastępuje wersję opartą na localStorage.
//
// Zmienne środowiskowe (Vite):
//   VITE_API_URL  — URL wdrożonej aplikacji Google Apps Script
//   VITE_API_KEY  — klucz API ustawiony w Code.gs

import { todayKey } from "./dates";
import type { Status } from "./status";
import { parseBackup } from "./backup";

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  deletedAt?: string;
  order: number;
}
export interface Data {
  habits: Habit[];
  entries: Record<string, Record<string, Status>>;
}

// ---- CONFIG ----
const API_URL = import.meta.env.VITE_API_URL as string;
const API_KEY = import.meta.env.VITE_API_KEY as string;

// ---- STATE ----
const EMPTY: Data = { habits: [], entries: {} };
let cache: Data = EMPTY;
let isLoading = true;
let loadError: string | null = null;
let statusSnap = { loading: true, error: null as string | null };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}
function setStatus(loading: boolean, error: string | null) {
  isLoading = loading;
  loadError = error;
  statusSnap = { loading, error };
}

// ---- API ----
async function apiGet(): Promise<Data> {
  const url = `${API_URL}?key=${encodeURIComponent(API_KEY)}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as Data;
}

async function apiPost(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ key: API_KEY, action, ...payload }),
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
  } catch (err) {
    console.error(`[HabitTracker] ${action} failed:`, err);
  }
}

// ---- INIT ----
async function init() {
  setStatus(true, null);
  notify();
  try {
    cache = await apiGet();
    setStatus(false, null);
  } catch (err) {
    setStatus(false, err instanceof Error ? err.message : "Błąd ładowania danych");
  }
  notify();
}

if (typeof window !== "undefined") {
  init();
}

// ---- HELPERS ----
const uid = () => Math.random().toString(36).slice(2, 10);

// ---- SERVICE ----
export const dataService = {
  // Stan ładowania (do odczytu przez useDataStatus)
  getStatusSnapshot: () => statusSnap,
  getServerStatusSnapshot: () => ({ loading: true, error: null as string | null }),

  reload: init,

  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot(): Data {
    return cache;
  },
  getServerSnapshot(): Data {
    return EMPTY;
  },

  // ---- MUTACJE (optymistyczne: cache natychmiast, API w tle) ----

  addHabit(name: string) {
    const id = uid();
    const today = todayKey();
    const max = Math.max(-1, ...cache.habits.map((h) => h.order));
    const habit: Habit = { id, name, createdAt: today, order: max + 1 };
    cache = { ...cache, habits: [...cache.habits, habit] };
    notify();
    apiPost("addHabit", { id, name, createdAt: today });
  },

  renameHabit(id: string, name: string) {
    cache = {
      ...cache,
      habits: cache.habits.map((h) => (h.id === id ? { ...h, name } : h)),
    };
    notify();
    apiPost("renameHabit", { id, name });
  },

  moveHabit(id: string, dir: -1 | 1) {
    const active = activeHabits(cache);
    const i = active.findIndex((h) => h.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= active.length) return;
    const a = active[i],
      b = active[j];
    if (!a || !b) return;
    const aOrder = b.order,
      bOrder = a.order;
    cache = {
      ...cache,
      habits: cache.habits.map((h) =>
        h.id === a.id
          ? { ...h, order: aOrder }
          : h.id === b.id
            ? { ...h, order: bOrder }
            : h,
      ),
    };
    notify();
    apiPost("moveHabit", {
      updates: [
        { id: a.id, order: aOrder },
        { id: b.id, order: bOrder },
      ],
    });
  },

  deleteHabit(id: string) {
    const deletedAt = todayKey();
    cache = {
      ...cache,
      habits: cache.habits.map((h) =>
        h.id === id ? { ...h, deletedAt } : h,
      ),
    };
    notify();
    apiPost("deleteHabit", { id, deletedAt });
  },

  setStatuses(day: string, statuses: Record<string, Status | undefined>) {
    const dayMap = { ...(cache.entries[day] ?? {}) };
    for (const [id, s] of Object.entries(statuses)) {
      if (s) dayMap[id] = s;
      else delete dayMap[id];
    }
    cache = { ...cache, entries: { ...cache.entries, [day]: dayMap } };
    notify();
    apiPost("setStatuses", { day, statuses });
  },

  validateBackup(text: string) {
    return parseBackup(text);
  },

  restoreBackup(text: string) {
    const data = parseBackup(text);
    cache = data;
    notify();
    apiPost("saveAll", { data });
  },

  downloadBackup() {
    const blob = new Blob([JSON.stringify(cache, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `habit-tracker-kopia-${todayKey()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

export const sortHabits = (hs: Habit[]) =>
  [...hs].sort((a, b) => a.order - b.order);
export const activeHabits = (d: Data) =>
  sortHabits(d.habits.filter((h) => !h.deletedAt));
/** Nawyki aktywne w danym dniu. */
export const habitsOnDay = (d: Data, day: string) =>
  sortHabits(
    d.habits.filter(
      (h) => h.createdAt <= day && (!h.deletedAt || h.deletedAt > day),
    ),
  );

