FANTASY ROUTE MAPPER — v0.9.5 Beta
README bijgewerkt: 20 september 2026

Een lokale kaarttool voor Dungeons & Dragons-campagnes: teken routes,
bereken afstanden en reistijden, beheer locaties en houd sessies bij.
Deze versie is gebaseerd op de aangeleverde v0.9.4 HTML.

1. STARTEN
Pak de ZIP uit en open index.html in een moderne browser.
Maak via Campagne > Nieuwe campagne een campagne aan. Selecteer daarna
je wereldkaart. Er is geen account of installatie nodig.
De ZIP bevat de app en deze handleiding, niet je campagnegegevens.

2. KAART EN SCHAAL
Kies Campagne > Schaal instellen. Klik twee punten op de kaart aan waarvan
je de afstand kent. Vul de afstand in en klik Schaal opslaan. Een decimale
komma mag: bijvoorbeeld 12,5. Annuleren behoudt een eerder ingestelde schaal.
De gekozen eenheid staat in het afstandsvenster.
Gebruik de kaartknoppen om in/uit te zoomen of de kaart passend te maken.

3. ROUTES
Open Routes in het zijpaneel en kies + Nieuwe route.
Klik op de kaart om routepunten te plaatsen; kies Tekenen afronden als
je klaar bent. Route tekenen hervat het toevoegen van punten.
Sleep een routepunt om het te verplaatsen. Punt invoegen voegt een punt
in een bestaande route in. Je kunt ook het laatste of geselecteerde punt
verwijderen.
Zoek een route en klik op het resultaat, of selecteer een routelijn op de
kaart. De geselecteerde route krijgt een lichte rand.
Onder Routeopties staan reistempo, kleur, eenheid, dupliceren en verwijderen.
Afstand en geschatte reistijd worden berekend op basis van schaal en tempo.
De vroegere velden vertrekpunt, bestemming en notitie zijn uit het menu
gehaald; bestaande gegevens en locatiekoppelingen blijven bewaard.

4. LOCATIES
Open Locaties en kies + Locatie op kaart plaatsen. Klik op een plek en
voer de naam in. In de locatie-editor kun je type, regio en details invullen.
Locatie verplaatsen laat je daarna een nieuwe positie op de kaart kiezen.
Met Toon in de lijst centreer je de kaart op de locatie.
Locatienamen verschijnen vanaf 80% zoom of bij selectie. Zet Alle namen
tonen aan om ook bij uitzoomen alle namen zichtbaar te houden.
Tooltips geven aanvullende informatie; hover is niet nodig voor bediening.

5. LOGBOEK EN HARPTOS
Logboek in het zijpaneel opent een ruim venster. Voeg sessies toe met titel,
speeldatum, notities en gekoppelde routes en locaties.
De zoeklijsten tonen bij veel items eerst een zoek-/bladerkeuze. Resultaten
verschijnen in groepen; Meer tonen maakt volgende resultaten bereikbaar.

Met Kies Harptos-datum kies je een maand of feestdag, dag en jaar (DR).
De kalender bevat de jaarlijkse feestdagen en Shieldmeet in jaren deelbaar
door vier. Vrije datumtekst blijft mogelijk bij handmatige dagentelling.
Nieuwe sessies gebruiken standaard automatische dagentelling:
- Van 21 tot 26 Eleasis is 5 verstreken dagen; dezelfde datum is 0 dagen.
- De einddatum moet op of na de begindatum liggen.
- Deze periode omvat reizen; gekoppelde reistijd wordt niet nogmaals geteld.
Bestaande sessies blijven handmatig rekenen totdat je automatisch rekenen
inschakelt. Handmatig ingevoerde dagen zijn extra dagen naast de reistijd.
Het campagnetotaal telt sessieduren en extra handmatige dagen op, plus de
reistijd van unieke routes die niet al aan automatische sessies gekoppeld
zijn. Een route telt daarbij hoogstens eenmaal mee als extra reistijd.
Overlappende sessieperiodes worden niet automatisch samengevoegd.

