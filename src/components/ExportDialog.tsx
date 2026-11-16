import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import type { Data } from "@/lib/dataService";
import { MONTHS, addDays, pad, rangeKeys, shortDate, todayKey } from "@/lib/dates";
import { exportPng } from "@/lib/exportPng";

export function ExportDialog({ open, onClose, data, firstDay }: { open: boolean; onClose: () => void; data: Data; firstDay: string }) {
  const today = todayKey();
  const months = useMemo(() => {
    const out: string[] = [];
    let [y = 0, m = 1] = firstDay.split("-").map(Number);
    const [ty = 0, tm = 1] = today.split("-").map(Number);
    while (y < ty || (y === ty && m <= tm)) { out.push(`${y}-${pad(m)}`); m++; if (m > 12) { m = 1; y++; } }
    return out.reverse();
  }, [firstDay, today]);
  const [mode, setMode] = useState<"30" | "month">("30");
  const [month, setMonth] = useState(months[0] ?? today.slice(0, 7));
  const label = (ym: string) => `${MONTHS[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;
  const go = async () => {
    if (mode === "30") {
      const from = addDays(today, -29);
      await exportPng(data, rangeKeys(from, today), `Habit Tracker — Ostatnie 30 dni: ${shortDate(from)}–${shortDate(today)}.${today.slice(0, 4)}`, `habit-tracker-30-dni-${today}.png`);
    } else {
      const [y = 0, m = 1] = month.split("-").map(Number);
      const last = `${month}-${pad(new Date(y, m, 0).getDate())}`;
      await exportPng(data, rangeKeys(`${month}-01`, last), `Habit Tracker — ${label(month)}`, `habit-tracker-${month}.png`);
    }
    onClose();
  };
  const opt = (v: "30" | "month", text: string) => (
    <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${mode === v ? "border-primary bg-primary/5" : "border-border"}`}>
      <input type="radio" checked={mode === v} onChange={() => setMode(v)} className="accent-primary" />{text}
    </label>
  );
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold">Eksport do PNG</h2>
      <div className="space-y-2">
        {opt("30", "Ostatnie 30 dni")}
        {opt("month", "Miesiąc kalendarzowy")}
        {mode === "month" && (
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2.5">
            {months.map((m) => <option key={m} value={m}>{label(m)}</option>)}
          </select>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} className="rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted">Anuluj</Button>
        <Button onClick={go} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">Generuj PNG</Button>
      </div>
    </Modal>
  );
}
