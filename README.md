# Fantasy Route Mapper 1.6.0

Routes en locaties krijgen tabeloverzichten zoals het reislogboek. De zijbalk is voor de details van de geselecteerde route of locatie.

## Gebruik Fantasy Route Mapper

🌐 **[Online gebruiken](https://r0-0n.github.io/fantasy-route-mapper/)**\
Gebruik Fantasy Route Mapper direct in je browser.

💾 **[Downloaden voor lokaal gebruik](https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip)**\
Download de tool en gebruik hem lokaal, zonder installatie.

## Starten

Pak de volledige ZIP uit en open `index.html`. Houd de mappen `css/` en `js/` erbij. Geen installatie, npm, framework of server nodig voor de app. JavaScript en lokale browseropslag moeten toegestaan zijn. Bij publicatie op GitHub Pages upload je de inhoud van de map inclusief submappen. Deze oplevering publiceert niets automatisch.

## Nieuw in 1.6.0

- Een gewone klik op een routelijn selecteert de route, zonder punten toe te voegen.
- ‘Punt invoegen’ is een aan/uit-knop. Als deze aanstaat, voeg je met klikken op een routelijn meerdere punten na elkaar toe. Klik opnieuw op de knop, gebruik Annuleren of druk Escape om te stoppen. Klikken naast een routelijn voegt niets toe. De geselecteerde invoegpunten kun je verslepen.
- Bij Nieuwe route is de extra keuze ‘Route maken’ tussen direct verbinden en zelf tekenen verdwenen. Begin- en eindlocatie blijven optioneel. Met twee locaties ontstaat een directe lijn; zonder twee locaties begin je vrij te tekenen. De bevestigingsknop blijft nodig om de gekozen optionele locaties toe te passen.
- Stoppen met tekenen laat alle routepunten exact staan. Later koppelen en ontkoppelen blijft mogelijk.
- Campagne-instellingen bevat nu zowel de afstandseenheid als de knop Schaal instellen en de huidige schaal. De losse schaalactie in het Campagne-menu is verwijderd. Voor het kiezen van kaartpunten sluit het instellingenvenster.
- Het locatietype heet alleen Encounter.
- De naamweergave per locatie is één checkbox: ‘Naam op de kaart tonen’. Er is geen automatische zoom-/selectieregel en geen algemene naamcheckbox meer. Oude expliciet verborgen namen blijven verborgen; oude automatische of ontbrekende voorkeuren gelden als ingeschakeld. Deze keuze geldt ook voor de spelerskaart-export, naast de bestaande globale exportoptie om alle namen weg te laten.
- Locaties blijft de eerste tab; tabeloverzichten en detailzijbalk blijven behouden.

## Compatibiliteit en opslag

Basis: de volledige 1.5.0-projectbundel. IndexedDB blijft `FantasyRouteMapper`, versie 1, store `campaigns`. Data- en backupversie blijven 1; bestaande migraties en JSON-formaten blijven behouden. Routekoppelingen gebruiken de al bestaande velden `fromLocationId` en `toLocationId`. Naamweergave gebruikt het optionele locatieveld `labelMode`; ontbreekt dit in een oude backup, dan geldt de naam als ingeschakeld.

Browseropslag is gekoppeld aan browser/profiel en oorsprong. Bij een andere browser, domein of lokaal pad kunnen campagnes niet automatisch zichtbaar zijn. Exporteer dan eerst een volledige backup uit de oude versie en importeer die in de nieuwe. Gewone campagne-export bevat geen kaart; volledige backups kunnen die wel bevatten. Verwijder geen browsergegevens om een weergaveprobleem op te lossen.

De compacte schaal/opslagstatus en de backupdatum in het Campagne-menu blijven behouden. De algemene instructiebalk blijft verborgen tijdens normaal kaartgebruik. CSS en scripts hebben een versieparameter tegen oude cache.

## Bestanden en ontwikkeling

`index.html` bevat de interface. `css/app.css` bevat de styling. Klassieke scripts in `js/` verdelen state/init, opslag, kaart, routes, locaties, reislogboek, kalender en import/export. Ze delen een globale scope en worden in vaste volgorde geladen. Geen ES-modules of externe pakketten nodig.

`AGENTS.md` bevat de projectafspraken. Versies volgen A.B.C: grote sprong / nieuwe functionaliteit / bugfixes. `BROWSER_TESTS.md` bevat de handmatige controlelijst.

Alleen voor ontwikkeling: Node.js 22 of hoger met npm; geen npm install nodig.

- `npm run check`: versies, README-links en klassieke lokale scripts.
- `npm test`: regressies en integratie van bediening met gesimuleerde DOM.
- `npm run release` (of `npm run build`): dezelfde controles, daarna `dist/fantasy-route-mapper-v1.6.0.zip`. Geen compilatie. Een bestaande ZIP wordt niet overschreven.

Zonder npm kun je dezelfde controles uitvoeren met `node scripts/check.cjs`, `node tests/verify.cjs` en `node tests/flows.cjs`; `node scripts/release.cjs` voert ze alle drie uit en maakt de ZIP.

## Uitgevoerde controles

Geslaagd: syntax, versies, links, DOM-ID’s/selectoren en bestaande regressies. Aanvullend gesimuleerd met de echte handlers: selecteren zonder extra punt, meerdere invoegingen met een ingeschakelde knop, uitschakelen van de modus, route-aanmaak zonder extra keuzelijst, schaalactie vanuit het campagnevenster en compatibiliteit van de naamcheckbox. De HTML-structuur en ZIP zijn gecontroleerd.

Er is geen echte visuele browser- of IndexedDB-persistentietest uitgevoerd. Die toegang was eerder geblokkeerd. Zie BROWSER_TESTS.md voor de resterende praktische controles.
