# Welcome to your Lovable project

## Personal PWA / GitHub Pages

Habit data stays in this browser on this device. Settings provides a validated JSON backup and restore; PNG export is a visual report, not a restorable backup. Clearing browser/site data removes local history. Moving to another domain (including from preview to GitHub Pages) requires downloading and restoring a JSON backup. There is no automatic cross-device sync.

Google Sheets is not used by the app. A private sheet would need an authenticated server or per-user Google OAuth; embedding workspace credentials in GitHub Pages would expose private data. The connected Google Sheets service is unused and no sheet contents were changed.

For deployment: connect this repository in GitHub, select Settings → Pages → Source: GitHub Actions, then run the **Deploy Habit Tracker to GitHub Pages** workflow. It builds/prerenders all three routes and publishes only `dist/client`. The workflow detects repository subpaths. No server environment secrets are required. Actual GitHub Pages deployment must be verified after running the workflow.

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
