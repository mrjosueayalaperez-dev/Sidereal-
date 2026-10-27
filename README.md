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

## Per-planet esoteric layer (built in)
Every planet carries its correspondences in `data/planets.json` under `planet.esoteric`, and they always render with the
planet (info card and every table row naming a planet). There is no on/off toggle. The GD/Gra control only switches
*which* letter attribution is shown.

Each field is `{ "value": …, "source": ["<key in data/sources.json>"], "status": "confirmed" | "UNCONFIRMED", "note"?: … }`.
UNCONFIRMED fields keep `value: null` and are shown blank with a badge. Current fields: `hebrewLetter` (with `variants.gra`
etc.), `nameGematria` (doc §3), `tarot` (UNCONFIRMED, not in the research doc).

**To add a new esoteric element (data only, no code):**
1. Add `"myField": {"value": …, "source": [...], "status": "confirmed"}` (or `null` + `"UNCONFIRMED"` + `note`) to `esoteric` for **all 7 planets**.
2. Add `{"key": "myField", "label": "My field", "format": "text"}` to `data/esoteric-registry.json` (`format`: `text` | `number` | `hebrew-letter`;
   optional `systemAware: true` to pick `variants[<letter system>]`, `detailKey` for a secondary value).
3. Add any new source keys to `data/sources.json`. Run `node --test tests/`: `tests/esoteric-data.test.js` checks every planet has every registry field.
