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

## 3D avatar

The hero shows an interactive 3D model (`<model-viewer>`, loaded from Google's CDN).
The model file is **self-hosted** at `assets/avatar.glb` so it works for every visitor
regardless of network/DNS — no dependency on an external model host.

Current model is a placeholder "build bot" (the `RobotExpressive` sample from the
model-viewer / three.js assets, CC0). To use a 3D avatar of yourself:

1. Create a free avatar at https://readyplayer.me (needs the site reachable — if your
   ISP DNS blocks it, switch DNS to `1.1.1.1` / `8.8.8.8` first).
2. Download its `.glb` and replace `assets/avatar.glb` (keep the same filename), **or**
   change `AVATAR_URL` near the top of `script.js` to point at your `.glb`.
3. `git add -A && git commit -m "my avatar" && git push`.

## Notes

- Education shows "Sep 2023 – Present" (matches the transcript), GPA 3.46/4.0.
- Project code links point to public GitHub; Coffee Shop links to the team repo.
- Deploy: upload the contents of this `portfolio/` folder to any static host
  (Vercel / Netlify / GitHub Pages).
