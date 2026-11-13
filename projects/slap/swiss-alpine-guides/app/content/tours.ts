// Operator website, checked 2026-11-12. English summaries preserve factual content.
// Prices conflict between language versions and are not treated as current quotes.
export const tourSources = {
  english:
    'https://www.swissalpineguides.ch/english/Heliskiing/heliskiing.html',
  german: 'https://www.swissalpineguides.ch/Deutsch/Heliskiing/heliskiing.html',
} as const
export const tours = [
  {
    id: 'ebnefluh-petersgrat',
    name: 'Ebnefluh & Petersgrat',
    route: 'Ebnefluh & Petersgrat',
    altitude: '3,900 / 3,200 m',
    tag: 'Skis & snowboards',
    flights: 2,
    distance: 'Up to 35 km',
    vertical: '4,000 m',
    season: 'February–May',
    description:
      'Ebnefluh via Aletschfirn to Langgletscher, then a second flight to Petersgrat and a descent towards Blatten or Stechelberg.',
    requirement: 'Experienced off-piste skiers and snowboarders.',
    source: tourSources.english,
  },
  {
    id: 'sustenlimi',
    name: 'Sustenlimi',
    route: 'Sustenlimi',
    altitude: '3,200 m',
    tag: 'Skiing',
    flights: 1,
    distance: '12 km',
    vertical: '2,000 m',
    season: 'February–April',
    description:
      'Flight from Steingletscher to Sustenlimi; descent towards Steingletscher and Gadmen. The operator also lists an optional second rotation.',
    requirement: 'Strong, experienced off-piste skiers.',
    source: tourSources.english,
  },
  {
    id: 'ebnefluh',
    name: 'Ebnefluh',
    route: 'Ebnefluh',
    altitude: '3,900 m',
    tag: 'Skiing',
    flights: 1,
    distance: '21 km',
    vertical: '2,400 m',
    season: 'February–May',
    description:
      'Flight from Gsteigwiler to Ebnefluh. Descent past Hollandia Hütte and along Langgletscher to Blatten.',
    requirement: 'Confident off-piste skiers.',
    source: tourSources.german,
  },
  {
    id: 'petersgrat-blatten',
    name: 'Petersgrat → Blatten',
    route: 'Petersgrat → Blatten',
    altitude: '3,200 m',
    tag: 'Skis & snowboards',
    flights: 1,
    distance: '10 km',
    vertical: '1,700 m',
    season: 'February–April',
    description:
      'Flight to Petersgrat; descent through Faflertal and Fafleralp to Blatten in Lötschental.',
    requirement: 'Experienced skiers and snowboarders, confident in deep snow.',
    source: tourSources.german,
  },
  {
    id: 'petersgrat-stechelberg',
    name: 'Petersgrat → Stechelberg',
    route: 'Petersgrat → Stechelberg',
    altitude: '3,200 m',
    tag: 'Experienced skiers',
    flights: 1,
    distance: '15 km',
    vertical: '2,300 m',
    season: 'February–April',
    description:
      'Flight to Petersgrat; descent via Tschingelgletscher and Oberhoren to Stechelberg in the Lauterbrunnen valley.',
    requirement: 'Experienced freeride skiers, confident in deep snow.',
    source: tourSources.german,
  },
] as const
