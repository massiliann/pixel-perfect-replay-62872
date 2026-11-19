import { useRef, useState } from "react";
import { Download, Upload, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dataService } from "@/lib/dataService";

export function BackupControls() {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const restore = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      dataService.validateBackup(text);
      if (!confirm("Zastąpić dane na tym urządzeniu danymi z kopii?")) return;
      dataService.restoreBackup(text);
      setMessage("Przywrócono dane z kopii.");
    } catch { setMessage("Nie udało się odczytać kopii. Dotychczasowe dane pozostają bez zmian."); }
    finally { if (input.current) input.current.value = ""; }
  };
  return <section className="settings-section">
    <h2 className="section-heading"><HardDrive className="h-4 w-4 text-primary" />Dane i kopie zapasowe</h2>
    <p className="mb-4 text-sm text-muted-foreground">Zapis na tym urządzeniu</p>
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => { dataService.downloadBackup(); setMessage("Pobrano kopię danych."); }}><Download className="h-4 w-4" />Pobierz kopię</Button>
      <Button variant="outline" onClick={() => input.current?.click()}><Upload className="h-4 w-4" />Przywróć kopię</Button>
    </div>
    <input ref={input} type="file" accept=".json,application/json" aria-label="Plik kopii danych" className="hidden" onChange={(e) => void restore(e.target.files?.[0])} />
    {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
  </section>;
}