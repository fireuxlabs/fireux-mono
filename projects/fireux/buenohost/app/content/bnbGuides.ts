export type BnbGuideItem = {
  label?: string
  value: string
  tone?: 'default' | 'important' | 'warning'
}

export type BnbGuideSection = {
  id: string
  title: string
  summary: string
  icon: string
  priority?: boolean
  enabled?: boolean
  items: BnbGuideItem[]
}

export type BnbGuideTranslationRef = {
  source_app: 'buenohost'
  document_type: 'bnb-guide'
  document_slug: string
  source_language: 'en'
}

export type BnbGuide = {
  type: 'buenohost-bnb-guide'
  slug: string
  language: 'en'
  title: string
  translation_ref: BnbGuideTranslationRef
  guest_message?: {
    title: string
    subtitle?: string
  }
  property: {
    name: string
    type: string
    original_language: 'en'
    primary_language: 'en'
    manager: string
    phone: string
    email: string
    address: string
  }
  privacy_note: string
  footer: string
  sections: BnbGuideSection[]
}

export const standardBnbTopicIds = [
  'emergency',
  'wifi',
  'check-in',
  'checkout',
  'keys',
  'house-rules',
  'quiet-hours',
  'smoking',
  'heating-cooling',
  'kitchen',
  'appliances',
  'laundry',
  'bathroom',
  'parking',
  'rubbish-recycling',
  'shops',
  'restaurants',
  'transport',
  'things-to-do',
  'useful-contacts',
] as const

