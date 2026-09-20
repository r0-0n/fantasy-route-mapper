# Fantasy Route Mapper 1.0.0

Architectuurrelease op basis van de geüploade v0.9.8. De bestaande vanilla HTML/CSS/JavaScript-app is verdeeld over afzonderlijke bestanden. Er zijn geen nieuwe functies, frameworks, externe afhankelijkheden, buildstappen of serververeisten toegevoegd.

## Gebruik Fantasy Route Mapper

🌐 **[Online gebruiken](https://r0-0n.github.io/fantasy-route-mapper/)**\
Gebruik Fantasy Route Mapper direct in je browser.

💾 **[Downloaden voor lokaal gebruik](https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip)**\
Download de tool en gebruik hem lokaal, zonder installatie.

## Lokaal starten

1. Pak de volledige ZIP uit.
2. Open `index.html` door erop te dubbelklikken.
3. Houd `index.html`, `css/` en `js/` bij elkaar in dezelfde mapstructuur.

Alle appbestanden zijn lokaal aanwezig. Je hebt geen installatie, npm, internetverbinding of lokale webserver nodig om de app te laden. De browser moet JavaScript en lokale browseropslag toestaan, net als bij v0.9.8. Open het bestand vanuit de uitgepakte map, niet vanuit een ZIP-preview. De map `tests/` is alleen voor ontwikkelaars en niet nodig voor gebruik.

## Bestaande campagnes en backups

De database blijft `FantasyRouteMapper`, databaseversie 1, objectstore `campaigns`. Ook `dataVersion: 1`, `backupVersion: 1`, legacy `formatVersion: 13`, alle localStorage-sleutels en de bestaande migraties zijn behouden. Alleen de appversie wordt `1.0.0`.

De bestaande mogelijkheden blijven aanwezig: campagnebeheer, kaarten, schaal, routes en routepunten, locaties en verplaatsen, sessies/reislogboek, Harptos-datums, filters, Markdown-/HTML-export, spelerskaart-PNG, individuele campagne-export, backups inclusief kaart en backups van alle campagnes.

Browseropslag hoort bij de browser, het profiel en de oorsprong van de app. Deze release wijzigt de opslag niet, maar verhuizen naar een ander domein, browserprofiel of lokaal bestandspad kan een andere opslagruimte opleveren; de behandeling van `file://` verschilt per browser. Maak voor zo'n verhuizing in de oude versie een volledige backup en importeer die in 1.0.0. De oude data worden door deze release niet verwijderd. Een volledige backup kan de kaart bevatten; een gewone campagne-export bevat de kaartafbeelding niet.

Voor GitHub Pages: vervang de appbestanden op dezelfde bestaande site en publiceer ook de mappen `css/` en `js/`. Alleen `index.html` uploaden is niet meer voldoende. De links hierboven zijn de bestaande projectlinks; deze oplevering publiceert niets naar GitHub.

## Bestandsindeling

```text
index.html          Interface en vaste scriptlaadvolgorde
css/app.css         Bestaande styling
js/app.js           Gedeelde state, versies, algemene helpers, campagne-interface
js/storage.js       IndexedDB, opslaan/laden, normalisatie, migraties, backupformaten
js/map.js           Kaart, SVG-rendering, pannen, zoomen, schaal en pointerbediening
js/routes.js        Routes, afstand, selectie en route-editor
js/locations.js     Locaties zoeken, plaatsen, bewerken en verplaatsen
js/travel.js        Sessies, snapshots, reislogboek, filters en totalen
js/harptos.js       Kalender, datumparser en kalenderdialoog
js/export.js        Import/export-bediening, downloads, HTML/Markdown en PNG
js/init.js          Eventregistratie in oorspronkelijke volgorde en opstarten
README.md           Gebruiks- en onderhoudsinformatie
tests/verify.cjs    Herhaalbare bron- en regressiecontroles, zonder testpakketten
```

## Onderhoud en laadvolgorde

`index.html` laadt gewone klassieke scripts aan het einde van de interface, in de bovenstaande volgorde. Geen `type="module"`, `import`, `export`, `async`, `defer` of fetch-loader is nodig. Dit vermijdt modulelaadbeperkingen bij rechtstreeks lokaal openen.

De scripts delen bewust één globale scope. `app.js` definieert de gedeelde state; de domeinbestanden leveren functies en hun `bind…UI`-registratiefuncties. `init.js` roept die registraties in de oorspronkelijke volgorde aan. Voeg geen tweede globale declaratie met dezelfde naam toe. Verplaats initialisatie niet vóór het laden van de benodigde domeinbestanden.

Dit is een conservatieve opsplitsing: de centrale `render()` staat in `map.js` en werkt ook de zijpanelen bij. Opslagfuncties gebruiken de gedeelde state en roepen soms weergavefuncties aan. Deze bestaande koppelingen zijn behouden om gelijktijdige gedragswijzigingen te vermijden. De oorspronkelijke compacte functie-inhoud is niet herschreven.

## Uitgevoerde controles

De controles zijn uitgevoerd tegen het geüploade originele v0.9.8-bestand:

- Alle negen JavaScript-bestanden afzonderlijk op syntax gecontroleerd en in de opgegeven volgorde uitgevoerd in een testomgeving.
- Alle 95 oorspronkelijke benoemde functies exact gelijk bevonden, evenals de uiteindelijke eventhandlers en de registratievolgorde van eventlisteners.
- CSS exact gelijk; HTML gelijk na aftrek van externe bestandsverwijzingen en versieaanduidingen.
- Geen dubbele HTML-ID's of ontbrekende statische `$("#id")`-verwijzingen.
- Opstarten, campagne maken, opslaan/herladen, individuele export/import, volledige backup/herstel, afwijzen van ongeldige/toekomstige data en legacy-migratie getest met gesimuleerde DOM en IndexedDB.
- Harptos-maand-, feestdag-, schrikkeljaar- en jaargrenzen; ongeldige datums; nul dagen, expliciete sessiedagen, automatische datums en geschatte reistijden getest.
- Routeafstand, reissnapshot, logboektotalen, sessie-/speeldatumkolommen, schaalinvoer met decimale komma en ongeldige schaalwaarden getest.

De tests slagen. De gesimuleerde opslagcontroles gebruiken uitsluitend testdata en raken de browsercampagnes van de gebruiker niet.

**Beperking:** een echte browserkliktest via `file://` kon in de uitvoeromgeving niet plaatsvinden: het starten van de testbrowser mislukte en de geïntegreerde browser blokkeerde de lokale URL. Daarom zijn echte IndexedDB-persistentie, afbeeldingsweergave, downloads en PNG-output niet opnieuw in een browser bevestigd. De bronvergelijking en regressietests geven sterke ondersteuning voor gelijkwaardig gedrag, maar vervangen die browsercontrole niet.

Ontwikkelaars kunnen de controles herhalen met Node.js (alleen voor testen):

```sh
node tests/verify.cjs
node tests/verify.cjs /pad/naar/originele-v0.9.8/index.html
```

Met het oorspronkelijke bestand als argument worden ook de bronvergelijkingen uitgevoerd.

## Aanvullende browsercontrole bij ingebruikname

Open de uitgepakte `index.html`, maak een testcampagne en laad een kaart. Controleer schaal, route tekenen/punten aanpassen, locaties plaatsen/verplaatsen, sessie opslaan en het Harptos-reislogboek. Herlaad de pagina om opslag te controleren. Exporteer/importeer een backup inclusief kaart, controleer de backup van alle campagnes en open de geëxporteerde Markdown, HTML en spelerskaart-PNG. Controleer dezelfde flows op de bestaande GitHub Pages-site na publicatie.
