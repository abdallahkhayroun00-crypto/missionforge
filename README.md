# MissionForge

**Big discoveries. Careful decisions.**

An interactive educational space mission design game for the NASA Space Apps Challenge 2026, Space Mission Design Game challenge. Choose an Earth-observation objective, assemble a spacecraft, balance limited resources, and simulate the engineering consequences.

## Run locally

Requires Python 3 for a local server; no build or dependency installation:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Use a server rather than opening index.html directly, because the app uses JavaScript modules. Node.js 20+ is needed only for tests:

```sh
npm test
```

## Play

1. Choose coastal mapping, wildfire heat tracking, or a broad Earth survey.
2. Choose the instrument, solar array, battery, radio, launcher, and orbit.
3. Review live budget, mass, energy, and battery meters.
4. Select **Simulate mission** to receive six engineering checks and explanations.
5. Refine the design and try again. **Load a viable example** gives a working starting point for the selected objective.

The simulation is deterministic and educational, not flight engineering software. Costs, component specifications, contact durations and data units are illustrative. There are 288 possible mission configurations; the model includes orbit period, simplified eclipse duration, energy balance, storage, downlink and scientific compatibility.

## Project materials

- [Seven-slide presentation](docs/presentation.html): open with the local server, use arrow keys to navigate, or print to PDF (seven landscape pages).
- [Submission text](docs/SUBMISSION.md): English draft for the NASA Space Apps project form. Verify and replace the marked links before submission.
- [Sources, model equations, limitations and AI disclosure](docs/SOURCES.md).
- [30-second video storyboard](docs/VIDEO.md), if choosing video instead of the slides.

## Optional GitHub Pages hosting

In repository **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then Save. After the changes are on main and Pages has deployed, the expected address is https://abdallahkhayroun00-crypto.github.io/missionforge/ . This is an expected URL, not a claim that deployment is active. No workflow or credentials are needed for the static site.

## Implementation

Vanilla HTML, CSS and ES modules; no backend, API key, account system or package dependencies. Fonts use Google Fonts when available and fall back to local system fonts. The spacecraft illustration is inline SVG. The page supports keyboard selection, visible focus, responsive layouts and reduced-motion preferences.

## Attribution and AI assistance

AI tools assisted with implementation, documentation, tests, and presentation drafting. See the source document for details. Original educational concept selected by the project owner. This project is not affiliated with or endorsed by NASA. No NASA logo or mission insignia is included.
