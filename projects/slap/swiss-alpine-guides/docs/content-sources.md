# Swiss Alpine Guides content sources

Checked: 2026-11-12. Role: source map for App-authored factual English summaries.
Operator source remains distinct from reviewed current prices or live availability.

- English tour page: https://www.swissalpineguides.ch/english/Heliskiing/heliskiing.html
- German tour page: https://www.swissalpineguides.ch/Deutsch/Heliskiing/heliskiing.html
- Original supplied page: https://www.swissalpineguides.ch/Deutsch/Heliboarding/default.html
- Current home/contact and season notices: https://www.swissalpineguides.ch/

`app/content/tours.ts` reorganizes five published routes: the Ebnefluh/Petersgrat
combination, Sustenlimi, Ebnefluh, Petersgrat–Blatten and Petersgrat–Stechelberg.
Flight counts, elevations, descent distances, vertical descent, seasons and
requirements come from those pages. Sustenlimi remains on the linked English
page. German wording establishes the experienced-skier-only framing for
Stechelberg. Some spellings are normalized for readability.

The landing, information section, enquiry introduction and metadata use factual
activity names, route details, equipment, IVBV guide information and published
contact details. The App does not add new slogans, invented tour names,
testimonials or claims about current departures. Form labels and draft-only
feedback describe actual prototype behavior.

The source pages conflict on prices: the combination is listed at CHF 430 in
the main tour pages, while single tours show CHF 330 in English and CHF 350 in
German. An older page footer also contains CHF 425 for the combination. The
prototype therefore asks visitors to confirm pricing with the operator and does
not turn any of these rates into a current quote or payment obligation.

The published heliskiing contact is heli1@swissalpineguides.ch, with the general
info@swissalpineguides.ch address also shown. Phone and WhatsApp come from the
operator’s current contact section. No outbound enquiry is sent automatically.
Refresh this map and the consuming App copy together when operator sources or
approved content change. Keep image/video provenance beside its asset masters.

The four `/heliskiing/*` detail pages project these same five route records.
Petersgrat combines the two descents in one comparison page. Planning answers
reuse published requirements, equipment, inclusions and contact arrangements.
The metadata and connected LocalBusiness/WebSite/WebPage/Service graph use the
same visible facts. No current offers, ratings, availability or expert biographies
are invented. Search-oriented headings are navigation summaries, not new tour names.

## Full-site migration · checked 13 November 2026

The source inventory now includes the current German and English homepages,
all linked activity pages, terms, vouchers, rentals, the original News page and
older reachable references. `original-source-inventory.json` records successful,
archived and broken URLs. No documents/PDFs were linked by the inspected pages.
The original News page contains contact details rather than a dated article feed.

`activities.json` contains 17 activity families, 44 non-heli programmes and the
heli catalogue doorway. The five existing heli routes remain in `tours.ts`.
Both languages were compared: German-only additions include Tierbergli via
ferrata, Steingletscher's two-day trek, Sustenlimi heli-hiking, lead climbing,
private rock/glacier training and one-day crevasse rescue. Duplicate references
to Breithorn and heli hikes are cross-referenced rather than silently discarded.

The 15 available activity photographs were copied byte-for-byte from original
page images. `imageSource` records each original URL. The old rafting photo could
not be retrieved and canyoning has no working detailed page, so neither is given
an unrelated replacement photo. The animated mountain entrance remains generated.

Published price tables are reference information, not current Offers. Examples
of conflicts include snowshoe prices, paragliding, private mountain courses,
heli-hiking seasons, glacier-tour packages and different meeting addresses.
Current contact/base facts follow the current German homepage. Past ski-tour
2024 and waterfall-climbing 2026 dates remain labelled as historical; conflicting
2026/2027 course entries are labelled rather than silently repaired.

Rentals retain the original one-/two-day equipment table and conflicting source
notes. Vouchers retain ordering details, payment activation, three-year validity
and the German two-year extension reference. Terms are reorganised summaries
with both complete originals linked. External safety, glacier, equipment, webcam
and booking-calendar references are retained under Resources; no external booking
or payment integration is represented as local functionality.

This is an English presentation of the bilingual source information. It does
not advertise unreviewed German route variants or hreflang alternates. Original
German references remain linked. Operator review of current arrangements and a
production-domain migration are still separate from preview publication.
