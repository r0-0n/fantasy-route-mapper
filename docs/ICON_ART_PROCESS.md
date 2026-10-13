# Locatieafbeeldingen 1.56.0

Uitgangspunt: het door de gebruiker gekozen geschilderde kasteel met warme steen, roodbruine daken en duidelijke contouren. Generatie via de ingebouwde imagegen-tool, één beeld per subcategorie, met dezelfde kasteelreferentie. Geen pixelart.

De volledige bronbeelden staan buiten de app in `output/icon-art-v154`. De app gebruikt uitsluitend 48 × 48 PNG-bestanden; de weergave blijft 24, 32 of 48 CSS-pixels. De ingebedde catalogus voorkomt extra netwerkverkeer en maakt lokale spelerskaart-export mogelijk.

Promptset: elke rij uit icon-catalog.json wordt als onderwerp gebruikt in de volgende opdracht:

> One isolated fantasy map marker for [type], in category [category] (names are Dutch or English). Reference is STYLE ONLY, not its subject. Match warm ochre/russet/muted green palette, dimensional hand-painted fantasy game miniature and dark readable silhouette. Depict this subtype's most recognizable physical subject. For shops/trades use one large characteristic object (anvil, armor, weapon rack, potion, book, bread oven, barrel etc), not an interchangeable house. For geography depict that landscape. For 'Overig' depict an appropriate distinct generic subject in its category. Simple chunky masses, minimal fine detail: must remain legible at24px, app files48px. Centered square filling85%, truly transparent background, no text, circle, frame, badge, traffic sign or flat outline icon.

De eerste vier beelden gebruiken dezelfde stijlinstructies met een architecturaal hoofdkenmerk. Het kasteel is de eerder goedgekeurde referentie. De galerij location-art.html toont de daadwerkelijke gebruiksmaten. Visuele herkenbaarheid blijft een menselijke beoordeling; unieke bestanden alleen bewijzen dit niet.

Zes gerichte herzieningen voor herkenbaarheid gebruiken dezelfde referentie, maar vragen expliciet om uitsluitend het onderscheidende object in plaats van een huis:

- Taveerne: houten bierpul met schuim en klein vat.
- Restaurant: houten schaal met gebraden vogel en brood.
- Bakkerij: lage stenen broodoven met twee grote broden.
- Harnasmaker: stalen borstplaat op houten standaard; geen aambeeld.
- Boekhandel: groot open boek op lessenaar met twee gestapelde boeken.
- Stal: paardenhoofd en schouders boven een lage houten staldeur met stro; geen gereedschap of aambeeld.

Toegevoegde prompt: “Castle reference is ONLY material, warm color palette, hand-painted dimensional style and shading. DO NOT COPY its building or towers. Depict ONLY the requested objects, no house or castle, no scene, no text or badge. The MAIN distinctive object fills nearly the whole square. Designed for recognition at24px: chunky broad silhouette, 2-3 large masses, minimal details. Transparent background, centered. Warm fantasy ochre, russet wood, natural material colors. Not a flat vector pictogram.”

Vestingwerken hebben drie extra herzieningen met nadruk op een andere vorm dan de kasteelreferentie:
- Burcht: één lage massieve vierkante toren met plat gekanteeld dak en smalle deur, zonder puntdaken of zijtorens.
- Citadel: een hoge steile heuvel met drie boven elkaar liggende verdedigingsmuren en een kleine vierkante toptoren; verticaal gelaagd silhouet.
- Bolwerk: een lage brede hoekige vesting op donkere rotsen, één grote poort, twee korte vierkante bastions en een blauwe wimpel.

Prompttoevoeging: “Reference is ONLY warm painted material/rendering style, NOT architecture. It is critical this has a COMPLETELY DIFFERENT SILHOUETTE from the reference castle. Warm ochre and gray stone, dimensional hand-painted game asset. Designed for24px, max48px app image: only bold chunky masses, minimal detail, centered filling90% square, transparent background. No badge, frame or text. Do not copy the reference castle's composition.”

NPC is ten slotte vervangen door een portretbuste zonder kasteelreferentie: “ONE fantasy RPG map marker depicting an NPC PERSON: a friendly bearded human traveller's HEAD AND SHOULDERS, brown leather hood framing face, ochre cloak clasp. Clearly a human portrait bust, not a building, shop, stall, object, sign or whole scene. Warm dimensional hand-painted miniature game illustration, earthy ochre/russet/cream palette, dark clear silhouette, broad simple shapes, large readable face. Designed to read at24px, app max48px: very few details. Centered filling90% square transparent canvas. No text, badge or circular frame.”

Vanaf 1.56.0 staan de 127 verkleinde afbeeldingen uitsluitend ingebed in js/world-icons.js. De galerij leest dezelfde catalogus. Losse 48px-kopieën gaan niet meer mee. Het historische veld file in icon-catalog.json verwijst naar de oorspronkelijke generatievolgorde, niet naar bestanden in deze release.
