export type AusfinnStay = {
  id: string
  name: string
  type: 'Apartment' | 'House' | 'Villa'
  location: string
  summary: string
  detail: string
  bedrooms: number
  bathrooms: number
  image: string
  imageAlt: string
}

const images = {
  view: '/img/app/stays/ringgenberg-view.avif',
  dining: '/img/app/stays/window-dining.avif',
  villa: '/img/app/stays/alpine-bath.avif',
  house: '/img/app/stays/garden-house.avif',
  kitchen: '/img/app/stays/modern-kitchen.avif',
  apartment: '/img/app/stays/riverside-apartment.avif',
} as const

export const ausfinnContent = {
  email: 'AUSFinnApartments@gmail.com',
  locations: ['Interlaken', 'Unterseen', 'Ringgenberg', 'Bönigen'],
  stays: [
    {
      id: 'ringgenberg-studio',
      name: 'Ringgenberg Studio',
      type: 'Apartment',
      location: 'Ringgenberg',
      summary: 'A compact, newly renovated base close to the lake and station.',
      detail:
        'A fully equipped kitchen, generous sofa space, fast Wi-Fi and the mountains just outside.',
      bedrooms: 1,
      bathrooms: 1,
      image: images.dining,
      imageAlt:
        'Dining table beside an open window looking toward Ringgenberg church',
    },
    {
      id: 'ringgenberg-first-floor',
      name: 'Ringgenberg First Floor',
      type: 'Apartment',
      location: 'Ringgenberg',
      summary: 'A two-bedroom apartment for easy lake and mountain days.',
      detail:
        'Newly renovated, comfortably furnished and about 500 metres from Ringgenberg station.',
      bedrooms: 2,
      bathrooms: 1,
      image: images.view,
      imageAlt: 'Ringgenberg church, lake and mountains in the evening sun',
    },
    {
      id: 'ringgenberg-ground-floor',
      name: 'Castle Ground Floor',
      type: 'Apartment',
      location: 'Ringgenberg',
      summary: 'Two bedrooms and two bathrooms beside Ringgenberg castle.',
      detail:
        'A practical family apartment with a full kitchen, generous living room and the bus stop close by.',
      bedrooms: 2,
      bathrooms: 2,
      image: images.kitchen,
      imageAlt: 'Modern apartment kitchen with timber dining table',
    },
    {
      id: 'riverside-unterseen-one',
      name: 'Riverside One',
      type: 'Apartment',
      location: 'Unterseen',
      summary: 'A calm riverside stay near Interlaken West.',
      detail:
        'Two bedrooms, a full kitchen, laundry and a shared garden within walking distance of town.',
      bedrooms: 2,
      bathrooms: 1,
      image: images.apartment,
      imageAlt: 'Bright apartment kitchen and dining area',
    },
    {
      id: 'riverside-unterseen-two',
      name: 'Riverside Two',
      type: 'Apartment',
      location: 'Unterseen',
      summary: 'Space to settle in beside the river and Harder Kulm.',
      detail:
        'A comfortable two-bedroom apartment with fast Wi-Fi, laundry and a shared garden.',
      bedrooms: 2,
      bathrooms: 1,
      image: images.apartment,
      imageAlt: 'Bright riverside apartment with kitchen and dining table',
    },
    {
      id: 'garden-house',
      name: 'Garden House',
      type: 'House',
      location: 'Interlaken',
      summary: 'A private two-storey house with its own garden.',
      detail:
        'Two bedrooms, open-plan living and a quiet garden only a short walk from Interlaken West.',
      bedrooms: 2,
      bathrooms: 1,
      image: images.house,
      imageAlt: 'Characterful timber house living room and kitchen',
    },
    {
      id: 'riverside-town-house',
      name: 'Riverside Town House',
      type: 'House',
      location: 'Unterseen',
      summary: 'A generous riverside home for families and friends.',
      detail:
        'Four bedrooms, two kitchens, two bathrooms and shared garden space close to Interlaken West.',
      bedrooms: 4,
      bathrooms: 2,
      image: images.dining,
      imageAlt: 'Warm dining room with an alpine view',
    },
    {
      id: 'big-family-castle-house',
      name: 'Big Family Castle House',
      type: 'House',
      location: 'Ringgenberg',
      summary: 'Three connected apartments for one memorable group stay.',
      detail:
        'Five bedrooms, five bathrooms and three kitchens beside the castle, lake and village transport.',
      bedrooms: 5,
      bathrooms: 5,
      image: images.view,
      imageAlt: 'Ringgenberg castle and lake against the mountain ridge',
    },
    {
      id: 'alpine-guest-house',
      name: 'Alpine Guest House',
      type: 'Villa',
      location: 'Bönigen',
      summary: 'A 250-year-old alpine house made for gathering.',
      detail:
        'Five bedrooms, two bathrooms, original timber and stone, and mountain views from every side.',
      bedrooms: 5,
      bathrooms: 2,
      image: images.villa,
      imageAlt: 'Alpine guest house bathroom with stone walls and wooden bath',
    },
  ] satisfies readonly AusfinnStay[],
} as const

export const featuredAusfinnStays = [
  ausfinnContent.stays[1],
  ausfinnContent.stays[5],
  ausfinnContent.stays[8],
] as const
