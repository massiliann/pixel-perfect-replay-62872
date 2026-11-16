import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useData } from "@/hooks/useData";
import { activeHabits, dataService } from "@/lib/dataService";
import { longDate, todayKey } from "@/lib/dates";
import { HabitDayList } from "@/components/HabitDayList";
import { AddHabitDialog } from "@/components/AddHabitDialog";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dziś — Habit Tracker" }, { name: "description", content: "Zaznacz dzisiejsze nawyki jako wykonane lub nie." }, { property: "og:title", content: "Dziś — Habit Tracker" }, { property: "og:description", content: "Zaznacz dzisiejsze nawyki jako wykonane lub nie." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Today,
});

function Today() {
  const data = useData();
  const [open, setOpen] = useState(false);
  const day = todayKey();
  return (
    <main className="animate-tab px-4 pt-6">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Dziś</p>
      <h1 className="mb-5 text-2xl font-bold">{longDate(day)}</h1>
      <HabitDayList habits={activeHabits(data)} statuses={data.entries[day] ?? {}} onChange={(id, s) => dataService.setStatuses(day, { [id]: s })} />
      <button aria-label="Dodaj nawyk" onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-90 sm:right-[calc(50%-14rem)]">
        <Plus className="h-7 w-7" />
      </button>
      <AddHabitDialog open={open} onClose={() => setOpen(false)} />
    </main>
  );
}
