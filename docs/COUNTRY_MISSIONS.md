# Country atlas missions — design, scientific context and limitations

MissionForge offers a **full upright map of the selected country** rather than a diagonal Earth-photo board. Players choose Morocco, Türkiye or Germany, navigate four geographic target areas, collect two data packets per area, and send all eight from a marked relay point. Route markers use approximate latitude and longitude; game travel and hazards are fictional and scaled for play.

## Mission maps

| Region | Scanning targets | Data relay |
|---|---|---|
| Morocco | Dakhla, Guelmim, El Jadida, Casablanca | Tangier |
| Türkiye | İzmir, Istanbul, Ankara, Antalya | Trabzon |
| Germany | Hamburg, Berlin, Frankfurt, Munich | Bremen |

Map outlines are simplified **Natural Earth (1:110m)** geographic data, adapted from [johan/world.geo.json](https://github.com/johan/world.geo.json), with latitude/longitude anchors in `country-missions.js`. The same outline data is stored locally in `country-outlines.js` so the game does not depend on an external map API.

**Cartographic note:** The Morocco gameplay map extends through the southern geographic region around Dakhla. Western Sahara is a disputed territory; the atlas uses a faint dashed subdivision to indicate that political boundaries are contested. This is a geographic gameplay map, not a statement about sovereignty or administrative authority.

## Challenge model (illustrative, not orbital engineering calculations)

- **Longer traversal:** movement is slower and depends on total spacecraft mass, allowing meaningful travel time between Dakhla, Guelmim, El Jadida and Casablanca.
- **Time budget:** 300 **game seconds**. Each science packet takes several seconds of continuous, stationary scanning. Returning data to the relay also takes time.
- **Energy balance:** moving and scanning use energy. Solar wings recharge in simulated sunlight. A *time-based* eclipse window stops generation regardless of the country/map coordinates.
- **Optical imaging:** local clouds, haze or dust periodically block the scan. The player may wait for visibility or visit another region first.
- **Debris:** drifting warning objects create avoidable collision hazards and may damage the spacecraft. They are not actual tracked orbital objects.
- **Loss conditions:** deplete the battery, exceed the time budget, or suffer too much damage. A successful mission requires all eight **transmitted** packets, not merely collecting them.
- **Route panel:** displays target progress, a geographical approximate straight-line distance computed from the transformed coordinates, and the remaining journey estimated in **scaled game time**.

The map is **not** a real-world simulation of low Earth orbit: a real satellite follows orbital ground tracks and cannot freely steer between cities. City-to-city navigation, scan zones, a shared on-screen relay and the countdown are abstract gameplay. Cloud and debris conditions are **not live**.

## Geographic and data references

- [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) — public-domain cartographic data used as the source of the low-resolution outlines
- [johan/world.geo.json](https://github.com/johan/world.geo.json) — simplified geometry files used for map rendering
- [GeoNames Morocco city reference](https://www.geonames.org/advanced-search.html?country=MA)
- [ESA — Earth observation and cloud-cover limitations](https://knowledge-hub-gda.esa.int/eo_capability/cloud-cover/)
- [ESA — space debris basics](https://www.esa.int/Space_Safety/Space_Debris)

The city points and silhouettes are appropriate for an educational game, not for legal boundary, flight navigation, imaging, or operational mission planning. Improving the model toward real satellite orbit mechanics or real-time Earth-observation data would be a separate future feature.
