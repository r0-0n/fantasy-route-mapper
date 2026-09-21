# Fantasy Route Mapper 1.4.0

Routes en locaties krijgen tabeloverzichten zoals het reislogboek. De zijbalk is voor de details van de geselecteerde route of locatie.

## Gebruik Fantasy Route Mapper

🌐 **[Online gebruiken](https://r0-0n.github.io/fantasy-route-mapper/)**\
Gebruik Fantasy Route Mapper direct in je browser.

💾 **[Downloaden voor lokaal gebruik](https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip)**\
Download de tool en gebruik hem lokaal, zonder installatie.

## Starten

Pak de volledige ZIP uit en open `index.html`. Houd de mappen `css/` en `js/` erbij. Geen installatie, npm, framework of server nodig voor de app. JavaScript en lokale browseropslag moeten toegestaan zijn. Bij publicatie op GitHub Pages upload je de inhoud van de map inclusief submappen. Deze oplevering publiceert niets automatisch.

## Nieuw in 1.4.0

### Drie overzichten, één manier van werken

- Routes opent een tabel met routenaam, beginlocatie, eindlocatie, afstand, status en acties. Zoeken/filteren/sorteren blijven beschikbaar. Bewerken opent de bestaande route-editor in de zijbalk; Toon op kaart maakt de route zichtbaar en centreert die.
- Locaties opent een tabel met naam, type, regio, eigenaar/factie, omschrijving en acties. Een locatie selecteren vanuit de tabel of op de kaart opent de details in de zijbalk. De losse locatielijst en het tweede routezijpaneel zijn verwijderd.
- Logboek opent het bestaande reisoverzicht. De bestaande sessie-editor en exports blijven beschikbaar.
- De eenvoudige routedropdown blijft als extra snelle keuze in de route-editor, zonder afstand/status.

### Locatiedetails en verplaatsen

Naam, type, regio, factie, omschrijving en DM-notities zijn bewerkbaar in de zijbalk. Wijzigingen worden tijdens het invoeren automatisch opgeslagen; Locatie opslaan blijft beschikbaar. ‘Locatie verplaatsen’ activeert plaatsing op de kaart, met de details nog zichtbaar. Escape annuleert. Begin-/eindpunten van gekoppelde routes bewegen mee; tussenpunten en historische reissnapshots blijven behouden.

Een locatie die nog een begin/einde van een route is, kan niet direct worden verwijderd. Koppel die route eerst aan een andere locatie of verwijder de route. Dit voorkomt nieuwe routes zonder eindpuntkoppeling.

### Begin- en eindlocaties voor routes

Bij Nieuwe route kies je bestaande begin- en eindlocaties. Je kunt meteen een rechte lijn maken en die vervolgens met Punt invoegen aanpassen, of zelf tekenen vanaf de beginlocatie. Ook ‘Route vanaf hier’ opent dit venster met de beginlocatie ingevuld.

Bij afronden sluit een getekende route aan op de gekozen eindlocatie. Een nabijgelegen andere bestemming kan via bevestiging worden gekoppeld. Bij een nog ongekoppeld eerste punt wordt op dezelfde manier een nabijgelegen beginlocatie voorgesteld (binnen circa 25 schermpixels). Dit werkt ook voor oude routes. Begin en einde mogen dezelfde locatie zijn, bijvoorbeeld bij een rondreis.

In de route-editor kun je de locaties achteraf wijzigen met ‘Locaties koppelen’. Tussenpunten blijven daarbij staan. Gekoppelde eindpunten zijn niet vrij te slepen of afzonderlijk te verwijderen: wijzig de koppeling of verplaats de locatie. Routes dupliceren behoudt nu de gekoppelde eindpunten op dezelfde coördinaten.

Bestaande routes zonder koppelingen blijven behouden en krijgen een melding in de editor. Er worden geen locaties verzonnen en geen oude routegegevens weggegooid. Een route in bewerking kan tijdelijk nog niet geometrisch afgerond zijn; de gekozen locatiekoppelingen worden al bewaard.

## Compatibiliteit en opslag

Basis: de volledige 1.3.3-projectbundel. IndexedDB blijft `FantasyRouteMapper`, versie 1, store `campaigns`. Data- en backupversie blijven 1; bestaande migraties en JSON-formaten blijven behouden. Routekoppelingen gebruiken de al bestaande velden `fromLocationId` en `toLocationId`.

Browseropslag is gekoppeld aan browser/profiel en oorsprong. Bij een andere browser, domein of lokaal pad kunnen campagnes niet automatisch zichtbaar zijn. Exporteer dan eerst een volledige backup uit de oude versie en importeer die in de nieuwe. Gewone campagne-export bevat geen kaart; volledige backups kunnen die wel bevatten. Verwijder geen browsergegevens om een weergaveprobleem op te lossen.

De compacte schaal/opslagstatus en de backupdatum in het Campagne-menu blijven behouden. De algemene instructiebalk blijft verborgen tijdens normaal kaartgebruik. CSS en scripts hebben een versieparameter tegen oude cache.

## Bestanden en ontwikkeling

`index.html` bevat de interface. `css/app.css` bevat de styling. Klassieke scripts in `js/` verdelen state/init, opslag, kaart, routes, locaties, reislogboek, kalender en import/export. Ze delen een globale scope en worden in vaste volgorde geladen. Geen ES-modules of externe pakketten nodig.

`AGENTS.md` bevat de projectafspraken. Versies volgen A.B.C: grote sprong / nieuwe functionaliteit / bugfixes. `BROWSER_TESTS.md` bevat de handmatige controlelijst.

Alleen voor ontwikkeling: Node.js 22 of hoger met npm; geen npm install nodig.

- `npm run check`: versies, README-links en klassieke lokale scripts.
- `npm test`: regressies en integratie van bediening met gesimuleerde DOM.
- `npm run release` (of `npm run build`): dezelfde controles, daarna `dist/fantasy-route-mapper-v1.4.0.zip`. Geen compilatie. Een bestaande ZIP wordt niet overschreven.

Zonder npm kun je dezelfde controles uitvoeren met `node scripts/check.cjs`, `node tests/verify.cjs` en `node tests/flows.cjs`; `node scripts/release.cjs` voert ze alle drie uit en maakt de ZIP.

## Uitgevoerde controles

Geslaagd: syntax, DOM-ID/selectorverwijzingen, versies en links, bestaande kalender/reisberekeningen en importpreviewtests. Aanvullend getest met de daadwerkelijke eventhandlers tegen een gesimuleerde DOM: alle drie overzichtstabs, tabellen, detailselectie, locatie-autosave, verplaatsen met gekoppelde routes, rechte en getekende routes, ontbrekende locaties afwijzen, nabijgelegen begin-/eindlocaties koppelen, tussenpunten behouden en beschermen van gekoppelde eindpunten. De HTML-nesting en de ZIP zijn eveneens gecontroleerd.

**Beperking:** dit zijn geen echte browser-, layout- of IndexedDB-persistentietests. De lokale browsercontrole is eerder door de browserbeveiliging geblokkeerd. De visuele weergave, echte downloads en behoud na herladen moeten nog praktisch worden gecontroleerd; zie BROWSER_TESTS.md.
