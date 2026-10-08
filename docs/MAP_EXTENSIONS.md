# Kaartuitbreidingen 1.34.0

## Analyse en hergebruik

1. `state.kind === 'city'` bepaalt stadsmodus; ontbrekend betekent wereldkaart. Geen nieuw kaartmodel.
2. Gedeelde SVG-markers, `openLocationEditor`, zoeken, centreren en verplaatsen blijven bestaan.
3. `marker.type` en `CITY_TYPES` blijven de enige categorieën. Tijdelijk filter is een Set buiten `state`.
4. `marker.npcs` blijft de bestaande locatiegebonden lijst. Geen NPC’s toegevoegd aan wereldkaarten.
5. `scale.perPixel` en `scale.unit` vormen de bestaande kalibratie. Stadsafstanden rekenen miles exact om naar km (1,609344); dezelfde tweepuntskalibratie wordt zichtbaar voor steden.
6. Routes gebruiken `log.fromLocationId` / `toLocationId`. Nieuwe logboek-snapshots bewaren deze bestaande IDs ook directioneel, zodat een later gewijzigde route geen nieuwe bezoekgeschiedenis oplevert.
7. Het reislogboek blijft `sessions[].activities` gebruiken, met bewaarde reissnapshots; oude entries blijven ondersteund.
8. `routeHourSnapshot`, `routeHourPortion`, `calculateHourly`, `scheduleHourTravel`, `gameOrdinal` en `gameDateFromOrdinal` blijven de centrale wereldreisberekeningen. Alleen het aantal rustintervallen is als afgeleid resultaat toegevoegd.
9. IndexedDB, stores, databaseversie en save-gedrag zijn ongewijzigd. `cityWalk` bevat alleen `speedKmh` en `routeFactor` voor stadskaarten; veilige defaults zijn 5 en 1,3.
10. `projectData` en de bestaande JSON-/ZIP-backups behouden alle extra velden, partypositie, NPC’s en labels. Geen handmatige migratie, nieuwe database of nieuw backupformaat.

## Stadskaarten

- Kaart, schaal en looptijd: kalibreer de kaart en kies de afstandseenheid. Zonder schaal wordt geen looptijd verzonnen.
- Schatting: hemelsbrede afstand × routefactor / km per uur. Standaard 5 km/u, factor 1,3. Tot een uur wordt afgerond op minuten; vanaf een uur op vijf minuten.
- Tooltip: naam, bestaand type, eigenaar, maximaal 125 tekens notities en, alleen bij partypositie én geldige schaal, geschatte looptijd. Verdwijnen bij verlaten marker.
- Looptijd bij geopende locatie en tweepuntsmeting gebruiken dezelfde stadsberekening. Meten bewaart geen routes of punten in de kaartgegevens; Escape stopt de meetactie.
- Zoeken gebruikt naam, type, eigenaar en NPC-naam/rol. Verborgen locaties blijven vindbaar en bewerkbaar; zoeken zet hun opgeslagen zichtbaarheid niet aan.
- Typefilters veranderen alleen de actuele weergave. Ze worden niet opgeslagen of toegepast op een spelerskaart-export. Zoeken naar een gefilterd type heft dat tijdelijke typefilter op.
- `visible: false` houdt een locatie ook buiten de spelerskaart-export. Namen gebruiken het bestaande `labelMode`: `show`, `hide` en nu `hover`. Ontbrekende waarde blijft altijd zichtbaar. Mouseover-labels verschijnen niet in een statische PNG.
- Party en stadssnelheid wijzigen geen wereldreisregels. De bestaande partypositie wordt behouden, ontbrekend blijft niet ingesteld.

## Wereldkaarten

### Reisvooruitzicht

Bij de geselecteerde route staat een compact vooruitzicht. Het berekent de hele route als een standaard reisactiviteit, zonder extra tijd of handmatige afwijking. Het reisrooster komt uit het bestaande logboek; boten gebruiken dezelfde 24 uur als de logboekinvoer. Het vertrek is het einde van het huidige logboek, of het ingestelde beginmoment wanneer het logboek leeg is. Bij oude logboeken kan een bekende einddatum worden gebruikt.

