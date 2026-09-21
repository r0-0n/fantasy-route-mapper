# Fantasy Route Mapper 1.2.0

Nieuwe functionaliteit volgens A.B.C: grote wijzigingen / nieuwe functionaliteit / bugfixes.

## Gebruik Fantasy Route Mapper

🌐 **[Online gebruiken](https://r0-0n.github.io/fantasy-route-mapper/)**\
Gebruik Fantasy Route Mapper direct in je browser.

💾 **[Downloaden voor lokaal gebruik](https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip)**\
Download de tool en gebruik hem lokaal, zonder installatie.

## Starten

Pak de hele ZIP uit en dubbelklik op `index.html`. Houd `css/` en `js/` naast dit bestand. Geen npm, frameworks, modules, installatie of server nodig. JavaScript en browseropslag moeten toegestaan zijn. Voor GitHub Pages upload je de inhoud van de uitgepakte map, inclusief beide submappen. Deze oplevering publiceert de online versie niet automatisch.

## Nieuw in 1.2.0

- Aangemaakte routes staan als overzicht in de zijbalk, vergelijkbaar met locaties. Klik op een naam om de route te selecteren en daaronder te bewerken. De actieve route is gemarkeerd.
- Met ‘Toon’ wordt de route zichtbaar gemaakt en gecentreerd op de kaart. Zonder kaart of routepunten is de knop uitgeschakeld.
- Zoeken, filteren en sorteren werken op het overzicht én de dropdown. De zoekopdracht blijft staan bij het kiezen uit het overzicht.
- De dropdown blijft beschikbaar onder ‘Snel kiezen via dropdown’ en toont alleen routenamen, met vertrek → aankomst als terugval als een naam ontbreekt. Geen status of afstand in de keuzelijst.
- Het overzicht toont eventueel vertrek → aankomst onder de naam; afstand en status blijven beschikbaar in de bestaande route-editor.

Alle verbeteringen uit 1.1.0, ontwikkelhulpmiddelen en dataformaten zijn behouden.

## Compatibiliteit

IndexedDB blijft `FantasyRouteMapper`, versie 1, store `campaigns`. `dataVersion`, `backupVersion` en migraties zijn ongewijzigd. Backupmomenten gebruiken aparte `frm-backup-request-…`-localStorage-sleutels; het campagneformaat verandert niet.

Browseropslag is gebonden aan browser/profiel en oorsprong. Bij verhuizen naar een ander domein, profiel of lokaal pad kan de beschikbare opslag verschillen. Exporteer dan vanuit de oude versie een volledige backup en importeer die in deze versie. De gewone campagne-export bevat geen kaart; volledige backups kunnen die wel bevatten.

## Structuur

- `index.html`: interface en vaste laadvolgorde van klassieke scripts.
- `css/app.css`: vormgeving.
- `js/app.js`: gedeelde state, versie en algemene interface.
- `js/storage.js`: IndexedDB, normalisatie, migraties en backupformaten.
- `js/map.js`: kaartweergave, schaal en kaartbediening.
- `js/routes.js`, `js/locations.js`: routes en locaties.
- `js/travel.js`, `js/harptos.js`: reisregistraties en kalender.
- `js/export.js`: importpreview, downloads, backupstatus en exports.
- `js/init.js`: eventregistratie en opstarten.
- `tests/verify.cjs`: optionele ontwikkeltests; niet nodig voor gebruik.

De scripts delen een globale scope. Behoud de volgorde in index.html. Geen `type="module"` of dynamische fetch-loader gebruiken voor lokaal starten.

## Controles en grenzen

Uitgevoerd: syntax van alle scripts, unieke DOM-ID's en statische selectorverwijzingen; gesimuleerde tests voor Harptos, geschatte versus expliciete dagen, nul dagen, ongeldige datums, importvalidatie, veilige weergave van campagnenamen, accepteren/annuleren van de preview, campagnegebonden backupstatus en kaartinstructies. Alle controles slagen.

Deze release is gebaseerd op de volledige 1.1.0-projectbundel. Aanvullend getest: routeoverzicht, veilige namen, selectie, lege routes, eenvoudige dropdownlabels, zoeken, lege resultaten, kaartcentrering en behoud van zoekopdracht.

Er is geen nieuwe echte browserkliktest uitgevoerd. In de eerdere controle blokkeerde de browserbeveiliging de lokale URL. Echte IndexedDB-persistentie, afbeeldingsweergave en PNG/downloadgedrag zijn in deze release dus niet opnieuw in een browser bevestigd. Test bij ingebruikname kaart laden, tekenen, reisregistratie opslaan, herladen en volledige backup exporteren/importeren. Controleer ook annuleren van import en spelerskaart-PNG.

Ontwikkeltests herhalen (Node.js alleen nodig voor de tests):

```sh
node tests/verify.cjs
```

## Ontwikkelafspraken en releasehulpmiddelen

Deze projectbundel bevat dezelfde appversie 1.2.0, aangevuld met ontwikkelhulpmiddelen. Deze release bevat het nieuwe routeoverzicht. `AGENTS.md` legt de afspraken voor menselijke en AI-bijdragers vast. `BROWSER_TESTS.md` bevat de nog uit te voeren echte browsercontrole.

Alleen voor ontwikkeling: gebruik Node.js 22 of hoger met npm. Er zijn geen externe pakketten nodig; `npm install` is niet nodig.

- `npm run check`: controleer versies, vaste README-links en lokale scriptverwijzingen.
- `npm test`: voer de bestaande gerichte regressietests uit.
- `npm run release`: voer beide controles uit en maak `dist/fantasy-route-mapper-v1.2.0.zip`.
- `npm run build`: dezelfde actie als release; er wordt geen code gecompileerd.

De ZIP bevat de app, documentatie, tests en releasehulpmiddelen. `dist/`, `node_modules/` en andere niet-geselecteerde bestanden worden niet opgenomen. Een bestaande ZIP wordt niet overschreven: verplaats die eerst. Bij ongewijzigde bronbestanden is de ZIP byte voor byte reproduceerbaar.
