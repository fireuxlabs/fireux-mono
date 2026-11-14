import { destinations } from './destinations'
import { tours } from './tours'

const pages = [
  {
    path: '/',
    title:
      'Premium Private Bike & E-bike Tours in Interlaken | Interlaken Bike Tours',
    description:
      'Compare premium private guided bike and e-bike rides in Interlaken, Lauterbrunnen Valley and around Lake Brienz. Plan your ride directly with a local guide.',
  },
  {
    path: '/destinations',
    title: 'Cycling Destinations & Custom Trips | Interlaken Bike Tours',
    description:
      'Explore cycling destinations around Interlaken, Lauterbrunnen and Lake Brienz, or enquire about a custom trip in Bern or Lausanne.',
  },
  ...destinations.map((destination) => ({
    path: `/destinations/${destination.slug}`,
    title: `${destination.name} Cycling ${destination.tourSlugs.length ? 'Tours' : 'Trip Enquiries'} | Interlaken Bike Tours`,
    description: destination.summary,
  })),
  ...tours.map((tour) => ({
    path: `/tours/${tour.slug}`,
    title: `${tour.name} Private Bike Tour | Interlaken Bike Tours`,
    description: `${tour.duration} private guided ride. From CHF ${tour.price} per person. ${tour.summary}`,
  })),
]

export function pageSeo(path: string) {
  const page = pages.find((page) => page.path === path)
  if (!page) throw new Error(`No page metadata for ${path}`)
  return page
}
