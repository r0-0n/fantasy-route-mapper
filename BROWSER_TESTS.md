# Extra controle 1.12.3

- Huisje met verspreide locaties/routes en lege kaart; vierde knop hele kaart.
- Einddatum rechtstreeks wijzigen en opslaan; controleer volgende sessies, halve dagen en beide kalenders.
- Nieuwe sessie begint bij vorige einddatum; bestaande duur/gaten blijven behouden bij doorschuiven.
- Sidebarvolgorde, vaste kleurdropdown en uniforme locatiecheckboxes.
- Logo campagneoverzicht opent/sluit infovenster met correcte links.

# Aanvullende controle 1.12.3

- Oude Inn/Village-campagne importeren: alle locaties behouden, type Village / Inn.
- Kies een vaste routekleur; nieuwe route en herladen behouden die voorkeur.
- Icoonmarkering uitschakelen/inschakelen: kaart en exportvoorbeeld volgen de instelling.
- Verberg route, locatie en afzonderlijke naam: exportvoorbeeld en PNG volgen elk hun instelling.
- Controleer het compacte exportvenster en sliders op smal en breed scherm.

# Aanvullende browsercontrole 1.12.3

- Controleer icoonachtergrond, gouden selectierand en korte markering via Toon op kaart op lichte/donkere kaartdelen en verschillende zoomniveaus.
- Open/hernoem een campagne: tabtitel verandert, favicon en koplogo blijven zichtbaar.
- Selecteer/sleep party: overzicht zichtbaar en geen tab geselecteerd; klik Locaties of Routes om terug te keren.
- Exportvoorbeeld: verander beide sliders, route-/locatiekeuze, naamweergave en uitsnede; vergelijk de gedownloade PNG met het laatste voorbeeld.
- Schuif snel heen en weer: alleen het nieuwste voorbeeld mag downloadbaar worden. Controleer foutmelding als renderen mislukt.

# Aanvullende browsercontrole 1.12.3

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
