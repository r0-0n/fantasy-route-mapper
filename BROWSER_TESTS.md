# Extra browsercontrole 1.25.0

- Teken een kronkelende DM-weg, kies twee locaties erbij en maak een route: alle bochten worden gevolgd, locaties blijven exact gekoppeld.
- Test kruisingen, T-aansluitingen, doodlopende/losse wegen en twee alternatieve verbindingen.
- Vrij tekenen: klik begin en einde bij een weg; geen bochten overtekenen nodig. Zet wegen volgen uit voor een eigen afsnijding.
- Verborgen wegen blijven bruikbaar. Nieuwe wegen wijzigen bestaande routes niet.
- Controleer fallbackmelding bij punten ver van wegen of gescheiden wegennetten, en opgeslagen voorkeur na herladen.

# Aanvullende browsercontrole 1.25.0

Nog handmatig uit te voeren met een testcampagne:

- DM-menu via logo openen; standaard zijn terrein en wegen verborgen. Sluiten verbergt beide en stopt tekenen.
- Sleep bosomtrek met muis en aanraking; na loslaten is binnenkant gevuld. Teken berg over een deel: nieuwe kleur vervangt bos, zonder kleurmenging.
- Wis een omtrek; maak wissen/overschilderen/weg verwijderen ongedaan. Escape en pointercancel bewaren geen onvoltooide actie.
- Controleer kleine gebieden en kaartgrenzen op verschillende zoomniveaus.
- Teken goede weg; route volgen krijgt voordeel, dwars kruisen niet. Controleer breedte en uitsplitsing.
- Wissel handmatig/terrein, tempo, Arctic-uitrusting, transport en eenheid; controleer sidebar, routeoverzicht, nieuwe logboekregistratie en bestaande snapshot.
- Verberg terreinkleuren: berekening blijft gelijk. Spelerskaart toont geen DM-lagen.
- Herladen/campagne wisselen: data behouden, DM-menu verborgen. Export/import en volledige backup behouden terreinkaart en wegen.

# Extra controle 1.25.0

- Huisje met verspreide locaties/routes en lege kaart; vierde knop hele kaart.
- Einddatum rechtstreeks wijzigen en opslaan; controleer volgende sessies, halve dagen en beide kalenders.
- Nieuwe sessie begint bij vorige einddatum; bestaande duur/gaten blijven behouden bij doorschuiven.
- Sidebarvolgorde, vaste kleurdropdown en uniforme locatiecheckboxes.
- Logo campagneoverzicht opent/sluit infovenster met correcte links.

# Aanvullende controle 1.25.0

- Oude Inn/Village-campagne importeren: alle locaties behouden, type Village / Inn.
- Kies een vaste routekleur; nieuwe route en herladen behouden die voorkeur.
- Icoonmarkering uitschakelen/inschakelen: kaart en exportvoorbeeld volgen de instelling.
- Verberg route, locatie en afzonderlijke naam: exportvoorbeeld en PNG volgen elk hun instelling.
- Controleer het compacte exportvenster en sliders op smal en breed scherm.

# Aanvullende browsercontrole 1.25.0

- Controleer icoonachtergrond, gouden selectierand en korte markering via Toon op kaart op lichte/donkere kaartdelen en verschillende zoomniveaus.
- Open/hernoem een campagne: tabtitel verandert, favicon en koplogo blijven zichtbaar.
- Selecteer/sleep party: overzicht zichtbaar en geen tab geselecteerd; klik Locaties of Routes om terug te keren.
- Exportvoorbeeld: verander beide sliders, route-/locatiekeuze, naamweergave en uitsnede; vergelijk de gedownloade PNG met het laatste voorbeeld.
- Schuif snel heen en weer: alleen het nieuwste voorbeeld mag downloadbaar worden. Controleer foutmelding als renderen mislukt.

# Aanvullende browsercontrole 1.25.0

Nog uit te voeren met een testcampagne, zonder echte gebruikersgegevens te wijzigen:

- Nieuw logboekitem: volgorde, vandaag in de datumkiezer, geen zichtbare notities/plaatsen.
- Route kiezen vult dagen in; wijzig naar 2,5 dagen en controleer berekend einde.
- Test Harptos Midsummer → Shieldmeet in 1492, en Gregoriaans 28 februari → 1 maart in een schrikkeljaar.
- Kalender wisselen: oude items houden datums en kalender, nieuwe volgen instellingen.
- Party met muis en aanraking selecteren/slepen, ook ingezoomd; Escape en pointercancel herstellen de positie. Sidebar toont hele-logboektotalen.
- Vervoermiddel/tempo wijzigen en herladen; mijlen/kilometers geven gelijke reistijden.
- Exporteer spelerskaart met een afgelegde route: uitsnede met marge, juiste iconen/routes en labels. Controleer volledige-kaartoptie en geen-reisfallback.
- Backup/export/import behoudt kalender, dagdelen, party en vervoermiddel.

# Browsercontrole 1.6.0

Nog niet in een echte browser uitgevoerd. Gebruik fictieve testdata; wis geen eigen campagnes.

