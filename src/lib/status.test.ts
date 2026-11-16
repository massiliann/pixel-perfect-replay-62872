import { describe, expect, it } from "vitest";
import { cellStatus, toggleStatus } from "./status";
describe("status", () => {
  it("pre-creation day is inactive", () => expect(cellStatus("2026-11-01", "2026-11-05", "2026-11-16")).toBe("inactive"));
  it("past day without status is auto-fail", () => expect(cellStatus("2026-11-10", "2026-11-05", "2026-11-16")).toBe("autofail"));
  it("today without status is neutral", () => expect(cellStatus("2026-11-16", "2026-11-05", "2026-11-16")).toBe("neutral"));
  it("done shows done", () => expect(cellStatus("2026-11-10", "2026-11-05", "2026-11-16", "done")).toBe("done"));
  it("re-click clears", () => expect(toggleStatus("done", "done")).toBeUndefined());
  it("other button swaps", () => expect(toggleStatus("done", "fail")).toBe("fail"));
});
