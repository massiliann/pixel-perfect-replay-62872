import { useState } from "react";
import type { Habit } from "@/lib/dataService";
import { toggleStatus, type Status } from "@/lib/status";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HabitDayList({ habits, statuses, onChange }: { habits: Habit[]; statuses: Record<string, Status | undefined>; onChange: (id: string, s: Status | undefined) => void }) {
  const [popped, setPopped] = useState<string | null>(null);
  if (!habits.length) return <p className="py-12 text-center text-muted-foreground">Brak nawyków</p>;
  return (
    <ul className="space-y-2.5">
      {habits.map((h, index) => {
        const s = statuses[h.id];
        const click = (c: Status) => { onChange(h.id, toggleStatus(s, c)); setPopped(h.id + Date.now()); };
        return (
          <li data-status={s ?? "neutral"} key={h.id + (popped?.startsWith(h.id) ? popped : "")} className={`habit-row bg-card ${popped?.startsWith(h.id) ? "animate-pop" : ""} flex items-center gap-3 rounded-md p-3 pl-4 transition-colors duration-200`}>
            <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 break-words text-lg font-semibold">{h.name}</span>
            {(["done", "fail"] as const).map((c) => (
              <Button variant="outline" size="icon" key={c} title={c === "done" ? "Wykonane" : "Niewykonane"} aria-label={c === "done" ? "Done" : "Fail"} aria-pressed={s === c} onClick={() => click(c)}
                className={`${c === "done" ? "text-done" : "text-fail"} ${s === c ? "border-current bg-muted" : ""}`}>
                {c === "done" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </Button>
            ))}
          </li>
        );
      })}
    </ul>
  );
}
