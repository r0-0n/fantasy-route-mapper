# Fantasy Route Mapper 1.40.0

Een lokale kaart- en reisplanner voor fantasycampagnes en steden, zonder externe runtime-afhankelijkheden.

## Gebruik Fantasy Route Mapper

- Online: https://r0-0n.github.io/fantasy-route-mapper/
- Download: https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip
- Lokaal: pak de volledige appmap uit en open `index.html`. Houd `assets`, `css` en `js` erbij.

## Nieuw in 1.40.0

- Extra stadsmarkers zijn direct versleepbaar. Klik om alleen de naam te wijzigen of de marker te verwijderen. Ze verschijnen niet in locatie-/NPC-overzichten of locatiezoekresultaten; bestaande extra markers krijgen hetzelfde gedrag en blijven opgeslagen.
- Schaal instellen accepteert feet, miles en kilometers voor de bekende afstand. Feet worden intern omgerekend naar de bestaande kaarteenheid, zodat reisberekeningen compatibel blijven.
- Centrale locatienaamweergave staat bij de kaartinstellingen linksboven, met dezelfde standaard voor nieuwe locaties.
- Kaartnamen gebruiken Palatino/Georgia met een serif-terugval, ook in exports.
- De party gebruikt een rode punaise. Het uiteinde van de naald staat op de exacte positie.
- Meer ruimte rond Schaal instellen.

## Toegevoegd in 1.39.1

- Party is een compacte rode stip (24 schermpixels), met lichte en donkere contrastrand, op stad en wereldkaart.
- Party plaatsen/verplaatsen staat rechtstreeks in de stadszijbalk. Extra marker en Party hebben dezelfde breedte en uitlijning als Nieuwe locatie.
- Locatietypefilters staan in één uitgelijnde kolom.
- Centrale locatienaamweergave staat zichtbaar in de Locaties-zijbalk, op beide kaarttypen. De schakelaar past bestaande namen aan en bewaart de standaard voor nieuwe locaties. Individuele aanpassingen blijven mogelijk.
- Extra persoonsmarkers krijgen een persoonssymbool en tijdelijke plekken een vlag, in dezelfde groen/gouden stijl als de locatie-iconen.

## Toegevoegd in 1.39.0

Extra marker op stadskaarten gebruikt de bestaande plaatsingsbediening, opslag, notities, zichtbaarheid en verplaatsknop. Kies NPC/persoon of tijdelijke plek. Dit zijn losse kaartmarkers, geen NPC-profielen of campagnelagen. Ze blijven bewaard totdat je ze verwijdert en worden meegenomen in backups. Als meerdere wereldkaarten dezelfde stadskaart gebruiken, zien zij dezelfde extra markers.

## Overige verbeteringen

- Extra NPC-locatiekoppelingen hebben weer leesbare namen naast compacte aankruisvakjes. De algemene formulierstijl rekte de checkbox over de hele regel uit.
- De party gebruikt een compact groepssymbool met gouden rand, donkere achtergrond en lichte buitenrand. Op de kaart is het icoon 32 schermpixels in plaats van 48. Hetzelfde symbool wordt gebruikt in spelerskaart-exports; plaatsen en slepen blijven werken.

## Toegevoegd in 1.38.0

