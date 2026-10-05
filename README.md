# Fantasy Route Mapper 1.28.2

## Nieuw in 1.28.2 — doorlopende snelheidskleuren

De snelheidsweergave en legenda gebruiken een doorlopende rood-goud-groene schaal: 18 mijl/dag (Slow) rood, 24 (Normal) goud, 30 (Fast) groen. Tussenliggende snelheden mengen de kleuren; lagere/hogere snelheden blijven rood/groen en onbekende snelheid is grijs. Kilometerweergave gebruikt dezelfde fysieke snelheden. Routestukken met een gelijk tempo houden dezelfde kleur; de berekening wordt niet veranderd of visueel afgevlakt.


## Correctie 1.28.1 — landwegen zonder terreinkleur

Een ingetekende landweg telt nu voor D&D 2024 ook wanneer er geen terrein onder is ingekleurd. Automatisch/Fast gebruikt daar 30 mijl per dag, met behoud van een gekozen lagere tempo-begrenzing en de groepsbeperking. Buiten een ingetekende weg of bekend terrein blijft de handmatige dagsnelheid gelden. Water behoudt zijn ingestelde dagsnelheid. Bestaande routes worden niet automatisch op Automatisch gezet.


## Nieuw in 1.28.0 — automatisch terreintempo

D&D 2024 heeft de optie Automatisch — maximaal terreintempo. De berekening gebruikt per routestuk het terreinmaximum inclusief wegvoordeel, met behoud van de Arctic-uitrusting- en groepssnelheidsbeperking. Onbekend terrein blijft de handmatige dagsnelheid gebruiken; boot/vliegen/wagen behouden hun bestaande 2024-berekening. Slow, Normal en Fast blijven bewuste tempo-begrenzingen.

Nieuwe 2024-routes en omschakelen naar de 2024-berekening kiezen Automatisch. Bestaande routes behouden hun keuze; selecteer Automatisch om die aan te passen. D&D 2014 houdt Slow/Normal/Fast. Eerder opgeslagen logboekactiviteiten behouden hun reissnapshot.


## Nieuw in 1.27.0 — wegen aansluiten, grot en kamp

- Vaarroutes zijn doorgetrokken blauw, met dezelfde lijnopmaak als landwegen.
- Handmatig tekenen en punten aanpassen staan in een uitklapbaar paneel. Bij een actieve tekenactie gaat het paneel open; de bestaande stoppen-knop blijft beschikbaar.
- Grot en Kamp zijn locatiecategorieën met eigen lokale SVG-iconen. Ze werken in kaart, spelerskaart, backups en offline cache.
- Nieuwe routes tussen landlocaties sluiten ook buiten het wegennet aan. De planner vergelijkt de dichtstbijzijnde projectie op maximaal twaalf wegstreken per locatie. Verbindingsstukken buiten de weg krijgen viervoudige planningskosten om wegen te verkiezen. Die factor geldt alleen voor routekeuze, nooit voor de getoonde afstand of reistijd.
- Bij een ingeschakelde D&D-terreinberekening weegt de berekende reistijd mee in de wegkeuze. Bij handmatige snelheid telt afstand. Verbindingsstukken zijn recht; er is geen terreinraster-padzoeker of automatische herkenning van water, muren of kliffen op de kaartafbeelding.
- Bestaande landroutes kunnen via Route via wegen herberekenen worden aangepast na bevestiging. Eerdere logboekberekeningen blijven bewaard. Boot en vliegen behouden hun eigen gedrag.

Automatische regressiecontroles en gerichte tests voor aansluitingen, terreinkosten en iconen geslaagd. Geen echte visuele browsercontrole uitgevoerd.


## Nieuw in 1.26.0 — speelsessies met doorlopende urentijdlijn

Het reislogboek groepeert activiteiten per speelsessie: reizen, verblijf/rust en extra tijd. Kies één beginmoment met een 24-uursklok. Sessienummers bepalen de volgorde; een gewijzigde duur, verwijderde sessie of gewijzigd beginmoment rekent alle volgende momenten opnieuw uit. Speeldatums veranderen niet.

