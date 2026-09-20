# 🗺️ Fantasy Route Mapper

**Plan reizen, verken je wereld en houd de geschiedenis van je D&D-campagne bij.**

Fantasy Route Mapper is een lokale kaarttool voor Dungeon Masters. Laad je eigen wereldkaart, teken routes, bereken reistijden en leg gespeelde sessies vast — zonder account.

**Versie:** `v0.9.5 Beta` · **Taal:** Nederlands · **Opslag:** lokaal in je browser

> Deze versie is een Beta. Maak regelmatig een volledige backup van je campagnes.

## Inhoud

- [Snel beginnen](#snel-beginnen)
- [Functies](#functies)
- [Routes en locaties](#routes-en-locaties)
- [Logboek en Harptos-kalender](#logboek-en-harptos-kalender)
- [Backups en export](#backups-en-export)
- [Gebruik op een tafel-TV](#gebruik-op-een-tafel-tv)
- [Nieuw in v0.9.5 Beta](#nieuw-in-v095-beta)
- [Teststatus en compatibiliteit](#teststatus-en-compatibiliteit)
- [Versiebeheer en toekomst](#versiebeheer-en-toekomst)

## Snel beginnen

1. Download en pak de ZIP uit.
2. Open **`index.html`** in een moderne browser.
3. Kies **Campagne → Nieuwe campagne** en geef je campagne een naam.
4. Klik op **Wereldkaart selecteren** en kies je kaartafbeelding.
5. Kies **Campagne → Schaal instellen**, klik twee punten aan en vul de bekende afstand in.
6. Voeg via het zijpaneel routes, locaties en sessies toe.

Er is geen installatie of account nodig. De ZIP bevat de app en documentatie; je persoonlijke campagnes zitten er niet in.

## Functies

| Onderdeel            | Mogelijkheden                                                |
| :------------------- | :----------------------------------------------------------- |
| **Wereldkaart**      | Eigen afbeelding, zoomen, verschuiven en schaal instellen    |
| **Routes**           | Tekenen, punten aanpassen, zoeken, status, kleur, afstand en reistempo |
| **Locaties**         | Plaatsen, verplaatsen, type, regio en aanvullende informatie |
| **Campagnelogboek**  | Sessies, notities, gekoppelde reizen en locaties             |
| **Harptos-kalender** | Datums kiezen en verstreken in-game dagen berekenen          |
| **Spelerskaart**     | PNG-export met zelfgekozen routes, locaties en namen         |
| **Backups**          | Eén campagne of alle campagnes exporteren en importeren      |
| **Tafel-TV**         | Kaart op volledige vensterhoogte, zwevend menu en inklapbaar zijpaneel |

## Routes en locaties

### Routes tekenen

Open **Routes → + Nieuwe route** en klik op de kaart om routepunten te plaatsen. Kies **Tekenen afronden** wanneer de route klaar is. Met **Route tekenen** kun je later verdergaan.

- Sleep een routepunt om de route aan te passen.
- Gebruik **Punt invoegen** om een extra punt tussen bestaande punten te plaatsen.
- Verwijder het laatste of geselecteerde punt met de bijbehorende knop.
- Klik op een routelijn of zoekresultaat om de route te selecteren. De geselecteerde route krijgt een lichte rand.
- Stel onder **Routeopties** het reistempo, de kleur en de eenheid in.

Afstand en geschatte reistijd gebruiken de ingestelde kaartschaal en het reistempo.

### Locaties beheren

Kies **Locaties → + Locatie op kaart plaatsen**, klik op de gewenste plek en voer een naam in. Daarna kun je type, regio en details toevoegen.

Met **Locatie verplaatsen** kies je een nieuwe positie. Met **Toon** in de lijst centreer je de kaart op een locatie.

Locatienamen verschijnen vanaf **80% zoom** of bij selectie. Met **Alle namen tonen** blijven ze ook bij uitzoomen zichtbaar. Tooltips geven extra informatie; bediening vereist geen hover.

### Schaal instellen

Klik twee punten aan waarvan je de werkelijke afstand kent. Vul de afstand in het venster in en kies **Schaal opslaan**. Een decimale komma is toegestaan, bijvoorbeeld `12,5`.

Annuleren behoudt een eerder ingestelde schaal. De gebruikte eenheid staat in het afstandsvenster.

## Logboek en Harptos-kalender

Open **Logboek** in het zijpaneel om sessies toe te voegen of te bewerken. Een sessie kan een titel, speeldatum, notities, locaties en meerdere reizen bevatten.

Bij grote lijsten kun je zoeken of bladeren. Resultaten verschijnen in kleine groepen; **Meer tonen** maakt volgende resultaten bereikbaar.

### In-game datums

Met **Kies Harptos-datum** selecteer je een maand of feestdag, een dag en een jaar in DR. De kalender bevat de jaarlijkse feestdagen en **Shieldmeet** in jaren die deelbaar zijn door vier.

Nieuwe sessies gebruiken standaard automatische dagentelling:

| Voorbeeld                  | Verstreken tijd |
| :------------------------- | :-------------- |
| 21 → 26 Eleasis            | 5 dagen         |
| Begin- en einddatum gelijk | 0 dagen         |
| Einddatum vóór begindatum  | Niet toegestaan |

De berekende sessieduur **omvat reizen**. Reistijd van gekoppelde routes wordt daarom niet nogmaals aan die periode toegevoegd.

Bestaande sessies behouden hun handmatige telling totdat je automatisch rekenen inschakelt. Bij handmatige telling zijn de ingevoerde dagen extra rust-, verblijf- of wachtdagen naast de reistijd. Vrije datumtekst blijft hiervoor beschikbaar.

### Campagnetotaal

Het totaal bestaat uit sessieduren en extra handmatige dagen, plus de reistijd van unieke routes die niet al aan automatisch berekende sessies gekoppeld zijn.

- Een route telt hoogstens eenmaal mee als extra reistijd.
- Overlappende sessieperiodes worden **niet automatisch samengevoegd**.

## Backups en export

Je campagnes en kaarten worden automatisch opgeslagen in **IndexedDB**, lokaal in je browser. Ze worden niet automatisch met anderen gesynchroniseerd.

| Actie                                       | Inhoud                                           |
| :------------------------------------------ | :----------------------------------------------- |
| **Campagne → Campagne exporteren**          | Huidige campagnegegevens, zonder kaartafbeelding |
| **Campagne → Volledige backup**             | Huidige campagne inclusief kaart                 |
| **Mijn campagnes → Alles exporteren**       | Alle lokale campagnes inclusief kaarten          |
| **Campagne → Spelerskaart exporteren**      | PNG met geselecteerde routes, locaties en namen  |
| **Logboek → Exporteer als HTML / Markdown** | Leesbare export van het campagnelogboek          |

Importeer één campagne via **Campagne → Campagne importeren**. Gebruik voor een totaalbackup **Mijn campagnes → Volledige backup importeren**; bestaande campagnes blijven daarbij behouden.

> **Bewaar je gegevens:** maak een totaalbackup voordat je van browser of appversie wisselt. Een andere browser of bestandslocatie kan een andere opslagcontext hebben. Browsergegevens wissen kan ook je campagnes verwijderen.

De spelerskaart-export heeft een eigen keuze voor locatienamen, onafhankelijk van de naamweergave op de werkkaart.

## Gebruik op een tafel-TV

De kaart gebruikt de volledige vensterhoogte. Het campagnemenu zweeft linksboven. Klap het zijpaneel in om ook de volledige breedte voor de kaart te gebruiken.

Tijdens tekenen, locaties plaatsen of verplaatsen en schaal instellen toont een instructiebalk de volgende stap. Het logboek blijft beschikbaar als ruim venster.

## Nieuw in v0.9.5 Beta

Deze versie bouwt voort op de aangeleverde **v0.9.4 HTML**.

### Gerepareerd

- Nieuwe campagne, locatie plaatsen en schaal instellen gebruiken eigen invoervensters in plaats van browserprompts.
- De laagvolgorde van het Campagne-menu en dialoogvensters is aangepast.
- Schaal instellen stopt bij twee punten en controleert de afstandsinvoer.
- Wereldkaart selecteren opent rechtstreeks de bestandskiezer; het welkomstvenster wordt niet meer als kaartbediening behandeld.
- Routezoekresultaten zijn direct aanklikbaar.

### Verbeterd

- Rustiger routemenu en een zijpaneel met **Routes · Locaties · Logboek**.
- Zwevend campagnemenu en meer ruimte voor de kaart.
- Harptos-datumkiezer en automatische dagentelling.
- Compacte zoeklijsten in de sessie-editor.
- Selectie op de kaart gekoppeld aan het zijpaneel.
- Locatienamen afhankelijk van zoom of selectie, met een optie om alle namen te tonen.
- Instructiebalk en tooltips voor belangrijke bediening.

De velden vertrekpunt, bestemming en routenotitie zijn uit het routemenu gehaald. Bestaande gegevens en locatiekoppelingen blijven bewaard.

## Teststatus en compatibiliteit

**Uitgevoerde controles:**

- JavaScript-syntax, unieke DOM-ID’s en vaste ID-verwijzingen.
- Gerichte tests met nagebootste interface voor campagneaanmaak, locatieplaatsen, schaalinvoer, zoeken, selectie en naamzichtbaarheid.
- Zoektests met 100 routes en 100 locaties.
- Harptos-rekentests over maand-, feestdag-, schrikkeljaar- en jaargrenzen.
- Interactieve gebruikersbevestiging van route-/locatieselectie en naamzichtbaarheid.

Een volledige automatische interactieve browsertest is **niet uitgevoerd**. Niet alle opslag-, import- en downloadflows zijn opnieuw van begin tot eind getest.

| Versieveld      | Waarde       |
| :-------------- | :----------- |
| Appversie       | `0.9.5 Beta` |
| `dataVersion`   | `1`          |
| `backupVersion` | `1`          |

Het optionele sessieveld `timeMode` bewaart de gekozen dagentelling. Oudere appversies kennen de automatische Harptos-telling niet; gebruik v0.9.5 Beta of nieuwer om die sessies correct te verwerken.

## Versiebeheer en toekomst

De volgende functionele wijzigingsronde krijgt **v0.9.6 Beta**. Appversie, README, outputmap en ZIP krijgen hetzelfde versienummer. Nieuwe releases komen naast de vorige versie.

Een **deelbare, offline werkende PWA via een vaste weblink** staat op de ideeënlijst voor later. Deze download is nog geen installeerbare PWA.

---

*README bijgewerkt op 20 september 2026.*
