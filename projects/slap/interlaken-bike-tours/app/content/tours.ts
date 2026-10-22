export const tours = [
  {
    slug: 'interlaken-panorama',
    name: 'Interlaken Panorama',
    label: 'The perfect first ride',
    duration: '4 hours',
    distance: '23 km',
    difficulty: 'Easy',
    elevation: '100 m',
    price: 159,
    image: '/images/lake.webp',
    alt: 'Lake Thun and the mountains surrounding Interlaken',
    summary:
      'Two lakes, quiet villages and a different view around every bend.',
    description:
      'Ride between Lakes Thun and Brienz, through Bönigen, Wilderswil and Unterseen. Riverside paths, woodland and Swiss farmland make this a varied introduction to the region.',
    included: ['E-bike or regular bike', 'Helmet', 'Local professional guide'],
    source: 'https://www.interlakenbiketours.com/interlaken-panorama-tour',
  },
  {
    slug: 'lauterbrunnen-valley',
    name: 'Lauterbrunnen Valley',
    label: 'Into waterfall country',
    duration: '6 hours',
    distance: '36 km',
    difficulty: 'Easy / medium',
    elevation: '350 m',
    price: 259,
    image: '/images/valley.webp',
    alt: 'Alpine cliffs and the green Lauterbrunnen valley',
    summary:
      'Follow the river into a valley of towering cliffs and waterfalls.',
    description:
      'Explore the Lauterbrunnen Valley by e-bike, with riverside riding, alpine meadows and time to stop for the views. This longer ride includes a picnic.',
    included: ['E-bike', 'Helmet', 'Local professional guide', 'Picnic'],
    source: 'https://www.interlakenbiketours.com/lauterbrunnen-valley-tour',
  },
  {
    slug: 'giessbach-waterfalls',
    name: 'Giessbach Waterfalls',
    label: 'Take the lakeside road',
    duration: '6 hours',
    distance: null,
    difficulty: null,
    elevation: null,
    price: 259,
    image: '/images/waterfall.webp',
    alt: 'Water cascading down the Giessbach Falls',
    summary:
      'Turquoise Lake Brienz, the village of Iseltwald and a waterfall finale.',
    description:
      'Follow the shore of Lake Brienz through Iseltwald to Giessbach Falls on a private e-bike ride. Ask your guide about the route, equipment and suitability when planning your day.',
    included: [],
    source: 'https://www.interlakenbiketours.com/giessbach-waterfalls-tour',
  },
] as const
export type Tour = (typeof tours)[number]
export const enquiryUrl = (subject: string) =>
  'https://wa.me/41764659530?text=' + encodeURIComponent(subject)
