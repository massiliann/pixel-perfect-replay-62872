import { createFileRoute } from "@tanstack/react-router";
import { useData } from "@/hooks/useData";
import { activeHabits, dataService } from "@/lib/dataService";
import { longDate, todayKey } from "@/lib/dates";
import { HabitDayList } from "@/components/HabitDayList";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dziś — Habit Tracker" }, { name: "description", content: "Zaznacz dzisiejsze nawyki jako wykonane lub nie." }, { property: "og:title", content: "Dziś — Habit Tracker" }, { property: "og:description", content: "Zaznacz dzisiejsze nawyki jako wykonane lub nie." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Today,
});

function Today() {
  const data = useData();
  const day = todayKey();
  return (
    <main className="animate-tab page-compact">
      <p className="eyebrow mb-2">Dziś / {day.replaceAll("-", ".")}</p>
      <h1 className="page-title mb-8">{longDate(day)}</h1>
      <HabitDayList habits={activeHabits(data)} statuses={data.entries[day] ?? {}} onChange={(id, s) => dataService.setStatuses(day, { [id]: s })} />
    </main>
  );
}
