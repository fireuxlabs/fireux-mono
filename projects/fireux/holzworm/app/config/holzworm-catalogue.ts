export type HolzwormCategory =
  | 'Bern & Bärn'
  | 'Tier & Erinnerung'
  | 'Persönliche Geschenke'
  | 'Restaurant-QR'
  | 'Holz-Visitenkarten'

export interface HolzwormProductDraft {
  slug: string
  category: HolzwormCategory
  name: string
  description: string
  material: string
  variants: string
  customisation: string
  price: string
  fulfilment: string
  image: {
    src: string
    alt: string
  }
}

export const holzwormCategories: Array<{
  name: HolzwormCategory
  anchor: string
  description: string
}> = [
  { name: 'Bern & Bärn', anchor: 'bern-baern', description: 'Motive aus Bern.' },
  { name: 'Tier & Erinnerung', anchor: 'tier-erinnerung', description: 'Tierkonturen und Erinnerungsstücke.' },
  { name: 'Persönliche Geschenke', anchor: 'persoenliche-geschenke', description: 'Geschenke mit Gravur.' },
  { name: 'Restaurant-QR', anchor: 'restaurant-qr', description: 'QR-Aufsteller und Plaketten aus Holz.' },
  { name: 'Holz-Visitenkarten', anchor: 'holz-visitenkarten', description: 'Lasergravierte Holzkarten.' },
]

const productImage = (slug: string, alt: string) => ({
  src: `/img/app/holzworm/products/${slug}.jpg`,
  alt,
})

