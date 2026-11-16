import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Modal } from "./Modal";
import { dataService } from "@/lib/dataService";
export function AddHabitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const close = () => { setName(""); onClose(); };
  const add = () => { if (!name.trim()) return; dataService.addHabit(name.trim()); close(); };
  return (
    <Modal open={open} onClose={close}>
      <h2 className="mb-4 text-lg font-semibold">Nowy nawyk</h2>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder="Nazwa nawyka" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={close} className="rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted">Anuluj</Button>
        <Button onClick={add} disabled={!name.trim()} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">Dodaj</Button>
      </div>
    </Modal>
  );
}