- Open de volledig uitgepakte index.html. Controleer versie, eerste tab Locaties, overzichtstabellen en detailzijbalk.
- Maak routes zonder, met één en met twee locatiekoppelingen. Controleer vrij tekenen en expliciet een directe lijn maken.
- Stop vóór de gekozen eindlocatie: geen extra lijn of verplaatsing. Voeg later koppelingen toe en ontkoppel weer; controleer behoud van tussenpunten.
- Klik eerst op een routelijn: alleen selectie. Schakel daarna Punt invoegen in, voeg meerdere punten toe en schakel uit via knop of Escape. Sleep de nieuwe punten. Controleer gekoppelde eindpunten en nabijheidskoppeling tijdens tekenen.
- Verplaats een locatie: alleen daadwerkelijk aangesloten eindpunten bewegen mee, niet een onvoltooide route naar een geplande bestemming.
- Controleer Schaal instellen vanuit campagne-instellingen en wijzig miles naar kilometers. Controleer alle routes, een nieuwe route, een andere campagne en behoud na herladen.
- Maak een Encounter. Controleer locatieoverzicht en typefilter.
- Schakel Naam op de kaart tonen per locatie in en uit. Controleer zoom, selectie, herladen, backup/import en spelerskaart-PNG.
- Controleer volledige backup, annuleren/bevestigen bij import, HTML-/Markdown-logboek en PNG-download.

Noteer datum, browser/versie en resultaat. Geautomatiseerde gesimuleerde tests gelden niet als afgetekende browsercontrole.

- 1.6.1: vergelijk route- en locatieoverzicht: acties rechtsboven, identieke zoek/filterindeling. Controleer automatisch opslaan van alle locatievelden na verwijderen van de opslagknop.

- 1.6.2: Locaties/Routes wisselen alleen de zijbalk; Nieuwe en Overzicht blijven beschikbaar. Controleer de invoegknop zonder rondje, inclusief actieve toestand.

- 1.7.0: selecteer en deselecteer een route. Controleer dat alleen editor en bewerkpunten verdwijnen, herlaad en selecteer opnieuw. Controleer ook deselecteren tijdens tekenen/invoegen en verwijderen van de actieve route.

- Selecteer afwisselend route en locatie: de vorige selectie vervalt. Controleer Selectie wissen bij beide typen en behoud van alle gegevens.


## 1.26.0 — handmatige controle urentijdlijn
- Open een bestaande campagne: alleen bekijken mag niets opslaan of omzetten.
- Nieuwe speelsessie: kies beginmoment; voeg een halve route, drie uur verblijf en een tweede reis toe. Controleer 24-uursklok en rust tussen reisdagen.
- Nieuwe sessie: controleer dat de resterende 50% voorgesteld wordt; overlap moet een fout geven. Nieuwe tocht moet herhaling toestaan.
- Pas een vroeg verblijf aan en controleer de latere sessies, partytotalen en HTML/Markdown export.
- Controleer Harptos-datumkiezer, Gregorian schrikkeldag, Escape/annuleren, verwijderen en opslaan/herladen.
- Controleer het venster op 13-inch laptops, toetsenbord en scrollen. Controleer afzonderlijk JSON en ZIP herstel op testdata.


## 1.27.0
- Controleer vaarroutes als blauwe doorgetrokken lijnen en Grot/Kamp-iconen op kaart en PNG-export.
- Plan tussen locaties ver van een gebogen weg; controleer aansluiting en behoud van bochten.
- Controleer Herberekenen, annuleren en handmatige tekenacties in het uitklappaneel.
- Vergelijk routekeuze met handmatige snelheid en D&D-terreininstellingen; controleer dat bestaande logboekgegevens behouden blijven.

## Stadsmodus 1.31.0 (handmatig controleren)
- Maak Nieuwe Stad, laad een lokale kaart, voeg elke categorie toe.
- Bewerk eigenaar en meerdere NPC’s; herlaad en controleer bewaren.
- Wissel stad/campagne: correcte categorieën en sidebar zonder verlies.
- Zet Naam zichtbaar uit; controleer kaart en PNG-preview. Verberg locatie apart.
- Controleer dat opmerkingen/NPC’s niet op de spelerskaart staan.
- Plaats/sleep party en exporteer PNG; controleer stadskaart op 13-inch scherm.
- Dupliceer, exporteer/importeer JSON en volledige ZIP (met kaart) naar testopslag.

## 1.32.0 opmaak en NPC-overzicht (nog visueel te controleren)
- Controleer startknoppen bij 994 px, 650 px en 390 px: vaste groepen, geen losse auto-marges.
- Controleer ruimte onder naam bij Stadsinstellingen en Party, en bij overige formulieren.
- Instellingenicoon naast stadsnaam heeft dezelfde grootte als het logboekicoon.
- Open een stad met oude omschrijving én notities: beide in één veld; opslaan/heropenen zonder verdubbeling.
- Maak/bewerk NPC via locatie en overzicht; zoek op naam/rol/locatie/notitie, verplaats naar andere locatie en controleer beide plekken.

