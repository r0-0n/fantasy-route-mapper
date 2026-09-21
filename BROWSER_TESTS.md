# Browsercontrole voor een release

Status: nog niet uitgevoerd voor deze oplevering. Automatische tests gebruiken een gesimuleerde DOM.

Gebruik een aparte testcampagne en fictieve data. Noteer datum, browser/versie, bestands- of webadres en resultaat per stap.

- Open de volledig uitgepakte index.html lokaal zonder server. Controleer styling, versie en consolefouten.
- Maak een campagne, laad een testkaart en stel de schaal in. Teken/bewerk een route en plaats/verplaats een locatie.
- Registreer sessienummer, speeldatum en 6 in-game dagen bij een route met een andere geschatte reistijd. Controleer het totaal; herhaal met 0 dagen en Harptos-datums.
- Controleer opslaan en herladen: campagne, kaart, routes, locaties, schaal en reisregistraties blijven bewaard.
- Exporteer een volledige backup. Open de importpreview, annuleer en controleer dat niets is toegevoegd. Importeer opnieuw en bevestig: een kopie verschijnt met kaart en gegevens.
- Herhaal met een backup van alle testcampagnes en een oude compatibele campagnebackup. Controleer afwijzing van ongeldige JSON/toekomstige dataversies.
- Controleer HTML-/Markdown-logboek en PNG-spelerskaart door de gedownloade bestanden te openen.
- Controleer kaartmodus, afronden, annuleren en Escape; controleer dat 'Stop tekenen' de punten behoudt.
- Herhaal relevante stappen op de gehoste versie na een afzonderlijk geautoriseerde publicatie.

Leg fouten en niet-uitgevoerde stappen vast. Een geslaagde npm-test vervangt deze browsercontrole niet.

- Controleer routeoverzicht: meerdere routes, lange namen, zoeken/filteren/sorteren, selecteren, hernoemen en verwijderen. Controleer Toon met en zonder kaart/punten en de eenvoudige dropdown.

- 1.3.0: controleer paneel links naast de editor, openen/sluiten/Escape, focus, filteren en Toon. Test ook smalle schermen, zijbalk inklappen en campagnes wisselen. Controleer dat de instructiebalk verdwijnt na afronden/annuleren van een kaartactie.

- 1.3.2: controleer gecombineerde schaal/opslagstatus, ook zonder kaart en op smal scherm; geen dubbele opslagmelding in de bovenbalk.
