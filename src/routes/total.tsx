import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useData } from "@/hooks/useData";
import { sortHabits } from "@/lib/dataService";
import { rangeKeys, shortDate, todayKey } from "@/lib/dates";
import { cellStatus } from "@/lib/status";
import { ExportDialog } from "@/components/ExportDialog";
import { Check, X, Download, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/total")({
  head: () => ({ meta: [{ title: "Total — Habit Tracker" }, { name: "description", content: "Historia wszystkich nawyków dzień po dniu." }, { property: "og:title", content: "Total — Habit Tracker" }, { property: "og:description", content: "Historia wszystkich nawyków dzień po dniu." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Total,
});

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
    <main className="animate-tab total-page">
      <div className="mb-7 flex items-center justify-between gap-3">
        <div><p className="eyebrow mb-2">Historia / {habits.length} nawyków</p><h1 className="page-title">Total</h1></div>
        <Button variant="outline" onClick={() => setOpen(true)}><Download className="h-4 w-4" />Eksport PNG</Button>
      </div>
      <div className="history-table flex overflow-hidden">
        <div className="history-names">
          <div className="history-header flex items-center px-2 font-mono text-xs text-muted-foreground">NAWYK</div>
          {habits.map((h) => (
            <div key={h.id} title={h.name} className={`history-row flex items-center px-2 text-base leading-tight font-semibold ${h.deletedAt ? "text-muted-foreground line-through" : ""}`}><span className="line-clamp-2 break-words">{h.name}</span></div>
          ))}
        </div>
        <div ref={ref} className="history-scroll min-w-0 flex-1 overflow-x-auto">
          <div className="history-days">
            {days.map((d) => (
              <div key={d}>
                <div className={`history-header flex flex-col items-center justify-center font-mono text-xs ${d === today ? "text-primary" : "text-muted-foreground"}`}><span>{shortDate(d)}</span>{d === today && <span className="mt-1 text-[9px]">DZIŚ</span>}</div>
                {habits.map((h) => {
                  const status = cellStatus(d, h.createdAt, today, data.entries[d]?.[h.id]);
                  return <div key={h.id} className="history-row p-1.5"><div data-status={status} title={`${h.name} · ${d} · ${status}`} className="history-cell flex h-full w-full items-center justify-center rounded-sm">{status === "done" ? <Check className="h-4 w-4" /> : status === "fail" || status === "autofail" ? <X className="h-4 w-4" /> : status === "inactive" ? <Minus className="h-3 w-3 opacity-40" /> : null}</div></div>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {open && <ExportDialog open onClose={() => setOpen(false)} data={data} firstDay={first} />}
    </main>
  );
}
