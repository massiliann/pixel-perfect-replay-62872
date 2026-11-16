import { z } from "zod";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const habit = z.object({ id: z.string().min(1), name: z.string().trim().min(1), createdAt: day, deletedAt: day.optional(), order: z.number().finite() });
export const backupSchema = z.object({ habits: z.array(habit), entries: z.record(day, z.record(z.string(), z.enum(["done", "fail"]))) }).superRefine((data, ctx) => {
  const ids = new Set(data.habits.map((h) => h.id));
  if (ids.size !== data.habits.length) ctx.addIssue({ code: "custom", message: "Powtórzone identyfikatory nawyków" });
  for (const values of Object.values(data.entries)) for (const id of Object.keys(values)) if (!ids.has(id)) ctx.addIssue({ code: "custom", message: "Nieznany nawyk w historii" });
});

export function parseBackup(text: string) {
  return backupSchema.parse(JSON.parse(text));
}