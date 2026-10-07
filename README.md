# Fantasy Route Mapper 1.34.0

Een lokale kaart- en reisplanner voor fantasycampagnes en steden, zonder externe runtime-afhankelijkheden.

## Gebruik Fantasy Route Mapper

- Online: https://r0-0n.github.io/fantasy-route-mapper/
- Download: https://github.com/r0-0n/fantasy-route-mapper/archive/refs/heads/main.zip
- Lokaal: pak de volledige appmap uit en open `index.html`. Houd `assets`, `css` en `js` erbij.

## Nieuw in 1.34.0

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
