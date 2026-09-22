# Fantasy Route Mapper 1.11.2

## Nieuw in 1.11.2

Logo, favicon, locatie-iconen en party-icoon staan als originele PNG-bestanden in assets/. HTML en JavaScript bevatten geen ingebedde afbeeldingen meer. Pak altijd de hele ZIP uit en houd de mappen bij elkaar.

Bij lokaal file://-gebruik kan de browser afbeeldingen tonen maar PNG-export beschermen. Het exportvenster vraagt in dat geval om de meegeleverde assets-map te selecteren; daarna worden die bestanden voor de export gebruikt. Dat hoeft eenmaal per geopende app en vereist geen server of installatie. Online gebruik laadt de afbeeldingen rechtstreeks.


## Nieuw in 1.11.2

- Campagnemenu opent via het logo links; de losse Campagne-knop vervalt. Logo/menu en campagnenaam verdwijnen op Mijn campagnes.
- Volledige backup importeren gebruikt dezelfde knopstijl en hoogte als de knoppen ernaast.


## Nieuw in 1.11.2

- Inn en Village zijn samengevoegd tot Village / Inn, met het Village-icoon. Bestaande locaties worden bij laden/import behouden en omgezet.
- Tien vaste routekleuren. De laatste expliciete kleurkeuze blijft per campagne bewaard voor nieuwe routes; bestaande routekleuren blijven behouden.
- Campagne-instellingen: schakel achtergrond, selectierand en kort oplichten van locatie-iconen samen in of uit. De export volgt de achtergrondinstelling.
- Locaties hebben een aparte zichtbaarheidsschakelaar, naast naamweergave. Toon op kaart maakt een verborgen locatie weer zichtbaar.
- Export is vereenvoudigd: alleen uitsnede, twee sliders en het voorbeeld. Zichtbare routes en locaties worden geëxporteerd; verborgen locatienamen blijven verborgen. De geplaatste party blijft meegenomen.
- Automatische en gesimuleerde canvascontroles slagen; visuele browsercontrole staat nog open.


## Eerder in 1.10.0

- Locatie-iconen op de kaart hebben een donker rond vlak en lichte rand; selectie is goud. Toon op kaart licht de locatie kort op (zonder animatie bij verminderde beweging).
- De browsertitel volgt de campagnenaam, ook na hernoemen. Het aangeleverde logo wordt als favicon en in de appkop gebruikt; het is ingebed voor lokaal gebruik.
- Party-selectie toont een zelfstandig overzicht zonder actieve Locaties- of Routes-tab. Een tab aanklikken keert terug naar die sidebar.
- Spelerskaart-export heeft een automatisch bijgewerkt voorbeeld met onafhankelijke sliders voor tekst- en icoongrootte. De grootte is relatief aan de uitsnede (basis: 1600 pixels breed), zodat ook een grote kaart leesbare symbolen krijgt. Preview en download gebruiken dezelfde gerenderde kaart. PNG exporteren is pas beschikbaar als het actuele voorbeeld gereed is.
- Automatische regressietests en gesimuleerde canvas/bedieningstests slagen. Visuele controle in een echte browser en echte PNG-download zijn nog niet uitgevoerd.


## Eerder in 1.9.0

