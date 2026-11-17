// All habit reads/writes go through this service. Cache is memory-only.
import { todayKey } from "./dates";
import type { Status } from "./status";
import { parseBackup } from "./backup";

export interface Habit { id: string; name: string; createdAt: string; deletedAt?: string | undefined; order: number }
export interface Data { habits: Habit[]; entries: Record<string, Record<string, Status>> }
export interface DataStatus { loading: boolean; error: string | null; saving: boolean }
const EMPTY: Data = { habits: [], entries: {} };
const SERVER_STATUS: DataStatus = { loading: true, error: null, saving: false };
let cache: Data = EMPTY;
let confirmed: Data = EMPTY;
let status: DataStatus = SERVER_STATUS;
let initialized = false;
let loadingRequest: Promise<void> | null = null;
let generation = 0;
let pending = 0;
let queue = Promise.resolve();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
const setStatus = (next: DataStatus) => { status = next; notify(); };

function apiUrl() {
  // VITE_* values are PUBLIC. A shared private read/write key cannot be used here.
  if (import.meta.env['VITE_API_KEY']?.trim()) throw new Error("Klucz prywatny nie może być zapisany w aplikacji. Usługa zapisu wymaga bezpiecznego dostępu.");
  const value = import.meta.env['VITE_API_URL']?.trim();
  if (!value) throw new Error("Nie podłączono jeszcze usługi zapisu danych poza urządzeniem.");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Adres usługi zapisu musi zaczynać się od HTTPS.");
  return url.toString();
}
async function request(action?: string, payload: Record<string, unknown> = {}) {
  const response = await fetch(apiUrl(), {
    ...(action ? { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action, ...payload }) } : {}),
    credentials: "include",
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Usługa zapisu zwróciła błąd (${response.status}).`);
  const result: unknown = await response.json();
  if (result && typeof result === "object" && "error" in result && result.error) throw new Error("Usługa zapisu odrzuciła żądanie.");
  return result;
}
async function reload() {
  if (loadingRequest) return loadingRequest;
  if (pending) return;
  initialized = true;
  setStatus({ loading: true, error: null, saving: false });
  loadingRequest = (async () => {
    try {
      const result = parseBackup(JSON.stringify(await request()));
      cache = result; confirmed = result;
      setStatus({ loading: false, error: null, saving: false });
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error instanceof Error ? error.message : "Nie udało się pobrać danych." });
    } finally { loadingRequest = null; }
  })();
  return loadingRequest;
}
function commit(next: Data, action: string, payload: Record<string, unknown>) {
  if (status.loading || status.error) return;
  cache = next;
  pending++;
  const ownGeneration = generation;
  setStatus({ loading: false, error: null, saving: true });
  queue = queue.then(async () => {
    if (ownGeneration !== generation) return;
    try {
      await request(action, payload);
      confirmed = next;
      pending--;
      setStatus({ loading: false, error: null, saving: pending > 0 });
    } catch {
      generation++;
      pending = 0;
      cache = confirmed;
      setStatus({ loading: false, saving: false, error: "Nie potwierdzono zapisu. Ostatnią zmianę cofnięto; pobierz dane ponownie, aby sprawdzić stan w usłudze." });
    }
  });
}
const uid = () => crypto.randomUUID();
export const dataService = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (!initialized && typeof window !== "undefined") void reload();
    return () => { listeners.delete(listener); };
  },
  getSnapshot: () => cache,
  getServerSnapshot: () => EMPTY,
  getStatusSnapshot: () => status,
  getServerStatusSnapshot: () => SERVER_STATUS,
  reload,
  validateBackup: parseBackup,
  restoreBackup(text: string) { const data = parseBackup(text); commit(data, "saveAll", { data }); },
  downloadBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(cache, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `habit-tracker-kopia-${todayKey()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  addHabit(name: string) {
    const habit: Habit = { id: uid(), name, createdAt: todayKey(), order: Math.max(-1, ...cache.habits.map((h) => h.order)) + 1 };
    commit({ ...cache, habits: [...cache.habits, habit] }, "addHabit", { ...habit });
  },
  renameHabit(id: string, name: string) {
    commit({ ...cache, habits: cache.habits.map((h) => h.id === id ? { ...h, name } : h) }, "renameHabit", { id, name });
  },
  moveHabit(id: string, dir: -1 | 1) {
    const active = activeHabits(cache);
    const index = active.findIndex((h) => h.id === id);
    if (index < 0) return;
    const a = active[index], b = active[index + dir];
    if (!a || !b) return;
    const updates = [{ id: a.id, order: b.order }, { id: b.id, order: a.order }];
    commit({ ...cache, habits: cache.habits.map((h) => h.id === a.id ? { ...h, order: b.order } : h.id === b.id ? { ...h, order: a.order } : h) }, "moveHabit", { updates });
  },
  deleteHabit(id: string) {
    const deletedAt = todayKey();
    commit({ ...cache, habits: cache.habits.map((h) => h.id === id ? { ...h, deletedAt } : h) }, "deleteHabit", { id, deletedAt });
  },
  setStatuses(day: string, statuses: Record<string, Status | undefined>) {
    const values = { ...(cache.entries[day] ?? {}) };
    const changes: Record<string, Status | null> = {};
    for (const [id, value] of Object.entries(statuses)) {
      changes[id] = value ?? null; // Explicit deletion survives JSON serialization.
      if (value) values[id] = value; else delete values[id];
    }
    commit({ ...cache, entries: { ...cache.entries, [day]: values } }, "setStatuses", { day, statuses: changes });
  },
};
export const sortHabits = (habits: Habit[]) => [...habits].sort((a, b) => a.order - b.order);
export const activeHabits = (data: Data) => sortHabits(data.habits.filter((h) => !h.deletedAt));
export const habitsOnDay = (data: Data, day: string) => sortHabits(data.habits.filter((h) => h.createdAt <= day && (!h.deletedAt || h.deletedAt > day)));
