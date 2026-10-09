# Optimalisatiecontrole 1.47.1

Gecontroleerd: opslag, gedeelde kaartbestanden, kaartwisselen, backups, lokale afbeeldingsexport, markerweergave en afbeeldingsomvang.

## Verholpen
- Losse campagne ophalen gebruikt nu een directe lookup, met alleen de bijbehorende kaartafbeelding.
- Opslaan hergebruikt de hash van dezelfde Blob en schrijft bestaande gedeelde afbeeldingen niet opnieuw. Opruimen van ongebruikte afbeeldingen gebeurt bij vervanging/verwijdering, niet bij iedere tekstwijziging.
- Mislukt opslaan blokkeert acties die de actieve gegevens zouden vervangen of een verouderde volledige backup zouden maken. Individuele export van de actuele gegevens blijft beschikbaar als herstelmogelijkheid.
- Lokale afbeeldingsexport accepteert de assets-map zonder bestanden voor ingebouwde data-URI-iconen te eisen.
- Bezoekhistorie wordt op aanwijzen berekend, niet voor alle markers bij ieder renderen.
- 59 wereldiconen staan in een gedeeld script voor app en overzicht; de offlinecache bevat dit bestand.
- Logo: 256 pixels; punaise: 192 pixels, ruim boven de zichtbare 52 pixels. Transparantie visueel gecontroleerd. De grote originelen blijven in vorige releases en het afzonderlijke originelenpakket.

## Bewijs en grenzen
Automatische syntax/structuurcontrole en volledige regressiesuite via scripts/release.cjs. Gerichte opslagtests tellen hashes, afbeeldingswrites en volledige scans; DOM-tests controleren mislukte saves en export met ingebouwde afbeeldingen. Bestaande backup- en koppeltests blijven onderdeel van de suite.

Dit zijn gesimuleerde DOM/opslagtests, geen echte IndexedDB- of browsermetingen. Geen garantie dat alle mogelijke fouten gevonden zijn. Echte browsercontrole van opslagquota, offlineupdates en canvasexport blijft nodig. Geen gebruikerssaves gewijzigd en geen website gepubliceerd.
