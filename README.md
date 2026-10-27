# Sidereal (work in progress)
Educational esoteric/astronomical orrery: true planetary positions (astronomy-engine), Golden Dawn / Liber 777
correspondences, Tree of Life, zodiac wheel. Static HTML + ES modules, no build step.

**Educational only. Planetary positions do not cause market moves, and nothing here is financial advice or a prediction.
Gematria values are traditional and educational; they are not predictive.**

- Run: `python3 -m http.server 8000` then open http://localhost:8000/
- Test: `node --test tests/`
- The previous MNQ Scalp Stacks `index.html` was removed by owner decision (normal commit; still in history at `cd7c184`).
- Licence for this project's own code: **owner decision (Josue) — not yet chosen.** Third-party notices: `vendor/`.
- Records marked `UNCONFIRMED` in `data/` have not been verified against a primary source and are shown with a badge in the UI.

## Features (tickets T1–T13, see draft PRs #1–#13)
Orrery (helio/geo), time scrubber + presets + URL state, correspondences panel + gematria, Tree of Life, zodiac wheel
(tropical/sidereal), aspects, PNG export/share/a11y, planetary hours, natal snapshot (signs only).
Deferred: house systems, optional 3D view. Open UNCONFIRMED items are listed in `data/*.json` (`status: "UNCONFIRMED"`).
Fixtures: `tests/fixtures/` (JPL Horizons, USNO, published Mercury stations) — regenerate Horizons with `node tools/fetch-horizons.mjs`.
