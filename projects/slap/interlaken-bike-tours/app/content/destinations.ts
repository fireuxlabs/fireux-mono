export const destinations = [
  {
    slug: 'interlaken',
    name: 'Interlaken',
    summary:
      'Start with a private ride between the lakes and through the surrounding villages.',
    description:
      'Choose the Interlaken Panorama ride for an introduction to the region. Discuss your cycling experience, preferred pace and meeting point with your guide before booking.',
    tourSlugs: ['interlaken-panorama'],
  },
  {
    slug: 'lauterbrunnen',
    name: 'Lauterbrunnen',
    summary: 'Explore the valley on a longer guided e-bike day.',
    description:
      'The Lauterbrunnen Valley ride is an existing tour option. Review its distance, duration and included equipment, then ask your guide whether it suits your group.',
    tourSlugs: ['lauterbrunnen-valley'],
  },
  {
    slug: 'lake-brienz',
    name: 'Lake Brienz',
    summary:
      'Consider a lakeside ride through Iseltwald towards Giessbach Falls.',
    description:
      'The Giessbach Waterfalls tour follows the Lake Brienz shore. Your guide can confirm the route, equipment and suitability for your group.',
    tourSlugs: ['giessbach-waterfalls'],
  },
  {
    slug: 'bern',
    name: 'Bern',
    summary: 'Ask about a custom cycling trip in Bern.',
    description:
      'Have Bern in mind? Send your preferred date, group size and cycling experience. The guide will confirm whether a custom trip can be arranged, including the route, meeting point, transport, equipment and price. No fixed itinerary or availability is advertised.',
    tourSlugs: [],
  },
  {
    slug: 'lausanne',
    name: 'Lausanne',
    summary: 'Discuss a custom cycling day in Lausanne with your guide.',
    description:
      'Planning time in Lausanne? Tell your guide where you will be staying, how long you have and what kind of ride you enjoy. Route suitability, travel arrangements, equipment and pricing need to be agreed directly before booking. This is an enquiry option rather than a scheduled tour.',
    tourSlugs: [],
  },
] satisfies {
  slug: string
  name: string
  summary: string
  description: string
  tourSlugs: string[]
}[]
export type Destination = (typeof destinations)[number]
