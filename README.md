# 🗺️ Fantasy Route Mapper — v0.9.6 Beta

Een lokale kaarttool voor D&D: routes, afstanden, plaatsen en een compact reislogboek.

## Snel beginnen

1. Pak de ZIP uit en open `index.html` in je browser.
2. Maak een campagne en selecteer je wereldkaart.
3. Stel de schaal in via **Campagne → Schaal instellen**.
4. Maak routes en locaties via het zijpaneel.
5. Open **Logboek → + Reis** om een gemaakte reis vast te leggen.

## Nieuw: het reislogboek als tabel

| Kolom | Inhoud |
|---|---|
| Periode | Vertrek- en aankomstdatum in Harptos |
| Reis | Naam van de afgelegde route |
| Afstand | Afstand bij registratie |
| Reisduur | Geschatte reistijd op basis van afstand en tempo |
| Plaatsen | Gekoppelde bezochte plaatsen en gekoppelde begin-/eindlocaties |
| Acties | Bewerken en Toon op kaart |

- Nieuwe registraties bevatten één gekozen route. Je kunt dezelfde route meerdere keren registreren; iedere reis telt apart mee.
- Nieuwe registraties bewaren de routegegevens. Later aanpassen van de route verandert deze historische afstand en reisduur niet vanzelf.
- Klik op een rij of **Bewerk** om datums, route of plaatsen te wijzigen.
- **Toon op kaart** centreert op de gekoppelde route. De kaart toont de huidige routegeometrie, niet een historische kopie.
- Zoek op reis of plaats, sorteer op vertrekdatum en filter op een Harptos-periode. Het periodefilter toont reizen die de periode overlappen; de hele reis telt mee.
- De totalen boven en onder de tabel volgen de getoonde registraties.
- Zonder bekende schaal/route blijft afstand of reisduur onbekend. Totalen zijn dan expliciet gedeeltelijk.

## Reizen vastleggen

Kies **+ Reis**, een afgelegde route, bezochte plaatsen en vertrek-/aankomstdatums.
De Harptos-datumkiezer ondersteunt maanden, feestdagen en Shieldmeet.
Bij automatische dagentelling zijn geldige begin- en einddatums nodig.

De kalenderperiode kan rust- of verblijfdagen omvatten. **Reisduur** in de tabel is de geschatte reistijd en wordt apart getoond: zes kalenderdagen kunnen bijvoorbeeld 5,5 reisdagen bevatten.
De eerdere handmatige dagentelling blijft beschikbaar, maar bepaalt niet de geschatte reistijd in de tabel.

Sessienummer, speeldatum, gebeurtenistitel en notities staan niet meer in het formulier. De tool richt zich op reizen, afstanden en plaatsen.

## Delen met spelers

**Spelersoverzicht (HTML)** en **Spelersoverzicht (Markdown)** exporteren de momenteel getoonde reizen als tabel met totalen. Gebruik zoeken en de periodefilter om het overzicht te beperken. De HTML-export kan vanuit een browser worden afgedrukt.

Deze exports bevatten geen oude sessienotities of DM-notities. Controleer wel welke reis- en plaatsnamen je wilt delen.
Voor een afbeelding blijft **Campagne → Spelerskaart exporteren** beschikbaar. Een kaart wordt niet automatisch in de tabel-export opgenomen.

## Bestaande campagnes uit v0.9.5

Maak eerst in v0.9.5 via **Mijn campagnes → Alles exporteren** een backup. Open daarna v0.9.6 en importeer de backup als de campagnes niet al zichtbaar zijn.

- v0.9.5 is niet overschreven; deze release staat in een eigen map.
- Bestaande sessies worden als registraties weergegeven. Een oude sessie met meerdere routes blijft één gecombineerde registratie met opgetelde afstanden/reistijden. Er worden geen onbekende afzonderlijke reisdatums verzonnen.
- Oude registraties zonder routes blijven zichtbaar en kunnen worden uitgefilterd.
- Eerdere titel-, datum-, nummer- en notitievelden blijven in de opgeslagen gegevens behouden.
- Bij oude registraties zonder opgeslagen routegegevens worden afstanden en reistijden uit de huidige routes berekend. Bij opslaan wordt een momentopname vastgelegd.
- Het reislogboek telt herhaalde registraties afzonderlijk; dit verschilt bewust van de oude telling op basis van unieke routes.

## Opslag en backups

Campagnes staan lokaal in de browser (IndexedDB). Ze worden niet automatisch gedeeld of gesynchroniseerd. De app-ZIP bevat geen persoonlijke campagnes.

| Export | Inhoud |
|---|---|
| Campagne exporteren | Huidige campagne zonder kaartafbeelding |
| Volledige backup | Huidige campagne inclusief kaart |
| Mijn campagnes → Alles exporteren | Alle campagnes inclusief kaarten |

Gebruik dezelfde browser en maak regelmatig een backup. Een nieuw bestandspad kan een andere opslagcontext hebben.

## Controles en beperkingen

Geslaagd: JavaScript-syntax, unieke DOM-ID’s, vaste ID-verwijzingen, herhaalde reizen, historische afstanden, eenhedenconversie, Harptos-periodefilters, oude records zonder route, HTML-escaping en het weglaten van oude notities uit spelersexports.
Regressiechecks voor schaalinstelling, Harptos-berekeningen, instructiebalk, routekeuze en naamzichtbaarheid zijn eveneens geslaagd.

Deze controles gebruiken geïsoleerde rekenfuncties en nagebootste interface-elementen. Een volledige interactieve browsertest, inclusief werkelijke import/download en visuele controle, is niet uitgevoerd. Dit blijft een Beta.

## Versies

- App: **0.9.6 Beta**
- `dataVersion`: **1**
- `backupVersion`: **1**

Registraties blijven in de bestaande gegevensstructuur bewaard met een optionele `travelSnapshot`. Oudere apps gebruiken de nieuwe historische waarden en telling niet. Gebruik v0.9.6 voor deze reisoverzichten.

Een installeerbare, deelbare PWA blijft een idee voor later.
