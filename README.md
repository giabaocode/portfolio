# Portfolio — "The Workflow Engine"

Static portfolio for Pham Ngoc Gia Bao, built from scratch (no template) out of
`INFO_TEMPLATE.md` and the project folders in this workspace.

## Concept

Gia Bao's real differentiator across all 7 projects: he models messy business
processes as **state machines** and keeps them correct under concurrency
(optimistic/row locks, idempotency, anti-sniping, transactions). The site makes
that the hero idea — **every project is rendered as an interactive state machine**.
Tap a node to reveal what happens at that stage and the hard problem solved there.

## Run

Open `index.html` directly in a browser — no build step.

For a local server (so relative asset paths resolve cleanly):

```
python -m http.server 4321 --directory .
# → http://localhost:4321
```

## Files

- `index.html` — structure (projects are injected by `script.js`)
- `styles.css` — design tokens + node/transition visual language (dark + light)
- `script.js` — `PROJECTS` data (each project's state machine lives here), node
  interactions, theme toggle, filters, counters, scroll reveal
- `assets/` — `Resume.html`, `CV_Detail.html`, project images
- `_old_backup/` — the previous (generic) portfolio, kept as a fallback

## Editing content

All project content is the `PROJECTS` array at the top of `script.js`. Each entry:
`flow` is the list of states; a state with `challenge` + `fix` gets an amber dot
and shows the problem/solution when clicked.

## Hero animation — "the live engine"

The right side of the hero is a self-contained `<canvas>` animation: a request
packet flowing through a backend system (CLIENT → API → AUTH → SERVICE → LOCK →
DB → CACHE → QUEUE → EMAIL), with nodes lighting up as packets arrive. It ties
into the site's node/transition language and reinforces the "I build reliable
systems" theme.

- Pure vanilla JS in `script.js` (the `heroEngine()` block) — no libraries, no assets.
- Reads theme colors live from CSS variables (dark/light both correct).
- Pauses when off-screen / tab hidden; renders a single static frame under
  `prefers-reduced-motion`. Edit the `NODES` / `PATHS` objects to change the graph.

## Notes

- Education shows "Sep 2023 – Present" (matches the transcript), GPA 3.46/4.0.
- Project code links point to public GitHub; Coffee Shop links to the team repo.
- Deploy: upload the contents of this `portfolio/` folder to any static host
  (Vercel / Netlify / GitHub Pages).
