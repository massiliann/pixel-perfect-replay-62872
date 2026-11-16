// Jedyny moduł dotykający localStorage — do podmiany na zewnętrzne API.
import { addDays, todayKey } from "./dates";
import type { Status } from "./status";

export interface Habit { id: string; name: string; createdAt: string; deletedAt?: string; order: number }
export interface Data { habits: Habit[]; entries: Record<string, Record<string, Status>> } // entries[date][habitId]

const KEY = "habit-tracker-v1";
const EMPTY: Data = { habits: [], entries: {} };
let cache: Data = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const raw = localStorage.getItem(KEY);
  if (raw) { try { cache = JSON.parse(raw); return; } catch { /* reseed */ } }
  cache = seed();
  persist();
}
function persist() { localStorage.setItem(KEY, JSON.stringify(cache)); }
function commit(next: Data) { cache = next; persist(); listeners.forEach((l) => l()); }
const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): Data {
  const today = todayKey();
  const start = addDays(today, -13);
  const names = ["Medytacja", "Ćwiczenia", "Czytanie", "Brak cukru", "Woda 2L"];
  const habits = names.map((name, i) => ({ id: uid(), name, createdAt: start, order: i }));
  const entries: Data["entries"] = {};
  for (let i = 0; i < 14; i++) {
    const day = addDays(start, i);
    if (day === today) continue;
    entries[day] = {};
    habits.forEach((h) => { if (Math.random() > 0.1) entries[day]![h.id] = Math.random() > 0.3 ? "done" : "fail"; });
  }
  return { habits, entries };
}

export const dataService = {
  subscribe(l: () => void) { load(); listeners.add(l); return () => listeners.delete(l); },
  getSnapshot(): Data { load(); return cache; },
  getServerSnapshot(): Data { return EMPTY; },
  addHabit(name: string) {
    const max = Math.max(-1, ...cache.habits.map((h) => h.order));
    commit({ ...cache, habits: [...cache.habits, { id: uid(), name, createdAt: todayKey(), order: max + 1 }] });
  },
  renameHabit(id: string, name: string) {
    commit({ ...cache, habits: cache.habits.map((h) => (h.id === id ? { ...h, name } : h)) });
  },
  moveHabit(id: string, dir: -1 | 1) {
    const active = activeHabits(cache);
    const i = active.findIndex((h) => h.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= active.length) return;
    const a = active[i]!, b = active[j]!;
    commit({ ...cache, habits: cache.habits.map((h) => h.id === a.id ? { ...h, order: b.order } : h.id === b.id ? { ...h, order: a.order } : h) });
  },
  deleteHabit(id: string) {
    commit({ ...cache, habits: cache.habits.map((h) => (h.id === id ? { ...h, deletedAt: todayKey() } : h)) });
  },
  setStatuses(day: string, statuses: Record<string, Status | undefined>) {
    const dayMap = { ...(cache.entries[day] ?? {}) };
    for (const [id, s] of Object.entries(statuses)) { if (s) dayMap[id] = s; else delete dayMap[id]; }
    commit({ ...cache, entries: { ...cache.entries, [day]: dayMap } });
  },
};

export const sortHabits = (hs: Habit[]) => [...hs].sort((a, b) => a.order - b.order);
export const activeHabits = (d: Data) => sortHabits(d.habits.filter((h) => !h.deletedAt));
/** Nawyki aktywne w danym dniu. */
export const habitsOnDay = (d: Data, day: string) =>
  sortHabits(d.habits.filter((h) => h.createdAt <= day && (!h.deletedAt || h.deletedAt > day)));
