import { describe, it, expect } from "vitest";
import { parseBackup } from "./backup";

describe("portable device backup", () => {
  it("preserves habits, deleted history and saved statuses", () => {
    const data = { habits: [{ id: "water", name: "Woda 2L", createdAt: "2026-11-01", deletedAt: "2026-11-16", order: 0 }], entries: { "2026-11-15": { water: "done" } } };
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
  });
  it("rejects invalid statuses instead of overwriting device data", () => {
    expect(() => parseBackup(JSON.stringify({ habits: [], entries: { "2026-11-16": { water: "invalid" } } }))).toThrow();
  });
});