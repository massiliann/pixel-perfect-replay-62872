export type Status = "done" | "fail";
export type Cell = "done" | "fail" | "autofail" | "inactive" | "neutral";

/** Kolor komórki w tabeli Total. */
export function cellStatus(day: string, createdAt: string, today: string, status?: Status): Cell {
  if (day < createdAt) return "inactive";
  if (status === "done") return "done";
  if (status === "fail") return "fail";
  if (day < today) return "autofail";
  return "neutral";
}

/** Kliknięcie Done/Fail: ponowne kliknięcie cofa, drugie przełącza. */
export function toggleStatus(current: Status | undefined, clicked: Status): Status | undefined {
  return current === clicked ? undefined : clicked;
}
