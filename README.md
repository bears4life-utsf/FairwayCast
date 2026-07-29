# FairwayCast

FairwayCast helps golfers decide whether conditions are suitable for a round by turning weather information into a clear “Should I Play?” recommendation.

Enter a golf course, date, and tee time to get a yes / maybe / no play decision, plus temperature, wind, rain, UV guidance, what to bring, and an hourly forecast for a typical six-hour round window.

## Current features

- Golf course lookup via OpenStreetMap Nominatim
- Weather forecast via Open-Meteo (temperature, wind, rain probability, UV)
- “Should I Play?” recommendation (YES / MAYBE / NO)
- Condition cards for temperature, wind, sun, rain, UV, and gear to bring
- Hourly forecast for the round window
- Raw API data view for debugging

## Local setup and run

This is a static single-page app: one `index.html` file with embedded CSS and JavaScript. No build step or package install is required.

Because the app calls external APIs from the browser, open it through a local web server rather than as a `file://` URL.

From this project directory:

```bash
# Python 3
python3 -m http.server 8000
```

Or:

```bash
# Node.js (if installed)
npx --yes serve -p 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## GitHub Pages

FairwayCast is compatible with GitHub Pages. It is static HTML with no build step, so Pages can serve `index.html` directly from the repository root (or the `main` / `docs` / `gh-pages` branch you choose in repository Settings → Pages).

After you create the GitHub repository and enable Pages, the app should be available at a project URL such as:

`https://bears4life.github.io/FairwayCast/`

No bundler or GitHub Actions build is required for the current project.

## Personal project note

This is currently a personal project. It is shared for portfolio and experimentation purposes and is not a commercial product.
