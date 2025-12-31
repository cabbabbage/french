# French Learning App Skeleton

This directory mirrors `french_learning_app_plan_short.md` and shows how the data, selector, and UI pieces connect. The current build runs inside a Vite + React shell with a placeholder orchestrator, hoverable text helper, and a unified look-and-feel so you can focus on the remaining plan work.

## Layout
- `src/core/` – typed dictionary loader, scoring rules, phase unlocking logic, capability gating, test catalog, and selector plumbing.
- `src/ui/components/` – orchestrator layout, base test shell, hoverable phrase display, candidate panel, and the MC/TXT/SPK variants wired into live scoring.
- `src/ui/styles/theme.css` – lightweight styling for the dashboard, cards, text, and controls.
- `src/App.tsx` + `src/main.tsx` – entry point that brings the orchestrator, instruction panel, and word selector together.

## What to implement next
1. Merge the real dictionary with saved progress/history (progress.csv, localStorage, or a backend) inside `src/core/dataModel.ts` so the planner selects words based on actual state rather than defaults.
2. Fully implement the selector pipeline (recency/fallback, capability relaxation) and persist history before wiring `CandidatePanel` and `TestOrchestrator` to it.
3. Build out each test variant (MC/TXT/SPK) inside the orchestrator so the cards honor the new scoring logic, record attempts, and display deltas.
4. Expand `HoverableTextDisplay` with dictionary tooltips, audio playback, and interaction affordances for hover/click per the plan.
5. Introduce POS-specific test types inside `testCatalog` once the grammar metadata is available.
6. Flesh out capability gating controls (probably in a settings panel) and ensure advanced phases respect audio output/input availability.

## Running the placeholder app
```
npm install
npm run dev
```
The current build is a lightweight prototype, but the orchestrator already consumes the real dictionary and the scoring hooks are in place. Fill in the remaining steps to finish the full experience.
