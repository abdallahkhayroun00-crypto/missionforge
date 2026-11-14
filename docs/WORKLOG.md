# Development log

## 2026-11-14 — initial implementation
- Built static HTML/CSS/JavaScript mission designer, three objectives, six selection groups and six engineering checks.
- Added reproducible successful designs, explicit physical assumptions, NASA resource attribution, seven-slide deck and submission draft.
- Added Atlas Tech: Abdallah Khayroun, Fahd Mtidam, Youssef Chadli.

## 2026-11-14 — youth-oriented gameplay refinement
- Added violet/lime mission-control styling, responsive cards, reduced-motion-aware orbital motion and a three-step onboarding strip.
- Added a four-phase mission sequence: launch review, sunlight, eclipse and science downlink. A failed stage blocks subsequent stages; individual engineering diagnostics remain visible for learning.
- Added a five-attempt session log with objective, readiness, budget and mass, and an explicit clear action. Data is held in memory, not persisted after refresh.
- Clarified resource meters: spending is compared with limits; supply is compared with requirements. Added visible data-return requirements.
- Corrected radio duty cycle to use contact duration divided by orbital period. The old fixed 10% duty factor was inconsistent with different orbit contact windows.
- Changed illustrative small-battery usable capacity from 15 Wh to 8 Wh to make eclipse storage a meaningful design choice. Updated the demonstration deck accordingly.
- Verification: Node model tests, exhaustive evaluation of 288 configurations, and DOM interaction checks for all three objectives, reset, history and phase display.
- Remaining limitations: browser visual/device testing unavailable in this environment; real source-document review, hosting activation and final submission remain outstanding. Simulation remains a simplified recurring-orbit educational model, as detailed in SOURCES.md.

## 2026-11-14 — interactive flight academy
- Added a modal flight academy using the current spacecraft configuration and the same engineering simulation.
- Four illustrated flight phases connect actual constraint results to prediction questions and immediate explanatory feedback.
- Added per-objective badges for viable designs and a separate four-question learning score. Repeating a goal does not duplicate badges; quiz answers never alter simulation physics.
- Supports closing/reopening, keyboard-native controls, small screens and reduced-motion preference. Orbit animation is illustrative, not a trajectory simulation.
- Verified model regression tests and DOM academy progression, correct/wrong answers, repeated sessions, scoring and unique badges. Visual browser testing remains outstanding.

## 2026-11-14 — Orbital Expedition 2.5D rebuild
- Replaced the landing experience with an actual real-time canvas game. Preserved the companion engineering designer at lab.html.
- Added commissioned AI-generated Earth art, isometric projected spacecraft with solar wings, depth-sorted debris, survey beacons, eclipse shading and a relay.
- Added keyboard/touch movement, held scan/downlink actions, stabilization requirements, health/collision grace time, battery charge/discharge, pause, victory/failure and refitting.
- Hardware loadout affects scan rate, draw, capacity, charging and movement; budget prohibits selecting every upgrade.
- Added arcade-model tests including a complete movement route with active debris and default hardware that delivers all six packets.
- Updated presentation and submission documentation to distinguish arcade rules from the engineering lab model and disclose generated art.
- Browser runtime remained unavailable; rendering and real-device input still need visual verification. Model tests do not substitute for that check.

## 2026-11-14 — modular spacecraft sandbox
- Prioritized free spacecraft construction and engineering experiments following the owner's preference.
- Added a 5×5 isometric workshop with placement, removal, view rotation, fixed core and seven module types; validated orthogonal connectivity and required systems.
- Computed total mass, mass center, storage, generation, hull protection and an explicitly illustrative control factor from the actual layout.
- Added a 180-second power bench with imaging duty/eclipse controls, first-depletion reporting and comparison against saved designs.
- Added eight local fleet slots, replacement by name, loading/deletion, JSON import/export and blocked-storage handling.
- Integrated workshop craft into flight: module layout renders on the ship; calculated hardware drives power, mass, movement and health. Refit returns the current craft to the workshop.
- Updated homepage, project deck, README, sources and submission draft. Documented local-only persistence and differences between bench, arcade and detailed lab models.
- Verification: 27 automated model tests; DOM smoke checks for workshop save/load/compare/launch transfer and game setup/pause/refit. A continuous flight with the starter workshop craft succeeds while avoiding the central debris on its return route. Visual device testing remains outstanding because the browser runtime is unavailable.

## 2026-11-14 — real browser QA and corrections
- Established a repeatable Playwright suite using installed Chromium, replacing the earlier limitation to DOM-only smoke tests. Added a development dependency, lockfile, browser config and npm commands; the runtime app remains dependency-free.
- Reproduced and fixed an actual 3D deck hit-testing bug that prevented clicks on empty tiles. Verified every editable tile and four rotations on desktop and mobile.
- Corrected fractional-eclipse integration and initial-empty-battery reporting; tightened imported design shape and name validation.
- Unified keyboard/touch downlink visualization, simplified mobile labels, removed duplicate background attribution and replaced unsupported decorative glyphs.
- Tested complete winning flights with keyboard input, real mobile touch hold/release, failure/refit, all module/preset choices, fleet/storage/file paths, lab/academy workflows and local links.
- Added docs/QA.md with coverage and limits, actual Chromium screenshots, and a verified seven-page PDF. Added a reproducible PDF export script using public URLs.
- Final verification: 30 model tests and 29 browser cases pass; desktop touch duplicate intentionally skipped. Additional small phone/tablet/laptop width checks show no horizontal overflow. No physical-device or non-Chromium browser claim is made.
