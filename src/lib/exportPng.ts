import type { Data } from "./dataService";
import { sortHabits } from "./dataService";
import { cellStatus } from "./status";
import { shortDate, todayKey } from "./dates";

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export async function exportPng(data: Data, days: string[], title: string, filename: string) {
  const habits = sortHabits(data.habits).filter((h) => !days.length || h.createdAt <= days[days.length - 1]!);
  const nameW = 220, cellW = Math.max(34, Math.ceil((1200 - nameW - 40) / days.length)), rowH = 40, pad = 20, headH = 70;
  const W = Math.max(1200, nameW + cellW * days.length + pad * 2);
  const H = headH + rowH * (habits.length + 1) + pad * 2;
  const c = document.createElement("canvas"); c.width = W * 2; c.height = H * 2;
  const x = c.getContext("2d")!; x.scale(2, 2);
  const colors = { bg: css("--background"), card: css("--card"), fg: css("--foreground"), muted: css("--muted-foreground"), done: css("--done"), fail: css("--fail"), inactive: css("--inactive"), border: css("--border") };
  const font = getComputedStyle(document.body).fontFamily;
  x.fillStyle = colors.bg; x.fillRect(0, 0, W, H);
  x.fillStyle = colors.fg; x.font = `bold 26px ${font}`; x.textBaseline = "middle";
  x.fillText(title, pad, pad + 22);
  const top = pad + headH;
  x.font = `600 13px ${font}`; x.textAlign = "center"; x.fillStyle = colors.muted;
  days.forEach((d, i) => x.fillText(shortDate(d), pad + nameW + i * cellW + cellW / 2, top + rowH / 2));
  const today = todayKey();
  habits.forEach((h, r) => {
    const y = top + rowH * (r + 1);
    x.textAlign = "left"; x.fillStyle = colors.fg; x.font = `16px ${font}`;
    x.fillText(h.name.length > 22 ? h.name.slice(0, 21) + "…" : h.name, pad, y + rowH / 2);
    days.forEach((d, i) => {
      const s = cellStatus(d, h.createdAt, today, data.entries[d]?.[h.id]);
      x.fillStyle = s === "done" ? colors.done : s === "fail" || s === "autofail" ? colors.fail : s === "inactive" ? colors.inactive : colors.card;
      x.fillRect(pad + nameW + i * cellW + 2, y + 2, cellW - 4, rowH - 4);
    });
  });
  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png"));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
