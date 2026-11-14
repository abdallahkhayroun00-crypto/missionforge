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