- Routes worden als afstandspercentage geregistreerd. De volgende registratie stelt het resterende deel voor. Overlap binnen dezelfde tocht wordt geweigerd; een nieuwe tocht maakt herhaald reizen mogelijk.
- De routeberekening wordt vastgelegd bij het toevoegen. Latere kaart- of routewijzigingen herschrijven die geschiedenis niet. Reistijd voor delen volgt de terreinsegmenten, niet alleen het afstandspercentage. Afronding gebruikt cumulatieve uren om afrondingsverlies tussen aansluitende delen te voorkomen.
- Dagsnelheden zijn gebaseerd op acht actieve uren voor land/vliegen, 24 voor boot. Het gekozen reisrooster verdeelt actieve uren over dagen; tijd buiten dat rooster wordt expliciet als automatische rust meegerekend. Een 24-uursrooster heeft geen automatische rust. Er wordt geen verplichte rust ná de laatste reis toegevoegd.
- Werkelijke reisuren kunnen de schatting vervangen. Extra tijd/marge telt als niet-reistijd na het routedeel; splits de route voor oponthoud onderweg. Uren zijn gehele getallen; dagen zijn 24 verstreken uren.
- Oude registraties worden bij de eerste opslag van een sessie omgezet naar blokken met onbekende verdeling. Hun totale duur wordt afgerond naar uren, afstand blijft behouden en de oorspronkelijke registratie blijft onder legacyOriginal bewaard. De nieuwe tijdlijn sluit zonder oude datumgaten aan vanaf het gekozen beginmoment. Er wordt geen reis/rustverdeling verzonnen. Oude gekoppelde routes tellen als volledig geregistreerd in tocht 1.
- HTML/Markdown exports bevatten sessies en activiteiten met uren en datums. Campagne-JSON en volledige ZIP-backups bewaren de instellingen en routeberekeningen.

Automatische berekenings-, import- en gesimuleerde bedieningstests uitgevoerd. Geen visuele controle in een echte browser.


## Nieuw in 1.25.0 — consistente menuacties

Het pijltje bij Importeren is verwijderd. Opslag beheren gebruikt dezelfde driepuntsknop als de campagnekaarten, met tooltip en toegankelijk label.

## Nieuw in 1.25.0 — installeren naast het logo

App installeren staat linksboven naast het logo op het campagneoverzicht, op dezelfde plek als de campagnenaam bij een geopende kaart.

## Nieuw in 1.25.0 — rustiger campagneoverzicht

Nieuwe campagne, Volledige Backup en Importeren vormen één actierij. Installeren staat compact bovenaan. Elke campagne heeft Openen en een contextmenu voor export, dupliceren en verwijderen. Dubbele backupacties zijn verborgen; lokale opslag wissen staat onder Opslag beheren.

## Nieuw in 1.25.0 — installeren, backups en bediening

Installatieknop bovenaan het campagneoverzicht. Chrome/Edge gebruiken de beschikbare browserprompt, Safari toont installatie-instructies. Alleen HTTPS, niet file://. Volledige Backup bewaart alle campagnes en kaarten als ZIP: campaigns.json plus losse kaartbestanden. Oude JSON-backups blijven importeerbaar; ZIP-import verwacht originele FRM STORE-archieven. Campagne exporteren staat op elke campagnekaart en bevat geen afbeelding.

Tekenen heeft een vaste status en Stoppen-knop. Routes zijn doorgetrokken en routekleuren hebben gekleurde knoppen. Locaties hebben een zoekveld en één notitieveld; oude omschrijving en notities worden samen weergegeven en bij bewerken samen opgeslagen. Faerûn: officiële bron openen, Med Resolution downloaden en vervolgens de lokale afbeelding kiezen bij Kaart en Schaal. Geen externe kaart wordt gebundeld.

Installatie/offline nog niet op echte HTTPS-host getest.

## Nieuw in 1.25.0 — installeerbare webapp

Publiceer de volledige map op een vaste HTTPS-URL. Chrome/Edge: App installeren of het browsermenu. Safari op Mac: Archief → Voeg toe aan Dock (macOS Sonoma of nieuwer). iPhone/iPad: Deel → Zet op beginscherm. De knop op het campagneoverzicht geeft zo nodig instructies.

Na een geslaagde eerste online laadbeurt bewaart de service worker de appbestanden voor offline gebruik. Campagnes en geïmporteerde kaarten blijven in IndexedDB. Installeren biedt geen synchronisatie: lokale bestanden, andere domeinen en Safari-webapps kunnen aparte opslag hebben; exporteer en importeer dan een volledige backup. Offline is pas voorbereid na voltooiing van de cache-installatie.

