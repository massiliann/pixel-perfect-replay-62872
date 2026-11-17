import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initial = { habits: [{ id: "water", name: "Woda 2L", createdAt: "2026-11-01", order: 0 }], entries: { "2026-11-17": { water: "done" } } };
beforeEach(() => { vi.resetModules(); vi.stubEnv("VITE_API_URL", "https://example.test/habits"); vi.stubEnv("VITE_API_KEY", ""); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const response = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });

describe("remote habit storage", () => {
  it("loads API data without reading or writing localStorage", async () => {
    const read = vi.spyOn(Storage.prototype, "getItem"), write = vi.spyOn(Storage.prototype, "setItem");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(initial)));
    const { dataService } = await import("./dataService");
    await dataService.reload();
    expect(dataService.getSnapshot()).toEqual(initial);
    expect(read).not.toHaveBeenCalled(); expect(write).not.toHaveBeenCalled();
    read.mockRestore(); write.mockRestore();
  });
  it("sends explicit null when a status is cleared", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response(initial)).mockResolvedValue(response({ ok: true }));
    vi.stubGlobal("fetch", fetcher);
    const { dataService } = await import("./dataService"); await dataService.reload();
    dataService.setStatuses("2026-11-17", { water: undefined });
    expect(dataService.getSnapshot().entries["2026-11-17"]?.['water']).toBeUndefined();
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetcher.mock.calls[1]?.[1].body)).toEqual({ action: "setStatuses", day: "2026-11-17", statuses: { water: null } });
  });
  it("rolls back failed optimistic writes and reports an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response(initial)).mockRejectedValue(new Error("offline")));
    const { dataService } = await import("./dataService"); await dataService.reload();
    dataService.renameHabit("water", "Nowa nazwa");
    expect(dataService.getSnapshot().habits[0]?.name).toBe("Nowa nazwa");
    await vi.waitFor(() => expect(dataService.getStatusSnapshot().error).not.toBeNull());
    expect(dataService.getSnapshot().habits[0]?.name).toBe("Woda 2L");
  });
  it("rejects a shared browser key before sending any request", async () => {
    vi.stubEnv("VITE_API_KEY", "unsafe-shared-key");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const { dataService } = await import("./dataService"); await dataService.reload();
    expect(fetcher).not.toHaveBeenCalled();
    expect(dataService.getStatusSnapshot().error).toContain("Klucz prywatny");
  });
});