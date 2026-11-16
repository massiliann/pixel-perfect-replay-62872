import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useData } from "@/hooks/useData";
import { activeHabits, dataService, habitsOnDay, type Habit } from "@/lib/dataService";
import { addDays, longDate, todayKey } from "@/lib/dates";
import type { Status } from "@/lib/status";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { HabitDayList } from "@/components/HabitDayList";
import { Modal } from "@/components/Modal";

export const Route = createFileRoute("/ustawienia")({
  head: () => ({ meta: [{ title: "Ustawienia — Habit Tracker" }, { name: "description", content: "Zarządzaj nawykami i edytuj przeszłe dni." }, { property: "og:title", content: "Ustawienia — Habit Tracker" }, { property: "og:description", content: "Zarządzaj nawykami i edytuj przeszłe dni." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Settings,
});

function HabitRow({ h, first, last }: { h: Habit; first: boolean; last: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(h.name);
  const save = () => { if (name.trim()) dataService.renameHabit(h.id, name.trim()); else setName(h.name); setEditing(false); };
  const btn = "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30";
  return (
    <li className="flex items-center gap-1 border-b border-border py-2 last:border-0">
      {editing ? (
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === "Enter" && save()}
          className="min-w-0 flex-1 rounded-lg border border-input px-2 py-1.5 outline-none focus:ring-2 focus:ring-ring" />
      ) : (
        <button onClick={() => setEditing(true)} className="min-w-0 flex-1 truncate py-1.5 text-left">{h.name}</button>
      )}
      <button aria-label="W górę" disabled={first} onClick={() => dataService.moveHabit(h.id, -1)} className={btn}><ArrowUp className="h-5 w-5" /></button>
      <button aria-label="W dół" disabled={last} onClick={() => dataService.moveHabit(h.id, 1)} className={btn}><ArrowDown className="h-5 w-5" /></button>
      <button aria-label="Usuń" onClick={() => confirm("Czy na pewno? Dane historyczne zostaną zachowane.") && dataService.deleteHabit(h.id)} className={btn + " hover:text-destructive"}><Trash2 className="h-5 w-5" /></button>
    </li>
  );
}

function Settings() {
  const data = useData();
  const habits = activeHabits(data);
  const [addOpen, setAddOpen] = useState(false);
  const yesterday = addDays(todayKey(), -1);
  const [day, setDay] = useState(yesterday);
  const [editDay, setEditDay] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, Status | undefined>>({});
  const openEdit = () => { setDraft({ ...(data.entries[day] ?? {}) }); setEditDay(day); };
  const card = "rounded-2xl bg-card p-4 shadow-sm";
  return (
    <main className="animate-tab space-y-5 px-4 pt-6">
      <h1 className="text-2xl font-bold">Ustawienia</h1>
      <section className={card}>
        <h2 className="mb-2 font-semibold">Zarządzanie nawykami</h2>
        <ul>{habits.map((h, i) => <HabitRow key={h.id} h={h} first={i === 0} last={i === habits.length - 1} />)}</ul>
        <button onClick={() => setAddOpen(true)} className="mt-3 w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground">Dodaj nawyk</button>
      </section>
      <section className={card}>
        <h2 className="mb-3 font-semibold">Edycja przeszłych dni</h2>
        <input type="date" value={day} max={yesterday} onChange={(e) => e.target.value && setDay(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5" />
        <button onClick={openEdit} className="mt-3 w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground">Otwórz edycję</button>
      </section>
      <AddHabitDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <Modal full open={!!editDay} onClose={() => setEditDay(null)}>
        {editDay && (
          <div className="flex min-h-full flex-col bg-background px-4 pt-6 pb-safe">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Edycja dnia</p>
            <h2 className="mb-5 text-2xl font-bold">{longDate(editDay)}</h2>
            <div className="flex-1"><HabitDayList habits={habitsOnDay(data, editDay)} statuses={draft} onChange={(id, s) => setDraft((d) => ({ ...d, [id]: s }))} /></div>
            <button onClick={() => { dataService.setStatuses(editDay, draft); setEditDay(null); }}
              className="my-5 w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground">Zapisz i zamknij</button>
          </div>
        )}
      </Modal>
    </main>
  );
}
