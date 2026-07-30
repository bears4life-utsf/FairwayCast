# FairwayCast

FairwayCast helps golfers decide whether conditions are suitable for a round by turning weather into a clear **Should I Play?** recommendation.

Enter a golf course, date, and tee time to get a yes / maybe / no call, plus temperature, wind, rain, UV guidance, what to bring, and an hourly forecast for a six-hour round window.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- OpenStreetMap Nominatim (course lookup)
- Open-Meteo (hourly weather)

## Local setup

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173/FairwayCast/`).

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

The app deploys from GitHub Actions on pushes to `main`.

Live URL: [https://bears4life-utsf.github.io/FairwayCast/](https://bears4life-utsf.github.io/FairwayCast/)

In the repo **Settings → Pages**, set the source to **GitHub Actions** (one-time).

## Personal project note

This is a personal portfolio / experimentation project, not a commercial product.