- Wereldkaartlocaties kunnen een bestaande stadskaart koppelen en openen. Op de stadskaart verschijnt Terug naar wereldkaart. Meerdere wereldkaartlocaties mogen dezelfde stad openen; de terugkeuze toont de gekoppelde locaties.
- Een volledige JSON-/ZIP-backup herstelt koppelingen tussen de meegeleverde kaarten naar de nieuwe exemplaren. Een losse export bevat alleen die kaart: ontbrekende koppelingen kunnen opnieuw worden gekozen.
- Stadstypefilters hebben één knop voor alles tonen/verbergen.
- Stadsinstellingen kunnen alle locatienamen tonen/verbergen én die keuze als standaard voor nieuwe locaties bewaren. Individueel afwijken blijft mogelijk.
- NPC’s kunnen bij meerdere locaties in dezelfde stad horen. Koppel een bestaande NPC vanuit een locatie of vink extra locaties aan bij de NPC. Eén wijziging werkt door bij alle koppelingen; verwijderen verwijdert de NPC overal in deze stad. Gelijknamige bestaande NPC’s worden niet automatisch samengevoegd.
- Eigenaar/beheerder is een keuze uit de gekoppelde NPC’s. Bestaande vrije tekst blijft als bestaande keuze bewaard.
- Het locatieoverzicht toont gekoppelde NPC’s; het NPC-overzicht toont alle gekoppelde locaties. De zijbalk toont alleen zoekresultaten na invoer, maximaal acht tegelijk; het overzicht blijft beschikbaar voor de complete lijst.
- Toegevoegd: woontoren, tovenaarstoren, boerderij en boomgaard. Shrine heet Heiligdom en bestond al. De 12 hoofdcategorie-iconen blijven gelijk.
- De dubbele knop Reis plannen in het terreinmenu is weggehaald.

Controle: automatische tests inclusief gedeelde NPC-identiteit, eigenaar, verwijderen, 100-NPC-zoeklijst, naamstandaarden en het opnieuw koppelen bij JSON-/ZIP-herstel. Deze tests gebruiken een gesimuleerde DOM en opslag; visuele browsercontrole en echte IndexedDB zijn niet uitgevoerd.

## Toegevoegd in 1.37.1

Stadslocaties gebruiken één symbool per hoofdcategorie (12 iconen). Subcategorieën blijven behouden en delen het symbool van hun hoofdgroep. Overbodige oude stads- en subcategorie-iconen zijn uit deze release verwijderd. Ook kaartweergave, overzichten, offlinegebruik en spelerskaart-export gebruiken de gedeelde iconen.

## Toegevoegd in 1.37.0

- Updates worden automatisch gecontroleerd bij openen, terugkeren, opnieuw online komen en iedere 15 minuten. Alleen een beschikbare update toont de knop naast App installeren.
- Wereldkaartlocaties hebben hoofd- en subcategorieën. Bestaande typen blijven bewaard; categorieën veranderen geen terreinberekening en voegen geen NPC-beheer toe.
- Ingevulde categorieën staan ingeklapt en blijven via de samenvatting te wijzigen. Overig/lege categorieën staan open.
- Looptijd meten is uit de stadssidebar gehaald; de schatting vanaf de party blijft beschikbaar.
- Reislogboektotalen gebruiken weken, dagen en uren (Harptos: 10 dagen per week, anders 7). Periodefilter verwijderd; standaard sorteren op speeldatum, nieuwste bovenaan.

## Toegevoegd in 1.36.0

Naast App installeren staat Controleren op updates. Een klaargezette website-update verandert de knop in Nieuwe versie — Bijwerken. Eerst worden wijzigingen opgeslagen; alleen na succesvol opslaan wordt de nieuwe versie geactiveerd en de pagina herladen. Andere open FRM-vensters moeten eerst gesloten worden. Campagnes en kaartafbeeldingen worden niet gewist.

Upload de hele release (inclusief sw.js) naar dezelfde website-adreslocatie. Voor de eerste overgang vanaf een oudere versie: open de website online en sluit daarna alle FRM-vensters, zodat de nieuwe versie kan activeren. Vanaf deze versie is de knop beschikbaar. Sitegegevens wissen is niet nodig. Lokaal geopende HTML-bestanden moeten uit de nieuwe download worden geopend.

## Toegevoegd in 1.35.0

Stadslocaties hebben nu een hoofd- en subcategorie, op basis van 12 hoofdgroepen en 71 typen inclusief Overig per groep. Iedere subcategorie heeft een eigen lokaal SVG-symbool in de bestaande groen/gouden stijl. Deze symbolen worden gebruikt op de kaart, in het locatieoverzicht en in spelerskaart-export. Namen blijven Nederlands.

