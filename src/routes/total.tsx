import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useData } from "@/hooks/useData";
import { sortHabits } from "@/lib/dataService";
import { rangeKeys, shortDate, todayKey } from "@/lib/dates";
import { cellStatus } from "@/lib/status";
import { ExportDialog } from "@/components/ExportDialog";

export const Route = createFileRoute("/total")({
  head: () => ({ meta: [{ title: "Total — Habit Tracker" }, { name: "description", content: "Historia wszystkich nawyków dzień po dniu." }, { property: "og:title", content: "Total — Habit Tracker" }, { property: "og:description", content: "Historia wszystkich nawyków dzień po dniu." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Total,
});

const cellCls = { done: "bg-done", fail: "bg-fail", autofail: "bg-fail", inactive: "bg-inactive", neutral: "bg-card border border-border" } as const;

function Total() {
  const data = useData();
  const today = todayKey();
  const habits = sortHabits(data.habits);
  const first = habits.reduce((m, h) => (h.createdAt < m ? h.createdAt : m), today);
  const days = rangeKeys(first, today);
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (ref.current) ref.current.scrollLeft = ref.current.scrollWidth; }, [days.length]);
  return (
    <main className="animate-tab px-4 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Total</h1>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">Eksport 📸</button>
      </div>
      <div className="flex overflow-hidden rounded-2xl bg-card shadow-sm">
        <div className="w-32 shrink-0 border-r border-border">
          <div className="h-10" />
          {habits.map((h) => (
            <div key={h.id} className={`flex h-11 items-center truncate px-3 text-sm font-medium ${h.deletedAt ? "text-muted-foreground line-through" : ""}`}>{h.name}</div>
          ))}
        </div>
        <div ref={ref} className="flex-1 overflow-x-auto">
          <div className="grid auto-cols-[20%] grid-flow-col" style={{ minWidth: "100%" }}>
            {days.map((d) => (
              <div key={d}>
                <div className={`flex h-10 items-center justify-center text-xs font-semibold ${d === today ? "text-primary" : "text-muted-foreground"}`}>{shortDate(d)}</div>
                {habits.map((h) => (
                  <div key={h.id} className="h-11 p-1"><div className={`h-full w-full rounded-md ${cellCls[cellStatus(d, h.createdAt, today, data.entries[d]?.[h.id])]}`} /></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {open && <ExportDialog open onClose={() => setOpen(false)} data={data} firstDay={first} />}
    </main>
  );
}
