# Habit Tracker (PL, mobile-first)

Build exactly per the uploaded brief.

## Screens
- **Bottom nav** (fixed): Dziś / Total / Ustawienia, active tab in blue, ~200ms fade/slide on switch.
- **Dziś** (`/`): Polish long date header, scrollable habit cards with Done/Fail toggles (green/red row, re-click clears, other button swaps), pulse animation, blue FAB "+" above nav opening "Dodaj nawyk" modal.
- **Total** (`/total`): sticky left name column, horizontally scrollable DD.MM day columns (5 visible), range = oldest habit creation date to today, auto-scrolled to the right. Cell colors: Done green, Fail/auto-fail red, pre-creation #E9ECEF, today without status neutral. Deleted habits still shown. "Eksport 📸" modal: last 30 days or calendar month dropdown, "Generuj PNG" downloads image (min 1200px wide, title header, full table).
- **Ustawienia** (`/ustawienia`): habit management (inline rename, up/down, delete with confirm "Czy na pewno? Dane historyczne zostaną zachowane.", soft-delete), "Dodaj nawyk" button; past-day editing: date picker + "Otwórz edycję" opening a Dziś-like modal for habits active that day, "Zapisz i zamknij".

## Data
- `src/lib/dataService.ts`: the only module touching localStorage (getHabits, addHabit, renameHabit, reorder, deleteHabit, getStatus/setStatus, getEntries) so it can be swapped for an API later.
- Seed on first load (client-side, in effect): Medytacja, Ćwiczenia, Czytanie, Brak cukru, Woda 2L with random Done/Fail for the last 14 days.
- Pure helpers for cell status (done/fail/auto-fail/inactive/neutral) with unit tests.

## Design
- Background #F8F9FA, white cards, green #28A745, red #DC3545, blue #007BFF, muted #E9ECEF — as oklch tokens. System font, 16px base, safe-area padding for iPhone.

## Technical
- TanStack routes for the three tabs, shared layout in root with nav.
- PNG export drawn directly on a canvas (no html2canvas), downloaded via Blob.
- Per-route Polish head() metadata.
