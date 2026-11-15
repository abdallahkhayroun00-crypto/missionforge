# Submission draft — review before submitting

## Project name
MissionForge

## Team
Atlas Tech

Members: Abdallah Khayroun, Fahd Mtidam, Youssef Chadli.

## High-level summary
MissionForge is an educational space mission design game that turns engineering trade-offs into decisions learners can test. Players select an Earth-observation objective, assemble a spacecraft, choose a launcher and orbit, and simulate whether their design meets budget, mass, energy, battery, data-return and scientific-compatibility constraints. Clear feedback explains why a design succeeds or requires another iteration.

## Project demo
Use the seven-slide deck at `docs/presentation.html`, or export it to a seven-page PDF. Replace this line with a tested public deck/PDF URL. The deck identifies Atlas Tech and all three team members.

## Final project link
Replace with the verified live site URL after hosting is enabled. Also include https://github.com/abdallahkhayroun00-crypto/missionforge as the source repository. Do not submit an expected Pages URL before testing that it is live and public.

## Spacecraft workshop update
The primary experience now starts in a freely configurable 5×5 spacecraft workshop. Players assemble connected modules, study mass distribution and resource trade-offs, and run adjustable power-bench experiments. They can save eight local designs, overlay a saved design's battery curve, share design JSON, and fly their assembled spacecraft in the 2.5D game. Sandbox costs are informational; the preset expedition remains budget constrained.

## Playable expedition update
The main experience is now Orbital Expedition, a real-time 2.5D game with keyboard and touch controls. Players configure their satellite within a budget, scan three regions, avoid debris, manage energy in sunlight and eclipse, and deliver six packets to a relay. Hardware choices affect scan time, power, storage and maneuverability. The detailed mission-design lab remains available as a companion learning tool. The arcade model is intentionally scaled and does not simulate orbital mechanics. The Earth environment is AI-generated and visibly labeled.

## Detailed description — companion engineering lab
The player acts as a mission designer in a small satellite program. Three objectives create different instrument and data needs. Six hardware and orbit categories offer choices with consequences that are immediately reflected in resource meters. The launch action evaluates six explicit engineering constraints and explains how the player can improve each failed check.

A simplified circular-orbit model estimates period and eclipse duration. Sunlight generation, average consumption and eclipse storage are evaluated separately, showing why a large battery cannot compensate indefinitely for insufficient solar power. Radio throughput and assumed ground-contact time determine data return. Instrument compatibility connects the engineering design back to the scientific goal.

The browser prototype uses vanilla HTML, CSS and JavaScript modules. It requires no account, API key, backend or installation. It includes an orbital illustration, responsive interface, example designs and automated model tests. Physical approximations, fictional component values and scope limitations are documented publicly. It is a teaching model rather than validated mission-planning software.

## NASA data and resources
The official challenge Resources tab guided the use of mission objectives, systems trade-offs and an iterative design workflow. Its summaries of Design and Develop Science Missions and NASA's Build It Yourself telescope game informed the lifecycle and objective-to-instrument structure. See docs/SOURCES.md for links and attribution. No actual spacecraft telemetry is imported; component specifications are illustrative.

## Tools and resources
HTML, CSS, JavaScript, inline SVG, Python's development HTTP server, Node.js built-in test runner, GitHub and Google Fonts (DM Sans, Space Grotesk). See docs/SOURCES.md for model equations, NASA references, asset attribution and limitations.

## AI use disclosure
OpenAI Codex assisted with implementation, tests, documentation, interface copy and presentation drafting. The team must review the result, source attribution and final disclosure before submission. The main game includes a visibly labeled AI-generated Earth environment. No NASA logos or generated audio/video assets are included.

## Checklist
- Confirm the spelling of Atlas Tech and all three member names before submitting.
- Review the primary NASA resources and ensure source claims match actual use.
- Verify public access to the game and deck without login.
- Complete all required project page fields in English.
- Keep the demo to seven slides OR a video of at most 30 seconds.
- Confirm local judging requirements and deadline with the event organizer.
- Click Submit for Judging; a saved draft is not a submission.
