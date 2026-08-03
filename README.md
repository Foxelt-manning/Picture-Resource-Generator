# Picture Resource Generator

A React + Vite PWA for searching visual inspiration, saving image collections locally, and quickly reusing previous searches.

## Features

- Visual search experience with Pinterest-style cards.
- Local caching for searches and saved collections.
- Saved collections page with grouped results.
- Collection retention settings and pruning.
- PWA support for install/offline-friendly behavior.
- Fallback image mode when the upstream image API is unavailable.
- Curated free image resource links (Unsplash, Pexels, Pixabay, Openverse).

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Tailwind CSS 4
- ESLint 9
- vite-plugin-pwa

## Getting Started

### 1) Install dependencies

```bash
npm ci
```

### 2) Start development server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## Linting

Run project lint checks with:

```bash
npm run lint
```

`dist` and generated `dev-dist` files are ignored by ESLint.

## Project Structure

- `/home/runner/work/Picture-Resource-Generator/Picture-Resource-Generator/src/Components` – UI components
- `/home/runner/work/Picture-Resource-Generator/Picture-Resource-Generator/src/Pages` – route pages
- `/home/runner/work/Picture-Resource-Generator/Picture-Resource-Generator/src/utils/cacheLogic.js` – localStorage caching and collection utilities
- `/home/runner/work/Picture-Resource-Generator/Picture-Resource-Generator/src/config` – site-level constants

## Notes

- The app stores recent searches and saved collections in browser localStorage.
- If the external image API fails or is empty, fallback images are shown so the UI remains functional.