- Categorie selecteren toont de bijbehorende subcategorieën; een nieuwe hoofdgroep begint bij Overig.
- Tijdelijke kaartfilters gebruiken de hoofdgroepen. Zoeken werkt op hoofdgroep, subcategorie en de bestaande locatie-/NPC-velden.
- Het bestaande `marker.type` blijft de opgeslagen classificatie; de hoofdgroep wordt hiervan afgeleid.
- Oude stadscategorieën worden automatisch passend ondergebracht. NPC’s, notities, zichtbaarheid, labels en positie blijven behouden. Wereldkaarten wijzigen niet.
- [Volledige indeling](docs/CITY_CATEGORIES.md).

## Toegevoegd in 1.34.0

**Stadskaarten:** compacte locatie-tooltips, tijdelijke filters op bestaande categorieën, zoeken op locatietype en gekoppelde NPC’s, drie naamstanden en geschatte looptijd vanaf de party. De bestaande zichtbaarheid en partypositie blijven behouden. Kaartschaal is nu ook in stadsinstellingen beschikbaar. Loopsnelheid (5 km/u) en routefactor (1,3) zijn per stad instelbaar. Met twee punten kun je ook een looptijd schatten, zonder routes of straten te tekenen.

**Wereldkaarten:** afgeleide bezoekhistorie bij locaties en een reisvooruitzicht bij de geselecteerde route. Het vooruitzicht gebruikt dezelfde reisuren, rust en kalenderberekening als het reislogboek. Zonder ingesteld vertrek worden rust en aankomst niet ingevuld. Onvoldoende gekoppelde bezoekhistorie wordt niet geraden.

Opslag, oude campagnes en JSON-/ZIP-backups blijven compatibel. Zie [analyse, gedrag en grenzen](docs/MAP_EXTENSIONS.md).

## Toegevoegd in 1.33.0

- Eigen tabblad NPC’s naast Locaties in steden, met personenicoon, zoeken, overzicht en toevoegen.
- Eén NPC tegelijk bewerken in de sidebar. Bij een locatie staan compacte klikbare naamregels in een begrensde lijst.
- NPC verwijderen via een duidelijke knop, met bevestiging. De locatie en andere NPC’s blijven behouden.
- Deselecteren staat bij de geselecteerde locatie, naast de titel.
- Bestaande NPC’s blijven op dezelfde manier opgeslagen en meegenomen in backups.

## Toegevoegd in 1.32.0

- Startpagina met twee compacte groepen: nieuwe kaarten en bestanden.
- Meer ruimte tussen velden en knoppen in dialoogvensters; duidelijk instellingenicoon naast de stadsnaam.
- Eén veld Notities per locatie. Bestaande omschrijving en DM-notities worden samen getoond en bij opslaan samengevoegd zonder tekstverlies.
- Doorzoekbaar NPC-overzicht naast Locatieoverzicht in stadsmodus. NPC’s toevoegen, bewerken en naar een andere locatie verplaatsen; wijzigingen verschijnen ook bij de locatie.
- NPC’s blijven onderdeel van de locatie en worden in bestaande JSON-/ZIP-backups meegenomen.

## Toegevoegd in 1.31.0

- **Mijn kaarten** bevat campagnes en steden, met aparte aanmaakknoppen en herkenbare labels.
- Stadsmodus met twaalf categorieën en eigen iconen, locaties zoeken, verplaatsen en bewerken.
- Per stadslocatie: omschrijving, eigenaar/beheerder, meerdere NPC’s met naam/rol/opmerking en DM-notities.
- Naam en locatie-icoon apart zichtbaar maken; spelerskaart respecteert deze keuzes en bevat geen DM-informatie.
- Party plaatsen/slepen en spelerskaart met preview en instelbare tekst-/icoongrootte.
- Steden hebben geen route-, terrein- of reislogboekinterface. Klik op de stadsnaam voor stadsinstellingen.
- Stad en locatiegegevens blijven behouden in JSON-export, volledige backup, dupliceren en opnieuw openen. Volledige backup bevat ook kaartafbeeldingen.

