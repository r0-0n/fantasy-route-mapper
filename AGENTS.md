# Fantasy Route Mapper — projectafspraken

## Product
- Behoud lokaal gebruik door dubbelklikken op index.html, zonder installatie of server.
- Gebruik vanilla HTML, CSS en JavaScript met klassieke scripts in vaste volgorde. Voeg geen React/Vue, bundler, ES-module-loader, CDN of runtime-afhankelijkheid toe zonder expliciete opdracht.
- Beperk wijzigingen tot de opdracht. Behoud bestaande functionaliteit en de Nederlandse interface.

## Gegevens
- Behoud IndexedDB-naam FantasyRouteMapper, store campaigns, databaseversie, localStorage-sleutels en bestaande migraties.
- Behoud compatibiliteit met oude campagnes, individuele exports en volledige backups inclusief kaarten. Verhoog dataVersion/backupVersion alleen als een formaatwijziging dit vereist, met migratie en tests.
- Gebruik uitsluitend testdata voor automatische tests. Wis nooit echte gebruikerscampagnes.

## Versies en oplevering
- A.B.C: A = grote sprong in werking/opzet; B = nieuwe functionaliteit; C = bugfixes zonder nieuwe functionaliteit. Rechts van een verhoogd nummer wordt alles nul.
- Alleen documentatie/ontwikkelhulpmiddelen toevoegen verandert de appversie niet.
- Houd package.json, APP_VERSION, HTML-titel, zichtbare versie, README en ZIP-versie gelijk.
- Overschrijf geen oudere releases. Werk vanuit de laatste geverifieerde bron; meld het als die ontbreekt.
- Behoud de README-sectie 'Gebruik Fantasy Route Mapper' met exact deze links:
  - https://r0-0n.github.io/fantasy-route-mapper/
  - https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip
- Wijzig geen licentievoorwaarden zonder expliciete opdracht.

## Verificatie
- Voer npm run check en npm test uit. npm run release voert beide uit voordat het een ZIP maakt.
- Test relevante gewijzigde gebruikersflows ook in een echte browser wanneer toegestaan. Gebruik de checklist in BROWSER_TESTS.md.
- Presenteer gesimuleerde DOM/opslagtests nooit als echte browser- of IndexedDB-tests. Vermeld beperkingen en niet-uitgevoerde controles.
- Publiceren naar GitHub of een website is geen automatisch onderdeel van een lokale release.

Deze afspraken helpen menselijke en AI-bijdragers. Ze zijn geen beveiligingsmechanisme en regelen geen eigendom.