export const holidayWithNatsGuide: BnbGuide = {
  type: 'buenohost-bnb-guide',
  slug: 'holiday-with-nats',
  language: 'en',
  title: 'Holiday with Nats',
  translation_ref: {
    source_app: 'buenohost',
    document_type: 'bnb-guide',
    document_slug: 'holiday-with-nats',
    source_language: 'en',
  },
  guest_message: {
    title: 'Welcome Family Watson',
    subtitle: 'Today - 27th of March',
  },
  property: {
    name: 'Penthouse Holiday Apartment',
    type: 'BNB / guest guide',
    original_language: 'en',
    primary_language: 'en',
    manager: 'Apartment Manager Natalie',
    phone: '+41 78 604 69 00',
    email: 'bookwithnats@gmail.com',
    address: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
  },
  privacy_note:
    'Local proof content from the source manual. Phone and email should be confirmed before public deployment.',
  footer: 'Powered by BuenoHost.',
  sections: [
    {
      id: 'welcome',
      title: 'Welcome',
      summary: 'A quick welcome and the key host details for your stay.',
      icon: 'i-lucide-home',
      enabled: true,
      items: [
        { value: 'Welcome to the Penthouse Holiday Apartment.' },
        { label: 'Apartment Manager', value: 'Natalie' },
        { label: 'Phone', value: '+41 78 604 69 00', tone: 'important' },
        { label: 'Email', value: 'bookwithnats@gmail.com', tone: 'important' },
        {
          label: 'Address',
          value: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
        },
      ],
    },
    {
      id: 'emergency',
      title: 'Emergency',
      summary: 'Emergency equipment, medical contacts and urgent numbers.',
      icon: 'i-lucide-siren',
      priority: true,
      enabled: true,
      items: [
        { value: 'The apartment is fitted with smoke alarms.' },
        { value: 'Fire extinguisher: by the downstairs main entrance.' },
        { value: 'First aid kit: kitchen drawer to the right of the microwave.' },
        { value: 'Fire blanket: kitchen cupboard under the sink.' },
        { label: 'Police', value: '117', tone: 'important' },
        { label: 'Fire Department', value: '118', tone: 'important' },
        { label: 'Ambulance', value: '144', tone: 'important' },
        { label: 'Helicopter Rescue', value: '1414', tone: 'important' },
        { label: 'Interlaken Hospital', value: '+41 (0) 33 826 25 00', tone: 'important' },
        { label: 'Bahnhof Taxi', value: '+41 (0) 33 822 50 50' },
        { label: 'A Taxi', value: '+41 (0) 33 822 60 60' },
        {
          value:
            'Walk-in clinic: Interlaken West train station, Bahnhofstrasse 28, 3800 Interlaken.',
        },
        { value: 'HANI Emergency is available at Interlaken Hospital.' },
      ],
    },
    {
      id: 'wifi',
      title: 'Wi-Fi',
      summary: 'Internet access for guests.',
      icon: 'i-lucide-wifi',
      priority: true,
      enabled: true,
      items: [
        { label: 'Network', value: 'Penthouse', tone: 'important' },
        { label: 'Password', value: 'penthouse2020', tone: 'important' },
      ],
    },
    {
      id: 'house-rules',
      title: 'House Rules',
      summary: 'Simple rules to protect the apartment and respect neighbours.',
      icon: 'i-lucide-clipboard-check',
      enabled: true,
      items: [
        { value: 'Close all windows and doors before going out.' },
        { value: 'Water damage caused by rain may be charged.', tone: 'warning' },
        { value: 'Bathrooms are not wet rooms; please mop up water from floors.' },
        { value: 'Do not eat in bed or on the sofa.' },
        { value: 'Be thoughtful to neighbours.' },
        { value: 'No loud noise after 22:00.', tone: 'important' },
        { value: 'Leave the balcony by 22:00 because noise travels.' },
        { value: 'This is a non-smoking apartment.' },
        { value: 'Smoking is only allowed on the balcony. Please use the ashtray.' },
      ],
    },
    {
      id: 'checkout',
      title: 'Checkout',
      summary: 'What to do before leaving the apartment.',
      icon: 'i-lucide-door-open',
      priority: true,
      enabled: true,
      items: [
        { value: 'Check out by 10:00 unless agreed otherwise.', tone: 'important' },
        { value: 'Put leftover dishes in the dishwasher and start the cleaning cycle.' },
        { value: 'Return the key where you found it.' },
        {
          value: 'Extra cleaning or damage caused by neglect may be charged.',
          tone: 'warning',
        },
      ],
    },
    {
      id: 'heating-cooling',
      title: 'Heating & Cooling',
      summary: 'How to use the radiators responsibly.',
      icon: 'i-lucide-thermometer',
      enabled: true,
      items: [
        { value: 'Radiators have dials from 1 to 5.' },
        { value: 'Do not put the heating on high and open the windows.' },
        { value: 'Turn the heating off on departure.' },
      ],
    },
    {
      id: 'keys',
      title: 'Keys & Access',
      summary: 'Key safe instructions for going out and checking out.',
      icon: 'i-lucide-key-round',
      priority: true,
      enabled: true,
      items: [
        { value: 'The key safe box can be used when going out.' },
        { label: 'Code', value: '2020', tone: 'important' },
        { value: 'Never change the code.', tone: 'warning' },
      ],
    },
    {
      id: 'parking',
      title: 'Parking',
      summary: 'Parking and visitor parking information.',
      icon: 'i-lucide-car',
      enabled: true,
      items: [
        { value: 'Underground parking is available.' },
        { value: 'Do not leave the car engine running unnecessarily.' },
        { value: 'Temporary visitor parking is to the right of the main entrance.' },
      ],
    },
    {
      id: 'rubbish-recycling',
      title: 'Rubbish & Recycling',
      summary: 'How to recycle and dispose of general household rubbish.',
      icon: 'i-lucide-recycle',
      enabled: true,
      items: [
        { value: 'The recycling container is on the balcony.' },
        { value: 'Cardboard can go in recycling.' },
        { value: 'Do not put general garbage there.', tone: 'warning' },
        { value: 'No food containers.' },
        { value: 'Use the white AVAG bags provided under the sink.' },
        { value: 'Put full bags in the grey container outside by visitor parking.' },
        { value: 'Use the key to unlock the padlock.' },
        { value: 'Only white AVAG bags can go in the big bin.', tone: 'important' },
      ],
    },
    {
      id: 'apartment-info',
      title: 'Apartment Info',
      summary: 'Useful details about the apartment equipment and facilities.',
      icon: 'i-lucide-info',
      enabled: true,
      items: [
        { value: 'USB chargers are supplied; do not take or move installed chargers.' },
        { value: 'Dishwasher: select a program, add a dishwasher tab, then press start.' },
        { value: 'Never put washing-up liquid in the dishwasher.', tone: 'warning' },
        { value: 'Games and books are available; please treat them with respect.' },
        { value: 'The ironing board is on the landing between the bedrooms.' },
        { value: 'Tap water is 100% drinkable.' },
        { value: 'Cable TV and DVDs are available.' },
      ],
    },
    {
      id: 'local-information',
      title: 'Local Information',
      summary: 'Nearby shops, post office and bus stop details.',
      icon: 'i-lucide-map-pin',
      enabled: true,
      items: [
        { value: 'CO-OP supermarket is downstairs and open Mon-Sun 08:00-20:00.' },
        { value: 'The Post Office is inside CO-OP.' },
        { value: 'Lidl is open daily 08:00-21:00.' },
        { value: 'The bus stop is on the main street by Tells restaurant.' },
        { value: 'Use buses 104 and 105 for local connections.' },
      ],
    },
    {
      id: 'bike-rentals',
      title: 'Bike Rentals',
      summary: 'Bike and activity rental options nearby.',
      icon: 'i-lucide-bike',
      enabled: true,
      items: [
        { value: 'Amacher Bike Shop rents electric bikes.' },
        {
          value:
            'Daniels Fun Rentals offers mountain bikes, scooters, ATVs, funcars, e-bikeboards and quads.',
        },
      ],
    },
    {
      id: 'grocery-shopping',
      title: 'Grocery Shopping',
      summary: 'Easy grocery options around the apartment.',
      icon: 'i-lucide-shopping-basket',
      enabled: true,
      items: [
        { value: 'CO-OP supermarket is downstairs for everyday groceries.' },
        { value: 'Lidl is nearby and open daily 08:00-21:00.' },
        { value: 'Bring purchases back directly to the apartment and keep shared spaces clear.' },
      ],
    },
    {
      id: 'transport',
      title: 'Transport',
      summary: 'Simple walking directions and public transport pointers.',
      icon: 'i-lucide-train',
      enabled: true,
      items: [
        {
          label: 'Interlaken West',
          value:
            'Walk from Hobachergassli towards the main road, continue towards central Interlaken and follow signs for Interlaken West station.',
        },
        {
          label: 'Interlaken Ost',
          value:
            'Walk towards the main road and continue east through Interlaken, or take a local bus connection towards Interlaken Ost.',
        },
        { value: 'Bus 104/105 details should be confirmed against the current timetable.' },
      ],
    },
  ],
}

export const bnbGuides = [holidayWithNatsGuide] as const

export function resolveBnbGuide(slug: string): BnbGuide | null {
  return bnbGuides.find((guide) => guide.slug === slug) ?? null
}

export function getEnabledBnbSections(guide: BnbGuide): BnbGuideSection[] {
  return guide.sections.filter((section) => section.enabled !== false)
}

export function getBnbGuestTopics(guide: BnbGuide): BnbGuideSection[] {
  return getEnabledBnbSections(guide).filter((section) => section.id !== 'welcome')
}

export function resolveBnbSection(slug: string, sectionId: string): BnbGuideSection | null {
  const guide = resolveBnbGuide(slug)
  if (!guide) return null

  return getBnbGuestTopics(guide).find((section) => section.id === sectionId) ?? null
}
