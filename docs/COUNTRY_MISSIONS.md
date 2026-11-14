# Country missions: geography, learning goals and limitations

MissionForge's country expeditions are educational arcade scenarios built around **real-world city coordinates**. The player chooses a country, moves through a schematic mission map, scans four named target areas (two science packets per area), and sends eight packets from the relay station.

## Available destinations

| Country | Regional targets | Example observation |
|---|---|---|
| Morocco | Dakhla, Guelmim, El Jadida, Casablanca | Coastal lagoon, desert-edge land cover, shorelines, urban growth |
| Türkiye | İzmir, Istanbul, Ankara, Antalya | Aegean coastline, urban change, land use, coastal development |
| Germany | Hamburg, Berlin, Frankfurt, Munich | Port/estuary, urban cover, transport corridors, green zones |

The marker positions are based on approximate WGS84 latitude/longitude. An affine transform maps these to the screen for a playable mission. The screen geometry, travel distances and timing **are not physically accurate satellite orbit dynamics**.

## Which challenges are realistic?

- **Clouds, haze and dust can reduce optical visibility**. Optical scans in the game are blocked at some target areas when the simulated visibility window is poor. The windows are deterministic gameplay values; **they are not observations, forecasts or live weather**.
- **Satellite energy and battery storage** matter. Solar panels cannot generate energy during eclipse in the simplified game model, while scanning draws additional battery power.
- **Debris collision hazards** represent a real category of risk for spacecraft, but the arcade obstacles are **fictional** and do not correspond to tracked objects.
- **Scan and downlink requirements** illustrate the distinction between collecting scientific data and actually returning it to a receiver.

**Important limitations:** In reality, a satellite in orbit cannot steer from city to city as if it were an aircraft; actual revisit windows are determined by orbital mechanics. Likewise, a city's position does not determine whether a satellite is in Earth's shadow. The draggable/playable map and shaded eclipse area are intentionally abstract learning aids, not an orbital prediction. The mission objectives represent plausible remote-sensing applications, not claims that a current event is taking place.

## Geographic references and background

- [GeoNames — Morocco, including Guelmim and El Jadida](https://www.geonames.org/advanced-search.html?country=MA)
- [SimpleMaps — Morocco city reference including Dakhla](https://simplemaps.com/data/ma-cities)
- [Geodatos — Türkiye city coordinates](https://www.geodatos.net/en/coordinates/turkey)
- [GeoNames — German city coordinates](https://www.geonames.org/advanced-search.html?country=DE)
- [ESA Knowledge Hub — cloud masking for Earth observation](https://knowledge-hub-gda.esa.int/eo_capability/cloud-cover/)
- [ESA GDA — optical cloud limitations and radar alternatives](https://gda.esa.int/wp-content/uploads/2022/11/ESA-GDA-Wider-Economic-Benefits-of-EO.pdf)

A possible future extension is to add historical cloud masks or Earth-observation imagery with clearly displayed timestamps, actual orbit/ground-track calculations, and an appropriately sourced base map. These capabilities are **not** claimed or implemented in the current arcade model.
