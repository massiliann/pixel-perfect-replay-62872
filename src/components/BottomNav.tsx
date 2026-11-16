import { Link } from "@tanstack/react-router";
import { CalendarCheck, Table2, Settings } from "lucide-react";
const tabs = [
  { to: "/", label: "Dziś", Icon: CalendarCheck },
  { to: "/total", label: "Total", Icon: Table2 },
  { to: "/ustawienia", label: "Ustawienia", Icon: Settings },
] as const;
export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-safe">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ to, label, Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: true }} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground transition-colors"
            activeProps={{ className: "text-primary font-semibold" }}>
            <Icon className="h-6 w-6" />{label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
