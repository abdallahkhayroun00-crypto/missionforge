# Sources, assumptions and disclosure

## NASA resources used

The challenge's resource descriptions informed this project's mission lifecycle, systems trade-offs and objective-driven instrument selection. We do not claim to have imported measured NASA spacecraft data or run GMAT.

1. [Official challenge and resources](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources): mission design, management, simulation and resource constraints.
2. [Design and Develop Science Missions](https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf): reference for scientific needs, requirements and launch/space/ground/user segments, as summarized on the challenge resource page.
3. [NASA's Build It Yourself telescope game](https://science.nasa.gov/mission/webb/game-build-it-yourself/): reference for linking scientific objectives to compatible instruments, as described on the resource page.
4. [CubeSat 101](https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf): further reference on small satellite development. The present version does not claim direct numerical specifications from this guide.

The linked primary resources should be reviewed by the team before final submission; current design attribution is based on the descriptions published on the official challenge Resources tab.

## Model

All component costs, masses, powers, usable battery capacities, data units, objectives, limits, science ratings and communication windows are **illustrative game parameters**, not NASA hardware specifications. Cost is in fictional credits. A fixed spacecraft bus contributes 10 kg, 8 credits and 8 W. Launch cost is included, while the launcher itself is not counted as satellite mass.

- Earth radius R = 6371 km; standard Earth gravitational parameter μ = 398600.4418 km³/s².
- Circular orbital period T = 2π√((R+h)³/μ), converted to minutes.
- Simplified maximum eclipse duration E = T × asin(R/(R+h))/π. This assumes a circular orbit, a cylindrical Earth shadow and zero solar beta angle. It is a teaching approximation, not a prediction for a real launch date.
- Sunlight duration S = T − E.
- Average power P = 8 W bus + 0.4 × payload active power + (contact minutes / orbital period minutes) × radio active power. Duty factors are illustrative, with average demand treated as constant in sunlight and eclipse.
- Generated energy per orbit = solar rated power × S/60 × 0.8. The 0.8 factor is an assumed net derating factor.
- Required energy per orbit = P × T/60.
- Usable battery capacity must exceed P × E/60. Battery capacities already represent usable storage. Additional conversion, charge-rate and degradation limits are omitted.
- Data returned = selected radio rate × assumed orbit contact time. These fictional data units are not Mbps, and contact time is not a calculated station-access prediction.
- Mapping requires the precision optical imager; wildfire tracking requires the thermal sensor; a broad survey accepts either optical camera.
- Science potential = instrument rating × orbit resolution factor × compatibility factor × min(1, returned data / target data). This is an illustrative learning indicator, not an estimate of scientific output. Failed constraints override mission readiness; they are not represented as random probabilities.

## Scope and limitations

Covers mission objective selection, component design, launch payload capacity, orbit choice, average energy, eclipse storage, data return and end-of-simulation feedback. Does not model propulsion, transfer maneuvers, launch windows, attitude dynamics, thermal balance, radiation, failures, weather, actual image acquisition, real ground networks, operations over days, or disposal. No high-fidelity trajectory solver or real-time NASA data connection. This prototype simulates a recurring orbit, rather than an entire real mission lifecycle.

A higher orbit has an assumed resolution penalty and a longer assumed contact window; real coverage and resolution depend on many additional factors. Launchers are fictional game categories, not quotes or guaranteed delivery options.

## AI assistance

AI tools (OpenAI Codex) assisted with code, tests, documentation, interface text and presentation drafting. Source comments and repository documentation identify this assistance. An AI-generated Earth environment is used in the arcade game with a visible in-game label. No generated audio, video or NASA branding are used. The engineering lab illustration is code-authored SVG. If a video or generated media is produced later, add the required disclosure and media labeling. Team members must verify accuracy and adapt this disclosure to their actual final use.

## External assets

DM Sans and Space Grotesk are requested through Google Fonts; system fonts work offline. The original generated Earth environment is bundled as assets/orbit-earth.jpg; it is artistic, not NASA imagery or measured data. NASA names are used only to identify the challenge and source materials, without implying endorsement.

## Orbital Expedition arcade mode

The main page now uses a separate real-time educational arcade model in flight-engine.js. Its 2.5D projection, direct movement, collision health, 150-second timer, scan packets and relay are game mechanics rather than an orbital trajectory solution. Battery energy changes by (sunlight generation − bus − movement − active instrument/downlink demand) × elapsed time. Left-side eclipse has zero generation. Camera scan time and power, battery capacity, solar generation and hardware mass influence play. Movement speed = 100 / (1 + mass/90), an intentionally fictional maneuverability rule, not a propulsion equation. Three survey beacons each yield exactly two packets; only downlinked packets count toward success. The lab equations above apply only to lab.html.

Environment artwork was generated with OpenAI image generation and converted to JPEG for web delivery. It is labeled AI-generated in the game and carries no NASA branding.