Updates worden op de achtergrond opgehaald en actief nadat alle oude FRM-vensters gesloten zijn. Er wordt niet automatisch herladen tijdens bewerken. Gebruik voor updates dezelfde hostingmap en URL. Service worker caches zijn gescheiden per map. Bij file:// wordt geen service worker geregistreerd. Browserinstallatie en offline herstart zijn niet op een echte HTTPS-host getest.

## Nieuw in 1.25.0 — gecontroleerde reisregels 2014 en 2024

D&D 2014 is toegevoegd naast 2024 en handmatige snelheid. Kies voor 2014 zelf de moeilijke terreintypen in Campagneregels. Voor 2024 is een langzamer groepslid instelbaar. Zie [regelcontrole](RULES_AUDIT.md) voor officiële bronnen, gecontroleerde werking en modelbeperkingen.

## Nieuw in 1.25.0 — Campagneregels

Tijd en Agenda heet nu Campagneregels, in het menu en het instellingenvenster. Kalender en standaard reistijdberekening blijven op dezelfde plek.

## Nieuw in 1.25.0 — standaard reistijdberekening per campagne

Onder Campagne Instellingen → Campagneregels kies je de berekening voor nieuwe routes: handmatige dagsnelheid (systeemonafhankelijk) of D&D 2024-terreinberekening. Handmatig blijft de standaard voor campagnes zonder voorkeur. Bestaande routes veranderen niet; per route blijft een afwijkende keuze mogelijk. De campagnevoorkeur gaat mee in opslag, exports en backups.

## Nieuw in 1.25.0 — snelheidsoverzicht zonder selectie

De knop Reissnelheid tonen staat ook zonder geselecteerde route in de sidebar. Alle zichtbare routes worden ingekleurd met één legenda, ongeacht de selectie. De afzonderlijke snelheidsweergave per route is vervallen. Mouseover blijft de details van een routestuk tonen. Verborgen routes blijven verborgen.

## Nieuw in 1.25.0 — compactere routesidebar

De routesidebar heeft minder witruimte en compactere bediening voor laptops. Begin/eindlocatie en reistijdberekening staan in uitklapbare secties. Begin en einde staan naast elkaar. Routekleur en verwijderen blijven onderaan direct beschikbaar. Alle velden en automatische opslag blijven behouden.

## Nieuw in 1.25.0 — reis plannen en kaart bewerken

De sidebar heeft twee standen. Reis plannen toont Locaties en Routes; Kaart bewerken toont Terrein en Wegen. Wegen bevat ook vaarroutes. Wisselen stopt tekenen en gooit alleen een nog niet afgeronde streek weg. Kaart bewerken toont terrein en wegen; Reis plannen verbergt deze lagen. Tijdelijk verborgen route- en locatieobjecten worden buiten kaartbewerking weer volgens hun eigen zichtbaarheid getoond. De snelheidsweergave uit 1.18.0 blijft beschikbaar.

## Nieuw in 1.25.0 — berekende snelheid op de kaart

Selecteer een route en kies Reissnelheid tonen. Segmentkleuren en tooltips volgen dezelfde terreinberekening als de totale reistijd. Rood is minder dan 24 mi/dag, goud 24 tot minder dan 30 en groen vanaf 30; de legenda converteert naar km. De sidebar groepeert afstand en reistijd per terrein/weg/snelheid. Handmatige routes en boten tonen de ingestelde snelheid. Dit is een berekening, geen reconstructie van logboekpauzes. De tijdelijke weergave wijzigt geen routekleur, backup of spelerskaart-export.

## Nieuw in 1.25.0 — vaarroute aansluiten op locaties

Bootroutes met gekoppelde begin- en eindlocatie sluiten aan op de dichtstbijzijnde getekende vaarroute zonder de korte klikafstand als beperking. Controleer de rechte toegangsstukken vanaf de locaties: de app herkent geen kustlijnen. Ontbreekt een verbonden waternetwerk, dan verschijnt een foutmelding in plaats van een stille rechte lijn. Bestaande bootroutes kunnen via Vaarroute opnieuw berekenen worden hersteld. Vrij tekenen houdt de bestaande korte aansluitafstand.

## Nieuw in 1.25.0 — vaarroutes

