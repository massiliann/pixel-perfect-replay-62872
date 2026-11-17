<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->
- All habit reads/writes go through src/lib/dataService.ts with a memory-only cache and external API calls, so device storage is never the source of habit history.
- Serialize optimistic writes, roll back to the last confirmed snapshot on failure and send null for status deletion, so failed requests never silently masquerade as saved history.
- Do not bundle shared read/write keys into VITE_* config; the external service must protect access independently because GitHub Pages client code is public.
- Validate portable JSON backups with the shared schema before replacing device data, so invalid imports cannot destroy saved history.
- Keep the shared shell full-width and constrain only Today/Settings locally, so history uses the available viewport.
- Prerender all content routes and deploy only dist/client to GitHub Pages; set GITHUB_PAGES_BASE for repository subpaths so no server secrets or runtime are needed.
- Use manifest-only PWA support until offline behavior is explicitly requested, so previews cannot acquire stale service-worker caches.