// Draft catalogue only: availability, final price, and production window require Holzworm confirmation.
export const holzwormProducts: HolzwormProductDraft[] = [
  { slug: 'baerner-baer-anhaenger', category: 'Bern & Bärn', name: 'Bärner Bär · Anhänger', description: 'Lasergravierter Anhänger für Schlüssel oder Geschenk.', material: 'Birke oder Nussbaum, lasergraviert', variants: 'ca. 60 mm · rund oder eckig', customisation: 'Vorname, Jahr oder kurze Rückseite', price: 'Preis offen', fulfilment: 'Einzelanfertigung; Lager und Lieferzeit offen', image: productImage('baerner-baer-anhaenger', 'Originaler Holzworm-Produktentwurf: Nussbaum-Anhänger in Bärenform mit Messingring') },
  { slug: 'aare-linienbild', category: 'Bern & Bärn', name: 'Aare · Linienbild', description: 'Holzbild mit Aare-Linienmotiv.', material: 'Pappelsperrholz oder Eiche', variants: 'A5, A4 oder Wunschformat', customisation: 'Ort, Datum oder Widmung nach Freigabe', price: 'Preis offen', fulfilment: 'Auf Anfrage; Produktionszeit offen', image: productImage('aare-linienbild', 'Originaler Holzworm-Produktentwurf: Eichenpanel mit abstraktem Aare-Linienmotiv') },
  { slug: 'alpenblume-untersetzer', category: 'Bern & Bärn', name: 'Alpenblume · Untersetzer', description: '4er-Set Untersetzer mit Alpenblumenmotiven.', material: 'Kork oder Birke', variants: '4er-Set · rund oder sechseckig', customisation: 'Initialen oder Gastnamen', price: 'Preis offen', fulfilment: 'Kleinserie möglich; Bestand offen', image: productImage('alpenblume-untersetzer', 'Originaler Holzworm-Produktentwurf: vier gravierte Holz-Untersetzer mit Alpenblumenmotiven') },
  { slug: 'berner-fensterbild', category: 'Bern & Bärn', name: 'Fensterbild · Bern', description: 'Holzbild mit Berner Stadt- und Fensterlinien.', material: 'Birke, geölt', variants: '150 × 150 mm oder 200 × 200 mm', customisation: 'Hausnummer oder Anlasszeile', price: 'Preis offen', fulfilment: 'Auf Anfrage; Motivfreigabe vor Produktion', image: productImage('berner-fensterbild', 'Originaler Holzworm-Produktentwurf: geöltes Birken-Fensterbild mit abstraktem Stadtraster') },
  { slug: 'hundekontur-marke', category: 'Tier & Erinnerung', name: 'Hundekontur · Marke', description: 'Marke mit Tierkontur nach Foto.', material: 'Nussbaum oder Birke', variants: 'ca. 35–45 mm · Kreis oder Knochenform', customisation: 'Name und Telefonnummer; Foto als Vorlage', price: 'Preis offen', fulfilment: 'Einzelanfertigung; Lieferzeit offen', image: productImage('hundekontur-marke', 'Originaler Holzworm-Produktentwurf: kleine Nussbaum-Hundemarke mit Konturlinie') },
  { slug: 'katzenname-ornament', category: 'Tier & Erinnerung', name: 'Katzenname · Ornament', description: 'Hängeornament mit Katzen-Silhouette.', material: 'Birke mit Baumwollkordel', variants: 'ca. 80 mm · 1- oder 2-lagig', customisation: 'Name, Jahr oder kurzes Zeichen', price: 'Preis offen', fulfilment: 'Einzelanfertigung; Lager offen', image: productImage('katzenname-ornament', 'Originaler Holzworm-Produktentwurf: Birken-Ornament mit Katzen-Silhouette und Baumwollkordel') },
  { slug: 'erinnerungspfote', category: 'Tier & Erinnerung', name: 'Erinnerungspfote', description: 'Gedenkplakette mit Pfotenlinie und Gravur.', material: 'Eiche oder Nussbaum', variants: '100 × 100 mm oder 150 × 150 mm', customisation: 'Name, Daten, kurze Widmung', price: 'Preis offen', fulfilment: 'Einzelanfertigung; Zeitfenster vorab klären', image: productImage('erinnerungspfote', 'Originaler Holzworm-Produktentwurf: dunkle Eichen-Gedenkplakette mit Pfotenlinie') },
  { slug: 'foto-kontur-rahmen', category: 'Tier & Erinnerung', name: 'Foto-Kontur · Rahmen', description: 'Fotorahmen mit Tierkontur.', material: 'Birke oder Eiche', variants: 'für 10 × 15 cm oder 13 × 18 cm Foto', customisation: 'Name und kleine Zeile', price: 'Preis offen', fulfilment: 'Fotoqualität und Freigabe nötig; Lieferzeit offen', image: productImage('foto-kontur-rahmen', 'Originaler Holzworm-Produktentwurf: heller Birken-Fotorahmen mit Tierkontur') },
  { slug: 'namensschild-kinderzimmer', category: 'Persönliche Geschenke', name: 'Namensschild · Kinderzimmer', description: 'Mehrlagiges Namensschild.', material: 'Birke, optional farbig hinterlegt', variants: 'ca. 250–400 mm breit', customisation: 'Vorname, Farbe, Motivrichtung', price: 'Preis offen', fulfilment: 'Auf Anfrage; Farb- und Textfreigabe nötig', image: productImage('namensschild-kinderzimmer', 'Originaler Holzworm-Produktentwurf: mehrlagiges Birken-Namensschild mit Waldformen ohne Schrift') },
  { slug: 'hochzeitsringbox', category: 'Persönliche Geschenke', name: 'Ringbox · Anlass', description: 'Holzbox für Ringe.', material: 'Nussbaum oder Eiche', variants: 'Einzel- oder Doppelmulde', customisation: 'Namen, Datum, kurze Innengravur', price: 'Preis offen', fulfilment: 'Einzelanfertigung; Vorlauf offen', image: productImage('hochzeitsringbox', 'Originaler Holzworm-Produktentwurf: offene Nussbaum-Ringbox mit zwei Mulden') },
  { slug: 'rezeptbrett-familie', category: 'Persönliche Geschenke', name: 'Rezeptbrett · Familie', description: 'Brett mit Rezept- oder Widmungsgravur.', material: 'Buche oder Eiche', variants: 'ca. 200 × 300 mm', customisation: 'Handschrift-Vorlage nach Lesbarkeitsprüfung', price: 'Preis offen', fulfilment: 'Vorlage und Nutzungsrecht der Handschrift erforderlich', image: productImage('rezeptbrett-familie', 'Originaler Holzworm-Produktentwurf: Buchenbrett mit nicht lesbaren Liniengravuren und Rosmarin') },
  { slug: 'jahrestag-koordinaten', category: 'Persönliche Geschenke', name: 'Koordinaten · Jahrestag', description: 'Holztafel mit Koordinaten, Datum und Namen.', material: 'Birke, Eiche oder Nussbaum', variants: '100 × 150 mm oder 150 × 200 mm', customisation: 'Koordinaten, Datum, Namen', price: 'Preis offen', fulfilment: 'Einzelanfertigung; Ortsangabe wird vom Auftraggeber bestätigt', image: productImage('jahrestag-koordinaten', 'Originaler Holzworm-Produktentwurf: Eichen-Tafel mit abstraktem Koordinatenraster und Messingpin') },
  { slug: 'tisch-qr-aufsteller', category: 'Restaurant-QR', name: 'Tisch-QR · Aufsteller', description: 'Tischaufsteller für einen bereitgestellten QR-Code.', material: 'Eiche oder Nussbaum', variants: 'Einzelaufsteller · Nummerierung möglich', customisation: 'Restaurantname, Tischnummer, gelieferter QR-Code', price: 'Angebot nach Stückzahl', fulfilment: 'QR-Ziel und Test liegen beim Restaurant; Produktionszeit offen', image: productImage('tisch-qr-aufsteller', 'Originaler Holzworm-Produktentwurf: Eichen-Tischaufsteller mit leerem QR-Feld') },
  { slug: 'menue-qr-plakette', category: 'Restaurant-QR', name: 'Menü-QR · Plakette', description: 'Plakette für einen vorhandenen Menülink.', material: 'Birke, Eiche oder Acryl-Holzverbund', variants: '100 × 150 mm oder 150 × 200 mm', customisation: 'Logo nur mit Nutzungsfreigabe; gelieferter QR-Code', price: 'Angebot nach Material und Menge', fulfilment: 'QR-Ziel und Test liegen beim Restaurant; Produktionszeit offen', image: productImage('menue-qr-plakette', 'Originaler Holzworm-Produktentwurf: helle Birkenplakette mit leerem QR-Feld') },
  { slug: 'reserviert-qr-block', category: 'Restaurant-QR', name: 'Reserviert + QR · Block', description: 'Doppelseitiger Tischblock mit Reserviert-Hinweis und QR-Fläche.', material: 'Nussbaum oder Eiche', variants: '60 × 90 × 25 mm', customisation: 'Tischnummer, Reserviert-Text, gelieferter QR-Code', price: 'Angebot nach Stückzahl', fulfilment: 'QR-Ziel und Test liegen beim Restaurant; Produktionszeit offen', image: productImage('reserviert-qr-block', 'Originaler Holzworm-Produktentwurf: doppelseitiger Nussbaum-Tischblock mit leerem QR-Feld') },
  { slug: 'weinliste-qr-klemme', category: 'Restaurant-QR', name: 'Weinliste-QR · Klemme', description: 'Kartenklemme für Weinliste und QR-Code.', material: 'Eiche oder Nussbaum', variants: 'für A6/A5-Karte · Einzel oder Serie', customisation: 'Name, Kategorie, gelieferter QR-Code', price: 'Angebot nach Stückzahl', fulfilment: 'QR-Ziel und Test liegen beim Restaurant; Produktionszeit offen', image: productImage('weinliste-qr-klemme', 'Originaler Holzworm-Produktentwurf: Eichen-Kartenklemme mit leerem QR-Feld und leerer Karte') },
  { slug: 'visitenkarte-nussbaum', category: 'Holz-Visitenkarten', name: 'Visitenkarte · Nussbaum', description: 'Lasergravierte Visitenkarte aus Nussbaumfurnier.', material: 'Nussbaumfurnier, lasergraviert', variants: '85 × 55 mm · ein- oder zweiseitig', customisation: 'Druckdaten/Logo mit Nutzungsrecht', price: 'Angebot nach Menge', fulfilment: 'Materialverfügbarkeit, Mindestmenge und Produktionszeit offen', image: productImage('visitenkarte-nussbaum', 'Originaler Holzworm-Produktentwurf: Nussbaum-Visitenkarte mit topografischen Linien') },
  { slug: 'visitenkarte-birke', category: 'Holz-Visitenkarten', name: 'Visitenkarte · Birke', description: 'Lasergravierte Visitenkarte aus Birkenfurnier.', material: 'Birkenfurnier, lasergraviert', variants: '85 × 55 mm · abgerundete Ecken optional', customisation: 'Name, Rolle, Kontaktdaten, QR nur nach Test', price: 'Angebot nach Menge', fulfilment: 'Datenprüfung nötig; Bestand und Lieferzeit offen', image: productImage('visitenkarte-birke', 'Originaler Holzworm-Produktentwurf: helle Birken-Visitenkarte mit Sonnenlinien') },
  { slug: 'karten-set-studio', category: 'Holz-Visitenkarten', name: 'Studio-Karten · Set', description: 'Holzkarten mit Papierhülle.', material: 'Birke oder Nussbaum mit Papierhülle', variants: '10, 25 oder 50 Karten als Richtwert', customisation: 'Seriennummer oder individuelle Namen', price: 'Angebot nach Ausführung', fulfilment: 'Menge, Papier und Versand vorab bestätigen', image: productImage('karten-set-studio', 'Originaler Holzworm-Produktentwurf: Nussbaumkarte in handgeschöpfter Papierhülle') },
  { slug: 'kontaktkarte-qr', category: 'Holz-Visitenkarten', name: 'Kontaktkarte · QR', description: 'Holzkarte für Kontaktdaten und QR-Code.', material: 'Nussbaum oder Birke', variants: '85 × 55 mm · einseitig', customisation: 'Daten, gelieferter QR-Code, optional Kurzlink', price: 'Angebot nach Menge', fulfilment: 'QR-Ziel und Test liegen beim Auftraggeber; Linkpflege bleibt beim Auftraggeber', image: productImage('kontaktkarte-qr', 'Originaler Holzworm-Produktentwurf: Nussbaum-Kontaktkarte mit leerem QR-Feld') },
]

export const holzwormAssetRecord = {
  source: 'Original AI-generated product concepts created for Holzworm with OpenAI image generation; no third-party image, logo, text, or design copied.',
  format: 'Each product card uses its own optimised 1254 × 1254 px JPEG image; the masthead uses one 1536 × 1024 px original product tableau plus a separate wood-rosette artwork.',
  optimisation: 'Generated PNG masters are converted to 1254 px card JPEG derivatives at quality 82 and 1536 px masthead JPEG derivatives at quality 84; catalogue images are lazy-loaded.',
}