Kies Landweg of Vaarroute onder Terrein. Vaarroutes zijn blauw gestippeld en kunnen alleen op andere vaarroutes aansluiten bij verlengen. Kies Boot bij het aanmaken van een route om het waternetwerk te volgen; landvervoer volgt landwegen, vliegen volgt geen netwerk. Bestaande wegen zonder type blijven landwegen. Veranderen van vervoermiddel tekent bestaande routepunten niet opnieuw; het geldt voor volgende tekenstappen. Vaarroutes geven geen terreinbonus. Beide netwerken worden in campagne-exports en backups opgeslagen. Automatische controles uitgevoerd; geen echte browsercontrole.

## Nieuw in 1.25.0 — duidelijker terrein bewerken

Terrein heeft kleinere symbolen op een dichter raster en meer dekkende kleuren. Eén knop toont of verbergt terrein en wegen samen. Routes en locaties kunnen tijdelijk verborgen worden tijdens terreinbewerking; opgeslagen zichtbaarheid en exports veranderen niet. Buiten Terrein zijn ze weer zichtbaar volgens hun eigen instellingen. De sidebar heeft één doorlopende achtergrond.

## Nieuw in 1.25.0 — compacte productbanner

Fantasy Route Mapper staat groot in de banner, naast het kompaslogo. Slogans zijn verwijderd en de banner is compacter. De groen-gouden vormgeving blijft behouden.

## Nieuw in 1.25.0 — atlaspalet in de hele interface

De groene en gouden kleuren van het campagneoverzicht zijn doorgetrokken naar sidebar, navigatie, instellingen, invoervelden en overzichtsvensters. Actieve knoppen zijn goud, verwijderacties blijven herkenbaar. Kaartafbeeldingen, routekleuren en terreinkleuren zijn behouden. Automatische controles uitgevoerd; geen visuele browsercontrole.

## Nieuw in 1.25.0 — campagne-atlas

Het campagneoverzicht heeft een fantasy-atlassfeer met groen en goud, een introductie met het bestaande kompaslogo en verzorgde campagnekaarten. Campagne- en backupacties blijven beschikbaar. Alle vormgeving werkt lokaal zonder extra downloads of externe lettertypen. Automatische controles uitgevoerd; geen visuele browsercontrole.

## Nieuw in 1.25.0 — terreinlagen volgen de tab

Bij wisselen naar Locaties of Routes worden terreinkleuren en wegen verborgen en stopt het terreintekenen. Teruggaan naar Terrein maakt beide lagen opnieuw zichtbaar. De opgeslagen gebieden en wegen blijven behouden.

## Nieuw in 1.25.0 — consistente vensters en zichtbare terreinkaart

Tijd en Agenda en Party gebruiken dezelfde donkere vensterstijl als Kaart en Schaal. Bij elke opening van de tab Terrein staan terreinkleuren en wegen aan; beide blijven afzonderlijk uit te schakelen.

## Nieuw in 1.25.0 — aparte instellingenvensters

Kaart en Schaal, Tijd en Agenda en Party openen elk een eigen dialoog. Terrein volgt de opbouw en actieknoppen van de andere zijpanelen; alle drie de tabs hebben een klein icoon met een zichtbaar tekstlabel. Actieve tekengereedschappen zijn gemarkeerd.

## Nieuw in 1.25.0 — instellingen en wegen verlengen

Het logboek opent via de campagnenaam. Onder het logo staan Kaart en Schaal, Tijd en Agenda en Party bij Campagne Instellingen. Terreinkeuzes zijn alfabetisch (opgeslagen typecodes blijven gelijk); symbolen staan dichter bij elkaar. Wegbreedte wordt in kaartpixels ingesteld, onafhankelijk van het zoomniveau bij tekenen. Bestaande wegen behouden hun breedte. Start binnen 18 schermpixels van een wegeinde om dezelfde weg te verlengen; de bestaande breedte blijft behouden. Ook het einde van een nieuwe streek sluit binnen die afstand aan. Ongedaan maken herstelt de eerdere weg.

Automatische controles en gesimuleerde flows uitgevoerd; geen visuele browsercontrole.

## Nieuw in 1.25.0 — campagnenavigatie

Klik op de campagnenaam voor instellingen. Het logo opent het campagnemenu: logboek en spelerskaart staan bij Campagne, instellingen bij DM. Kaart selecteren staat in de instellingen. De derde sidebartab heet Terrein en bevat gebieden én wegen. Engels en Google Drive zijn niet toegevoegd.

