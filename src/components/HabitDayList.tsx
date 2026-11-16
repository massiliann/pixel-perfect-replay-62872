import { useState } from "react";
import type { Habit } from "@/lib/dataService";
import { toggleStatus, type Status } from "@/lib/status";

export function HabitDayList({ habits, statuses, onChange }: { habits: Habit[]; statuses: Record<string, Status | undefined>; onChange: (id: string, s: Status | undefined) => void }) {
  const [popped, setPopped] = useState<string | null>(null);
  if (!habits.length) return <p className="py-12 text-center text-muted-foreground">Brak nawyków. Dodaj pierwszy przyciskiem +</p>;
  return (
    <ul className="space-y-2.5">
      {habits.map((h) => {
        const s = statuses[h.id];
        const click = (c: Status) => { onChange(h.id, toggleStatus(s, c)); setPopped(h.id + Date.now()); };
        const row = s === "done" ? "bg-done text-primary-foreground" : s === "fail" ? "bg-fail text-primary-foreground" : "bg-card";
        return (
          <li key={h.id + (popped?.startsWith(h.id) ? popped : "")} className={`${row} ${popped?.startsWith(h.id) ? "animate-pop" : ""} flex items-center gap-3 rounded-2xl p-3 pl-4 shadow-sm transition-colors duration-200`}>
            <span className="flex-1 font-medium">{h.name}</span>
            {(["done", "fail"] as const).map((c) => (
              <button key={c} aria-label={c === "done" ? "Done" : "Fail"} aria-pressed={s === c} onClick={() => click(c)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-transform active:scale-90 ${s === c ? "bg-card/30 ring-2 ring-card" : s ? "bg-card/15" : "bg-muted"}`}>
                {c === "done" ? "✅" : "❌"}
              </button>
            ))}
          </li>
        );
      })}
    </ul>
  );
}
