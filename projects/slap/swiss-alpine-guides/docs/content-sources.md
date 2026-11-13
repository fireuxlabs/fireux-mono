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