## Nieuw in 1.25.0 — rustiger menu en herkenbare acties

Het hoofdmenu groepeert Campagne, Kaart & DM en Bestanden. Iconen ondersteunen de labels. Deselecteren en routepunten verwijderen zijn compacte icoonknoppen met een mouseover en toegankelijk label. Bestandskeuzes zijn ook met het toetsenbord bereikbaar.

Visuele controle in een echte browser is nog niet uitgevoerd.

## Nieuw in 1.14.0 — automatisch wegen volgen

Bij Nieuwe route staat **Getekende wegen automatisch volgen** standaard aan. Kies begin- en eindlocatie: als beide bij een verbonden DM-weg liggen, volgt de nieuwe route de kortste wegverbinding, inclusief bochten en kruisingen. Korte verbindingsstukjes behouden de exacte locatiecoördinaten.

Bij vrij tekenen verbindt iedere volgende klik zich via het wegennet met het vorige punt als beide dicht genoeg bij verbonden wegen liggen. Anders verschijnt een directe verbinding met een melding in de sidebar. Klikken hoeven dus niet alle bochten over te nemen. Stoppen met tekenen voegt nooit extra punten toe.

De optie kan bij nieuwe routes en in de routesidebar worden uitgezet; de voorkeur voor nieuwe routes wordt per campagne onthouden. Uitzetten verandert bestaande punten niet. Bestaande routes en reisregistraties worden niet opnieuw getekend wanneer wegen veranderen. Punten blijven handmatig bewerkbaar.

Alleen wegen die in het DM-menu zijn getekend worden gebruikt, ook wanneer de wegenlaag verborgen is. De kaartafbeelding wordt niet automatisch herkend. Locaties/klikken moeten binnen 12 kaartpixels of de getekende wegbreedte (de grootste van beide) bij een weg liggen. De dichtstbijzijnde weg wordt als aansluiting gebruikt. Als deze geen verbinding oplevert, kun je met tussenpunten de gewenste aansluiting kiezen.

Getekende kruisingen gelden als gelijkvloerse aansluitingen. Bijna aansluitende weg-einden worden verbonden binnen circa een halve wegbreedte plus 2 kaartpixels. Parallelle weginterieurs worden niet aan elkaar geplakt. Bruggen en tunnels zonder aansluiting zijn nog niet apart gemodelleerd: onderbreek zo nodig de DM-weg bij zo'n kruising. De kortste afstand over wegen wordt gekozen, niet automatisch de snelste terreintijd.

Automatische en gesimuleerde controles slagen. Echte browserbediening en visuele controle zijn nog niet uitgevoerd.


## Nieuw in 1.13.0 — DM-terrein en wegen

Open via het logo links → **DM-menu · terrein en wegen**. Dit menu en de terreinkaart zijn standaard verborgen.

1. Kies Arctic, Coastal, Desert, Forest, Grassland, Hill, Mountain, Swamp, Underdark of Urban.
2. Kies **Gebied tekenen** en sleep de omtrek. Bij loslaten wordt deze gesloten en gevuld. Nieuwe kleur vervangt bestaande terreinwaarden binnen de omtrek; elke plek bevat maximaal één type.
3. **Gebied wissen** maakt het omsloten gebied onbekend. **Ongedaan maken** herstelt de laatste 20 DM-acties tijdens de huidige campagnebewerking.
4. **Weg tekenen** tekent een goede weg als aparte lijn. De gekozen breedte wordt in kaartcoördinaten opgeslagen en wordt dus niet gewijzigd door later zoomen. **Weg verwijderen** verwijdert de aangeklikte weg; dit kan ongedaan worden gemaakt.
5. Escape of **Tekenen stoppen** beëindigt de tekenmodus; een afgebroken aanraking bewaart geen halve tekening. Kleuren en wegen zijn afzonderlijk te verbergen. Sluiten verbergt beide lagen en stopt het tekenen.
6. Kies bij een route **D&D 2024 · terrein en wegen**, plus Slow, Normal of Fast. De route toont afstand en reistijd per opeenvolgend terreindeel. Bestaande routes blijven standaard handmatig berekend.

Terreinen hebben transparante kleuren met herkenningssymbolen. De ondergrond blijft zichtbaar. DM-lagen worden niet in spelerskaart-PNG's opgenomen. Campagne-exports en volledige backups bevatten de terreingegevens en wegen wel.