- Sessie-invoer: nummer, speeldatum (datumkiezer, standaard vandaag), titel, route en verstreken tijd. Notities en bezochte plaatsen zijn niet meer zichtbaar in het invoervenster; bestaande gegevens blijven opgeslagen.
- Routekeuze vult de geschatte reistijd in op twee decimalen. Deze is daarna vrij aanpasbaar; halve dagen zijn mogelijk.
- Bereken dagen uit begin/einde, of bereken het einde uit begin/dagen. Dagdelen maken halve dagen zichtbaar.
- Campagne-instellingen bieden Harptos en Gregoriaans. Nieuwe registraties volgen de keuze; bestaande registraties behouden hun kalender. Datumfilters werken in de gekozen campagnekalender; zonder datumfilter zijn alle registraties zichtbaar. Bij gemengde kalenders wordt op kalender en daarna datum gesorteerd.
- Selecteer het party-icoon voor dagen en afstand uit het volledige logboek, onafhankelijk van logboekfilters. Sleep om te verplaatsen; Escape of afgebroken aanraking herstelt de oorspronkelijke positie. Verplaatsen van het icoon verandert de logboektotalen niet.
- Vervoermiddel staat boven Begin en einde. Lopend is de standaard. Wijzigen van vervoermiddel of tempo berekent de snelheid; bestaande opgeslagen snelheden worden bij het laden behouden.
- Lopend, paard en wagen gebruiken 18/24/30 mijl per dag voor Slow/Normal/Fast. Boot gebruikt als uitgangspunt een zeilschip: 2 mijl/uur, 24 uur per dag (48 mijl), zonder tempo-effect. Vliegend gebruikt 60 ft snelheid en 8 uur per dag als uitgangspunt (48 mijl bij Normal). Dit zijn expliciete uitgangspunten; pas de dagsnelheid aan voor een ander vaartuig, vliegvermogen of reisduur. Zie [D&D reisregels](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/adventuring), [voertuigen](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment) en [speciale reissnelheden](https://www.dndbeyond.com/sources/dnd/br-2024/dms-toolbox).
- Spelerskaart gebruikt standaard een uitsnede met marge rond geselecteerde routes die Afgelegd zijn of in het logboek voorkomen. Zonder zulke routes wordt de hele kaart gebruikt. Vink de uitsnede uit voor een volledige kaart. Alleen het gebied binnen de uitsnede verschijnt op de PNG.

Automatische controles en gesimuleerde bedieningstests slagen. Echte browserbediening, visuele weergave, native datumkiezer, IndexedDB en PNG-download zijn in deze release niet in een browser gecontroleerd.


Routes en locaties krijgen tabeloverzichten zoals het reislogboek. De zijbalk is voor de details van de geselecteerde route of locatie.

## Gebruik Fantasy Route Mapper

🌐 **[Online gebruiken](https://r0-0n.github.io/fantasy-route-mapper/)**\
Gebruik Fantasy Route Mapper direct in je browser.

💾 **[Downloaden voor lokaal gebruik](https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip)**\
Download de tool en gebruik hem lokaal, zonder installatie.

## Starten

Pak de volledige ZIP uit en open `index.html`. Houd de mappen `css/` en `js/` erbij. Geen installatie, npm, framework of server nodig voor de app. JavaScript en lokale browseropslag moeten toegestaan zijn. Bij publicatie op GitHub Pages upload je de inhoud van de map inclusief submappen. Deze oplevering publiceert niets automatisch.

## Aangepast in 1.11.2

De locatiezijbalk volgt dezelfde indeling en styling als Routes: kop met totaal, overzichtsknop, goudkleurige Nieuw-knop, scheidingslijn en een gelijkvormige melding bij geen selectie. De bestaande selectie- en opslagwerking is behouden. De bestaande automatische controles zijn opnieuw uitgevoerd; visuele browsercontrole staat nog open.

## Behouden uit 1.7.0

Routes en locaties gebruiken dezelfde selectiewerking. Met ‘Selectie wissen’ kun je de actieve route of locatie deselecteren zonder die te verwijderen. Een locatie selecteren wist de routeselectie; een route selecteren wist de locatieselectie. Zonder selectie toont de betreffende zijbalk Nieuw en Overzicht met een korte aanwijzing. De zijbalk toont dan alleen Nieuwe route, Routeoverzicht openen en een korte aanwijzing. De routevelden en bewerkpunten zijn verborgen; de routes zelf blijven zichtbaar op de kaart. Tekenen/invoegen stopt bij deselecteren.

Een lege selectie blijft behouden bij herladen/importeren. Na verwijderen van de geselecteerde route wordt niet automatisch een andere gekozen. Een bestaande geldige selectie blijft behouden. Klik op een routelijn, kies via het overzicht of maak een nieuwe route om weer details te tonen.

De integratiecontrole bevestigt behoud van routegegevens, verbergen van de editor, stoppen van de bewerkmodus, lege selectie na normalisatie/export-import en opnieuw selecteren. De echte browsercontrole staat nog open.

## Aangepast in 1.11.2

De tabs Locaties en Routes wisselen alleen de inhoud van de zijbalk, zonder automatisch een overzicht te openen. Elke zijbalk houdt de knop Nieuwe locatie/route en de aparte overzichtsknop. Bestaande geselecteerde details blijven beschikbaar. Logboek behoudt zijn bestaande werking. Het rondje vóór Punt invoegen is verwijderd; de aan/uit-modus en actieve knopstijl blijven behouden.

Getest met de daadwerkelijke tab- en overzichtshandlers tegen een gesimuleerde DOM: juiste zijbalk actief, overzichten gesloten bij tabwisselen, openen via de aparte knoppen. De visuele browsercontrole staat nog open.

## Behouden uit 1.6.1

Routes en locaties gebruiken dezelfde overzichtsindeling: Nieuwe route/locatie en Sluiten rechtsboven, een zoekveld met wisknop en direct zichtbare sortering en filters. Bij locaties staat de naamcheckbox direct onder de naam. Regio en eigenaar/factie zijn uit de editor en tabel verwijderd, inclusief sorteren op regio. Bestaande opgeslagen regio-/factiewaarden blijven behouden bij bewerken en in backups.

Locatie opslaan en Sluiten zijn uit de locatiezijbalk verwijderd. Alle bewerkbare velden blijven via hun bestaande invoerhandlers automatisch opslaan. Die werking en behoud van bestaande metadata zijn in de integratietests gecontroleerd. Dit is een interfacecorrectie zonder wijziging van het dataformaat.

## Behouden uit 1.6.0

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
- `npm run release` (of `npm run build`): dezelfde controles, daarna `dist/fantasy-route-mapper-v1.11.2.zip`. Geen compilatie. Een bestaande ZIP wordt niet overschreven.

Zonder npm kun je dezelfde controles uitvoeren met `node scripts/check.cjs`, `node tests/verify.cjs` en `node tests/flows.cjs`; `node scripts/release.cjs` voert ze alle drie uit en maakt de ZIP.

## Uitgevoerde controles

Geslaagd: syntax, versies, links, DOM-ID’s/selectoren en bestaande regressies. Aanvullend gesimuleerd met de echte handlers: selecteren zonder extra punt, meerdere invoegingen met een ingeschakelde knop, uitschakelen van de modus, route-aanmaak zonder extra keuzelijst, schaalactie vanuit het campagnevenster en compatibiliteit van de naamcheckbox. De HTML-structuur en ZIP zijn gecontroleerd.

Er is geen echte visuele browser- of IndexedDB-persistentietest uitgevoerd. Die toegang was eerder geblokkeerd. Zie BROWSER_TESTS.md voor de resterende praktische controles.