## Huidige functies

- Campagnes met een eigen kaart, schaal, locaties en party-icoon.
- Routes tekenen of via ingetekende landwegen en vaarroutes plannen.
- Terrein inkleuren; handmatige snelheid of D&D 2014/2024-reisberekening.
- Doorlopende snelheidskleuren: Slow rood, Normal goud, Fast groen.
- Reislogboek met activiteiten per sessie, gedeeltelijke routes, hele uren en in-game begin/einddatums.
- Activiteiten invoeren via duur of eindtijd. Latere sessies schuiven bij wijzigingen mee.
- Reizen binnen één ingestelde reisdag krijgen geen automatische rust. Langere reizen gebruiken het rooster. Een handmatig opgegeven eindtijd telt als werkelijke reisduur zonder automatische rust.
- Spelerskaart als PNG en reislogboek als HTML of Markdown exporteren.

## Opslag en backups

De app bewaart campagnes, steden en kaarten in de browser op dit apparaat. Een campagne-export bevat JSON zonder kaartafbeelding. **Volledige Backup** bewaart alle campagnes, steden en kaartafbeeldingen samen in een ZIP. Oude JSON-backups blijven importeerbaar. Google Drive-synchronisatie is niet toegevoegd.

Oude logboekregistraties houden hun totale duur; onbekende reis/rustverdeling wordt niet verzonnen. Oorspronkelijke gegevens blijven bij omzetting intern bewaard.

## Installatie en offline

De volledige app kan vanaf een vaste HTTPS-locatie als webapp worden aangeboden. De installatieknop geeft browserafhankelijke hulp. Offline gebruik vereist een geslaagde eerste installatie van de appcache. Updates worden actief nadat oude appvensters gesloten zijn. Dit is niet in een echte gehoste installatie geverifieerd.

## Ontwikkelen en controleren

Vanilla HTML, CSS en elf klassieke scripts. Node.js 22 of hoger is alleen nodig voor de ontwikkelcontroles:

- `npm run check`: versies, lokale bestanden en JavaScript-syntaxis.
- `npm test`: alle regressiesuites via één centrale lijst.
- `npm run release`: controles en tests uitvoeren en een nieuwe ZIP maken; bestaande ZIPs worden niet overschreven.

De tests gebruiken testgegevens en deels een gesimuleerde browseromgeving. Ze bewijzen geen echte IndexedDB-, download- of visuele browserwerking. Zie [browserchecklist](BROWSER_TESTS.md).

## Code-indeling

- `app.js` en `init.js`: gedeelde appstatus en bediening.
- `storage.js`: opslag, importvalidatie en gegevenscompatibiliteit.
- `map.js`, `locations.js`, `routes.js`: kaart en objecten.
- `road-routing.js`, `terrain.js`: wegplanning en reisberekeningen.
- `travel.js`, `harptos.js`: logboek, tijdlijn en kalender.
- `export.js`: backups en spelersexports.

## Opschoning 1.30.1

Vijf ongebruikte functies en een dubbele tekencontrole verwijderd. Uurkeuzes gebruiken één helper; test- en releaseruns delen dezelfde testlijst. De werking, gegevensformaten en bestaande compatibiliteitscode zijn behouden. Geen volledige herbouw of verwijdering van de oude sessie-invoer: die heeft nog koppelingen met de kalender en regressietests.

Zie [projectafspraken](AGENTS.md), [regelcontrole](RULES_AUDIT.md) en [historische ontwikkelnotities](docs/HISTORICAL_NOTES.md). De historische notities bevatten achterhaalde tussenstanden; deze README beschrijft de huidige versie.
