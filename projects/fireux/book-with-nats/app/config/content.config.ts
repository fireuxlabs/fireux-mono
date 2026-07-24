export interface NatsProperty {
  id: string
  name: string
  eyebrow: string
  location: string
  summary: string
  sleeps?: number
  bedrooms?: number
  baths?: number
  image: string
  imageAlt: string
  highlights: readonly string[]
}

export const bookWithNatsContent = {
  brand: {
    name: 'Book with Nats',
    host: 'Nats',
    tagline: 'Stay somewhere with a little soul.',
  },
  properties: [
    {
      id: 'matten-central-family-suite',
      name: 'Matten Central Family Suite',
      eyebrow: 'A generous apartment for four',
      location: 'Matten bei Interlaken, Switzerland',
      summary:
        'A central family base for mountain days, shared meals and easy access to Interlaken.',
      sleeps: 4,
      image: '/img/app/apartment-hero.png',
      imageAlt:
        'Warm apartment living room looking toward a lake and mountain landscape',
      highlights: [
        'A comfortable base for up to four',
        'Central Matten location',
        'Private apartment living',
        'Personal recommendations from Nats',
      ],
    },
    {
      id: 'matten-central-studio',
      name: 'Matten Central Studio',
      eyebrow: 'A compact central stay',
      location: 'Matten bei Interlaken, Switzerland',
      summary:
        'A simple, well-placed studio for travellers who want Interlaken and the mountains close at hand.',
      image: '/img/app/apartment-hero.png',
      imageAlt: 'Alpine apartment with a warm interior and mountain view',
      highlights: [
        'Central Matten location',
        'Private studio space',
        'Easy base for exploring',
        'Personal recommendations from Nats',
      ],
    },
    {
      id: 'penthouse-holiday-apartment',
      name: 'The Penthouse Holiday Apartment',
      eyebrow: 'Space above the rooftops',
      location: 'Matten bei Interlaken, Switzerland',
      summary:
        'An elevated Matten apartment with room to settle in between days outdoors.',
      image: '/img/app/apartment-hero.png',
      imageAlt: 'Alpine apartment with a warm interior and mountain view',
      highlights: [
        'Penthouse apartment',
        'Matten location',
        'Private kitchen and living space',
        'Personal recommendations from Nats',
      ],
    },
    {
      id: 'wine-berry-views',
      name: 'Wine Berry Views',
      eyebrow: 'A southern Swiss escape',
      location: 'Rovio, Lugano, Switzerland',
      summary:
        'A quieter stay above Lugano for warm light, open views and a slower rhythm.',
      image: '/img/app/apartment-hero.png',
      imageAlt: 'Warm apartment interior looking toward lake and mountain views',
      highlights: [
        'Rovio hillside setting',
        'Views toward the Lugano landscape',
        'Private holiday apartment',
        'Personal recommendations from Nats',
      ],
    },
  ] satisfies readonly NatsProperty[],
  contact: {
    note:
      'Share your dates and a little about your trip. Nats will reply personally with availability and the next steps.',
  },
} as const

export const primaryNatsProperty = bookWithNatsContent.properties[0]!