### Berekening en grenzen

- Terrein beperkt het gekozen maximumtempo. Goede wegen verhogen het terreinmaximum één stap, tot Fast. Zie [D&D 2024 Travel Pace en Travel Terrain](https://www.dndbeyond.com/sources/dnd/br-2024/dms-toolbox#TravelPace).
- Arctic Fast vereist geschikte uitrusting. Zonder die keuze gebruikt deze app maximaal Normal; dat is onze expliciete terugval, geen aparte regelwaarde uit de tabel.
- Onbekend terrein gebruikt de bestaande handmatige dagsnelheid. Bij een onbekende of nul-snelheid is de duur onbekend. Voor Boot, Wagen, Vliegend en andere bijzondere vervoermiddelen blijft de ingestelde dagsnelheid gelden; hun eigen omstandigheden worden niet automatisch uit de grondlaag afgeleid.
- Terreinberekening gebruikt normale landreisdagen: 18, 24 of 30 mijl. Kilometers worden equivalent omgerekend. Weer, uitputting, hoogte, gedwongen mars en bijzondere bewegingsregels worden niet automatisch verwerkt.
- Een weg telt wanneer de route binnen zijn breedte ligt en ongeveer dezelfde richting volgt (maximaal circa 20 graden verschil; beide reisrichtingen werken). Een dwarse kruising telt niet als volgen. Controleer de uitsplitsing bij bochten of ingewikkelde wegkruisingen.
- Terrein wordt opgeslagen als één rasterwaarde per cel, maximaal 2048 cellen langs de langste kaartzijde. Omtrekken vullen cellen op basis van hun middelpunt; grenzen zijn daardoor benaderingen. Zelfkruisende omtrekken gebruiken afwisselend binnen/buiten. Er bestaan geen op elkaar gestapelde terreinvlakken.
- Reistijd wordt langs de route bemonsterd, ongeveer elke halve terreincel. Dit is een praktische kaartuitwerking van de regels per reisetappe, geen exacte simulatie van alle D&D-reisomstandigheden.
- Dit is één kaartlaag: Underdark vervangt ander terrein op dezelfde plek. Gebruik een aparte campagne/kaart voor een ondergrondse wereld die geografisch onder het oppervlak ligt.
- Bestaande logboeksnapshots blijven behouden bij het aanpassen van zones/wegen. Nieuwe registraties gebruiken de nieuwe berekening. Wis of wijzig een routekoppeling bewust als je een oude reissnapshot wilt vernieuwen.
- Terreingrenzen en wegen zijn aan de kaartcoördinaten gekoppeld. Een andere kaartafbeelding gebruiken kan daarom opnieuw tekenen nodig maken, net als bij bestaande routes/locaties.

Automatische regressie-, geometrie- en gesimuleerde pointertests slagen. Echte browserbediening, visuele canvasweergave, IndexedDB en PNG-download zijn nog niet gecontroleerd.


## Nieuw in 1.25.0

De drie aangewezen hulpteksten en zichtbare tempo-dropdown zijn verwijderd. Dagsnelheid is direct in mijlen of kilometers instelbaar; bestaande snelheden blijven behouden.


## Nieuw in 1.25.0

Locatieoverzicht en Deselecteren staan naast elkaar, zoals bij Routes.


## Nieuw in 1.25.0

Het informatielogo staat op het campagneoverzicht linksboven in de bovenbalk, buiten de inhoud van het overzicht. Het opent hetzelfde informatievenster.


## Nieuw in 1.25.0

- Huisje: zichtbare routes, locaties en party passend in beeld; vierde knop toont de hele kaart. Zonder inhoud gebruikt het huisje de hele kaart.
- Einddatum is direct bewerkbaar en schakelt automatisch naar berekenen uit datums. Nieuwe registratie start bij de laatste einddatum in dezelfde kalender.
- Bij opslaan verschuiven volgende registraties in sessievolgorde met het verschil tussen de oude en nieuwe einddatum. Duur, halve dagen en tussenruimtes blijven behouden. Registraties zonder geldige datums of met een andere kalender worden niet verschoven.
- Routes: geen snelkeuzemenu, geen inklapbare routeopties of zichtbare dupliceerknop. Statistieken boven de naam, vaste kleuren in een dropdown onderaan, Deselecteren naast Routeoverzicht.
- Locatie zichtbaar en Naam zichtbaar gebruiken dezelfde checkboxstijl.
- Campagneoverzicht: logo opent versie, website en e-mailadres.
- Automatische en gesimuleerde controles slagen; browsercontrole blijft nog uit te voeren.


## Nieuw in 1.25.0

Logo, favicon, locatie-iconen en party-icoon staan als originele PNG-bestanden in assets/. HTML en JavaScript bevatten geen ingebedde afbeeldingen meer. Pak altijd de hele ZIP uit en houd de mappen bij elkaar.

Bij lokaal file://-gebruik kan de browser afbeeldingen tonen maar PNG-export beschermen. Het exportvenster vraagt in dat geval om de meegeleverde assets-map te selecteren; daarna worden die bestanden voor de export gebruikt. Dat hoeft eenmaal per geopende app en vereist geen server of installatie. Online gebruik laadt de afbeeldingen rechtstreeks.


## Nieuw in 1.25.0

- Campagnemenu opent via het logo links; de losse Campagne-knop vervalt. Logo/menu en campagnenaam verdwijnen op Mijn campagnes.
- Volledige backup importeren gebruikt dezelfde knopstijl en hoogte als de knoppen ernaast.


## Nieuw in 1.25.0

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

## Aangepast in 1.25.0

De locatiezijbalk volgt dezelfde indeling en styling als Routes: kop met totaal, overzichtsknop, goudkleurige Nieuw-knop, scheidingslijn en een gelijkvormige melding bij geen selectie. De bestaande selectie- en opslagwerking is behouden. De bestaande automatische controles zijn opnieuw uitgevoerd; visuele browsercontrole staat nog open.

## Behouden uit 1.7.0

Routes en locaties gebruiken dezelfde selectiewerking. Met ‘Selectie wissen’ kun je de actieve route of locatie deselecteren zonder die te verwijderen. Een locatie selecteren wist de routeselectie; een route selecteren wist de locatieselectie. Zonder selectie toont de betreffende zijbalk Nieuw en Overzicht met een korte aanwijzing. De zijbalk toont dan alleen Nieuwe route, Routeoverzicht openen en een korte aanwijzing. De routevelden en bewerkpunten zijn verborgen; de routes zelf blijven zichtbaar op de kaart. Tekenen/invoegen stopt bij deselecteren.

Een lege selectie blijft behouden bij herladen/importeren. Na verwijderen van de geselecteerde route wordt niet automatisch een andere gekozen. Een bestaande geldige selectie blijft behouden. Klik op een routelijn, kies via het overzicht of maak een nieuwe route om weer details te tonen.

De integratiecontrole bevestigt behoud van routegegevens, verbergen van de editor, stoppen van de bewerkmodus, lege selectie na normalisatie/export-import en opnieuw selecteren. De echte browsercontrole staat nog open.

## Aangepast in 1.25.0

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
- `npm run release` (of `npm run build`): dezelfde controles, daarna `dist/fantasy-route-mapper-v1.25.0.zip`. Geen compilatie. Een bestaande ZIP wordt niet overschreven.

Zonder npm kun je dezelfde controles uitvoeren met `node scripts/check.cjs`, `node tests/verify.cjs` en `node tests/flows.cjs`; `node scripts/release.cjs` voert ze alle drie uit en maakt de ZIP.

## Uitgevoerde controles

Geslaagd: syntax, versies, links, DOM-ID’s/selectoren en bestaande regressies. Aanvullend gesimuleerd met de echte handlers: selecteren zonder extra punt, meerdere invoegingen met een ingeschakelde knop, uitschakelen van de modus, route-aanmaak zonder extra keuzelijst, schaalactie vanuit het campagnevenster en compatibiliteit van de naamcheckbox. De HTML-structuur en ZIP zijn gecontroleerd.

Er is geen echte visuele browser- of IndexedDB-persistentietest uitgevoerd. Die toegang was eerder geblokkeerd. Zie BROWSER_TESTS.md voor de resterende praktische controles.

## Nieuw in 1.25.0
- Rechtermuisknop ingedrukt houden om de kaart tijdens tekenen te slepen.
- Routepunten alleen zichtbaar bij Punten aanpassen.
- Water als inkleurbaar gebied; gebruikt de ingestelde dagsnelheid, geen automatische vervoerswissel.
- Campagnenaam bij Party; ruimere naam en boekicoon in de kaartkop.
- Consistente iconen op de campagnepagina.