Zonder een werkelijk ingesteld vertrek worden alleen afstand en actieve reisuren getoond. De interne fallback-datum van de editor wordt niet als vertrek gepresenteerd. Rust en aankomst zijn dan onbekend. Automatische rust omvat ook eventuele wachttijd vóór de volgende reisperiode, overeenkomstig het bestaande logboek. Een korte reis blijft overeenkomstig bestaand gedrag zonder automatische rust.

### Bezoekhistorie

Alleen betrouwbaar gekoppelde logboekreizen dragen bij aan het aantal. Een vertrek vanaf de laatste aankomstlocatie telt niet dubbel; verblijf en extra tijd veranderen de locatie niet. Een volgende reis naar dezelfde plek is een nieuw bezoek. Bij gedeeltelijke reizen telt alleen 0% als vertrek en 100% als aankomst.

Nieuwe snapshots bewaren begin-/eind-ID. Oudere snapshots met precies twee plaats-ID’s behouden hun bestaande volgorde. Een enkel ambigu plaats-ID wordt niet geraden. Oude sessies met één gekoppelde route gebruiken de bestaande endpointkoppeling; meerdere routes zonder betrouwbare tijdsvolgorde worden niet uit namen gereconstrueerd. Omgezette legacy-activiteiten met één gekoppelde route blijven bruikbaar.

Afgelegde routes zonder logboekmoment worden apart vermeld. Zonder chronologie is niet betrouwbaar vast te stellen hoeveel afzonderlijke bezoeken ze voorstellen. Geplande routes tellen nooit als bezoek. Ontbrekende historie wordt expliciet vermeld, niet als bewijs van nul werkelijke bezoeken gepresenteerd.

## Verificatie

`scripts/test.cjs` omvat de bestaande regressiesuites en `map-insights.cjs`. Die laatste controleert onder meer defaults, km/miles, ontbrekende party/schaal, party- en locatieverplaatsing, instellingen, zoeken, tijdelijke filters, verborgen locaties, labelstanden, tooltip tonen/verbergen, meten, JSON/ZIP, rust, kalenderovergangen en dezelfde aankomst in vooruitzicht/logboek. Ook worden bezoekdeduplicatie, gewijzigde routes na snapshot en modusscheiding gecontroleerd.

Dit zijn berekeningstests en tests met gesimuleerde DOM/opslag. Een echte browser- en visuele controle van lokale file://-pagina’s is door het browserbeleid niet beschikbaar. Zie BROWSER_TESTS.md voor de resterende handmatige controle.


## Kaartkoppelingen en NPC’s — 1.38.0

Wereldkaartmarker.linkedCityId verwijst naar een bestaande stadskaartrecord-id. Teruglinks worden afgeleid uit wereldkaartlocaties; er is geen tweede opgeslagen lijst. Volledige backups krijgen vooraf nieuwe record-id’s en passen interne linkedCityId-verwijzingen aan. Losse imports behouden de verwijzing; ontbrekende kaarten leveren een herstelbare selectie op. Kaarten blijven afzonderlijk opgeslagen en berekend.

NPC’s blijven in marker.npcs staan. Een vaste npc.id identificeert één NPC binnen een stadskaart. Na laden delen locaties met dezelfde id hetzelfde object; export bewaart per koppeling een volledige NPC voor compatibiliteit. Oude NPC’s zonder id krijgen eigen ids; namen zijn geen identiteit. ownerNpcId verwijst naar een gekoppelde NPC; owner blijft de leesbare naam voor oudere versies. Een bewerking werkt voor alle koppelingen. Ontkoppelen via de locatieselectie behoudt de NPC op andere geselecteerde locaties; verwijderen verwijdert alle koppelingen in de huidige stad.

cityDefaultLabelMode geldt voor nieuwe locaties. De schakelaar past tevens bestaande labelMode-waarden aan. Individuele labelstanden blijven mogelijk. Nieuwe subcategorieën gebruiken de bestaande hoofdgroep-iconen; geen extra beeldbestanden.
