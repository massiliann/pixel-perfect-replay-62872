# Welcome to your Lovable project

## Personal PWA / GitHub Pages

Habit data is read from and written to an external API. Browser cache is memory-only: no localStorage fallback or demo seeding. Until the API is configured, an unavailable-data screen is shown. Existing local history is not uploaded or deleted automatically. JSON backup restore writes to the external service.

The supplied archive contains frontend files only, not the deployed Google Apps Script or secure authorization. Google Sheets is not yet verified as the active store. Configure an HTTPS VITE_API_URL serving validated `{ habits, entries }` on GET and JSON acknowledgements for POST actions addHabit, renameHabit, moveHabit, deleteHabit, setStatuses and saveAll. Status deletion is sent as null. The service must handle authorization, credentialed CORS for the Pages origin, durable writes and cross-device concurrency.

Leave VITE_API_KEY empty: VITE values are public even when supplied through GitHub Secrets. The app rejects a populated shared key. Private data needs session-protected service access or per-user authorization, not a key shipped in the app. The platform controls .gitignore; add .env and .env.* exclusions with an exception for .env.example in your GitHub repository before creating any environment file. Do not store credentials in committed files.

For deployment: select Settings → Pages → Source: GitHub Actions and set the public API address in GitHub Secret VITE_API_URL. Deployment runs on pushes to main or manually. Only dist/client is published. Never inject a private VITE_API_KEY. GitHub Pages deployment and real remote save/read remain unverified until the external service is available.

The manifest and app icons support home-screen installation. No service worker or offline app-shell caching is included.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