## 1.34.0 stads-/wereldkaartuitbreidingen — handmatige visuele controle
- Bestaande stad openen: namen en zichtbaarheid onveranderd, geen ongevraagde partypositie.
- Schaal instellen in km en miles; tooltip zonder/met party, verslepen en instellingen aanpassen.
- Tooltip compact bij kaartranden; verdwijnt bij verlaten marker. Namen show/hover/hide.
- Zoek locatie op naam/type/NPC; verborgen locatie blijft verborgen maar bewerkbaar.
- Meerdere typefilters uit/aan, alle typen tonen; heropenen reset alleen filter.
- Tweepuntsmeting, Escape, kaart slepen; geen opgeslagen route.
- Wereldkaart: geen stadsfilters, loopsnelheid of NPC’s. Stad: geen wereldreisvooruitzicht/historie.
- Gekoppelde bezoeken A→B, verblijf, B→C: B eenmaal; terugreis naar B: tweede bezoek.
- Reisvooruitzicht vergelijken met dezelfde volledige reis in logboek; begin/einde reisdag, maand/jaar.
- ZIP met stad en wereldkaart in testopslag herstellen; eigen gegevens niet wissen.

## 1.35.0 stadscategorieën (handmatig visueel controleren)
- Hoofdgroep/subcategorie kiezen en iconen bekijken op 24/32/48 px.
- Bestaande stadskaart openen: NPC’s, notities, positie en labelstand blijven behouden.
- Hoofdgroepfilter, zoeken op groep/type/NPC, overzicht en PNG-export controleren.
- Categorieën en iconen na JSON-/ZIP-herstel en offline beschikbaar.

## Website-updates (1.36.0)

- Op HTTPS: publiceer een hogere versie, controleer de updateknop naast App installeren.
- Met twee FRM-vensters moet Bijwerken vragen het andere venster te sluiten.
- Na sluiten en bijwerken: nieuwe versie zichtbaar, campagnes en kaartafbeeldingen behouden.
- Controleer offline openen, mislukte opslag (geen herladen), en lokale HTML-uitleg.
- Deze release heeft gesimuleerde updatecontroles; de echte HTTPS/PWA-updateflow moet nog op de host worden gecontroleerd.

## Kaartkoppelingen en stadsbediening (1.38.0)
- Koppel een stad aan een wereldkaartlocatie, open de stad en keer terug naar die locatie.
- Koppel dezelfde stad aan twee wereldkaarten; controleer de terugkeuze.
- Herstel een volledige backup en open de meegeïmporteerde stad via de meegeïmporteerde wereldkaart.
- Kies eigenaar uit NPC’s, koppel één NPC aan twee locaties, bewerk en verwijder deze.
- Controleer het locatieoverzicht, zoekresultaten met 100 NPC’s en eigenaar na herladen.
- Schakel alle typen en alle namen aan/uit; maak daarna een nieuwe locatie.
- Controleer dat wereldkaarten geen stads-NPC- of loopinstellingen krijgen.

## Extra markers en party (1.39.0)
- Controleer leesbare locatienamen naast compacte NPC-checkboxes, ook bij lange namen.
- Plaats/verplaats de nieuwe party-marker en controleer het symbool in spelerskaart-export.
- Plaats via Extra marker een persoon en tijdelijke plek; controleer naam, notities, verplaatsen, opslaan/herladen en verwijderen.
- Annuleer het plaatsen en controleer dat een volgende gewone locatie geen extra marker wordt.
- Controleer dat Extra marker alleen op stadskaarten verschijnt.

## Optimalisaties 1.50.0 — nog handmatig te controleren
- Bestaande campagne openen, notitie wijzigen, herladen; gedeelde kaart blijft zichtbaar.
- Opslagfout simuleren: wisselen/aanmaken/import/volledige backup moet stoppen, actuele individuele export blijft mogelijk.
- Lokaal PNG-export uitvoeren met assets-map, inclusief party en wereldiconen.
- Offline bijgewerkte app en iconenoverzicht openen; punaise en logo scherp controleren.

## 1.50.0 — handmatige layoutcontrole nog nodig
- Stad en wereld op 910 × 978 en smal scherm: menu, toolbar en panelen linksboven zonder overlap met zijbalk.
- Locaties/routes/NPC’s filteren en CSV exporteren: namen, aanhalingstekens en regeleinden controleren.
- Mijn kaarten: previews, resolutie na laden en CSV-download.
- Logboek via hoofdmenu en bestaande HTML/Markdown-export.

## 1.50.0 — nog handmatig te controleren
- Wereldkaartcategorieën filteren en weer tonen; opgeslagen zichtbaarheid blijft gelijk.
- Stad vanuit wereld openen, terugkeren en de laatste stad opnieuw openen, ook na herladen.
- CSV, PNG, JSON, HTML, Markdown en ZIP downloaden: datum/tijd in bestandsnaam.
- Installatieknop in standalone-app en na appinstalled; gewone tabs kunnen installatie niet altijd herkennen.