6. OPSLAG, BACKUPS EN EXPORT
Wijzigingen worden automatisch lokaal in de browser opgeslagen (IndexedDB).
Gebruik bij voorkeur dezelfde browser en dezelfde bestandslocatie.
Een andere browser of bestandslocatie kan een andere opslagcontext hebben.
Browsergegevens wissen kan ook je campagnes verwijderen.

- Campagne > Campagne exporteren: gegevens van de huidige campagne,
  zonder kaartafbeelding.
- Campagne > Volledige backup: huidige campagne inclusief kaart.
- Mijn campagnes > Alles exporteren: alle lokale campagnes en kaarten.
- Mijn campagnes > Volledige backup importeren: alle campagnes uit een
  totaalbackup toevoegen; bestaande campagnes blijven behouden.
- Campagne > Campagne importeren: een individuele campagne importeren.
- Campagne > Spelerskaart exporteren: selecteer routes, locaties en namen
  en exporteer een PNG. De export heeft een eigen keuze voor locatienamen.
- Vanuit het logboek kun je HTML of Markdown exporteren.

Maak een totaalbackup voordat je van browser of appversie wisselt.
Kaarten en campagnes worden niet automatisch met anderen gesynchroniseerd.

7. INDELING EN TAFEL-TV
De kaart gebruikt de volledige vensterhoogte. Het campagnemenu zweeft
linksboven. Routes, Locaties en Logboek staan in het zijpaneel.
Klap het zijpaneel in voor maximale kaartbreedte op een tafel-TV.
Een instructiebalk toont de volgende stap bij tekenen, locatie plaatsen,
verplaatsen, punten invoegen en schaal instellen.
Campagne-instellingen bevat de campagnenaam en kaart-/schaalinformatie.

8. BELANGRIJKSTE REPARATIES SINDS v0.9.4
- Nieuwe campagne, locatie plaatsen en schaal instellen gebruiken eigen
  invoervensters in plaats van browserprompts.
- Campagne-dropdown en dialoogvensters hebben een aangepaste laagvolgorde.
- Schaalinstelling stopt na twee punten en controleert de afstandsinvoer.
- Wereldkaart selecteren opent rechtstreeks de bestandskiezer. Klikken op
  het welkomstvenster worden niet als kaartgebaren behandeld.
- Routezoekresultaten zijn direct aanklikbaar.
- Dubbele bediening en overbodige informatie zijn uit de interface gehaald.

9. TESTSTATUS EN COMPATIBILITEIT
Dit is een Beta. Syntax- en DOM-verwijzingscontroles zijn uitgevoerd.
Gerichte tests met nagebootste interface controleerden onder meer
campagneaanmaak, locatieplaatsen, schaalinvoer, zoekresultaten, selectie,
100 routes/locaties en zichtbaarheid van namen. Harptos-berekeningen zijn
getest over maand-, feestdag-, schrikkeljaar- en jaargrenzen.
De gebruiker heeft route-/locatieselectie en naamzichtbaarheid tijdens
interactief gebruik als werkend bevestigd.
Een volledige automatische interactieve browsertest is niet uitgevoerd;
alle opslag-, import- en downloadflows zijn niet opnieuw end-to-end getest.

Appversie: 0.9.5 Beta. dataVersion: 1. backupVersion: 1.
De optionele sessie-instelling timeMode bewaart de gekozen dagentelling.
Oudere appversies kennen de automatische Harptos-telling niet; gebruik
v0.9.5 Beta of nieuwer om die sessies correct te verwerken.

10. VERSIEBEHEER EN LATER
Deze README documenteert v0.9.5 Beta. Vanaf de volgende wijzigingsronde
wordt de appversie verhoogd: eerst v0.9.6 Beta. App, mapnaam, ZIP en README
krijgen hetzelfde versienummer; nieuwe versies komen naast de vorige.
Dataversies worden alleen verhoogd wanneer het opslagformaat dat vereist.
Een deelbare, offline werkende PWA via een vaste weblink is een idee voor
later en maakt geen onderdeel uit van deze versie.
