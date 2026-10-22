import type { IgnitionSearchPlan } from 'fireux-ignite/runtime/models/ignition'
import { reviewSearchPlan } from 'fireux-ignite/runtime/utils/review-search-plan'
import { destinations } from '../content/destinations'
import { tours } from '../content/tours'

export const searchPlan: IgnitionSearchPlan = {
  mode: 'preview',
  origin: 'https://interlaken-bike-tours-prototype.web.app',
  owner: 'interlaken-bike-tours',
  geography: 'Interlaken, Lauterbrunnen and Lake Brienz, Switzerland',
  languages: ['en'],
  journeys: [
    {
      id: 'choose-ride',
      audience: 'Visitors considering a private guided bike or e-bike tour',
      intent:
        'Compare guided rides around Interlaken and understand route suitability',
      action: 'Choose a ride and prepare a direct enquiry to the guide',
      references: tours.map((tour) => tour.source),
    },
  ],
  pages: [
    {
      path: '/',
      journey: 'choose-ride',
      owner: 'interlaken-bike-tours',
      index: false,
      sitemap: false,
      title:
        'Private Bike & E-bike Tours in Interlaken | Interlaken Bike Tours',
      description:
        'Compare private guided bike and e-bike rides in Interlaken, Lauterbrunnen Valley and around Lake Brienz. Plan your ride directly with a local guide.',
    },
    {
      path: '/destinations',
      journey: 'choose-ride',
      owner: 'interlaken-bike-tours',
      index: false,
      sitemap: false,
      title: 'Cycling Destinations & Custom Trips | Interlaken Bike Tours',
      description:
        'Explore cycling destinations around Interlaken, Lauterbrunnen and Lake Brienz, or enquire about a custom trip in Bern or Lausanne.',
    },
    ...destinations.map((destination) => ({
      path: `/destinations/${destination.slug}`,
      journey: 'choose-ride',
      owner: 'interlaken-bike-tours',
      index: false,
      sitemap: false,
      title: `${destination.name} Cycling ${destination.tourSlugs.length ? 'Tours' : 'Trip Enquiries'} | Interlaken Bike Tours`,
      description: destination.summary,
    })),
    ...tours.map((tour) => ({
      path: `/tours/${tour.slug}`,
      journey: 'choose-ride',
      owner: 'interlaken-bike-tours',
      index: false,
      sitemap: false,
      title: `${tour.name} Private Bike Tour | Interlaken Bike Tours`,
      description: `${tour.duration} private guided ride. From CHF ${tour.price} per person. ${tour.summary}`,
    })),
  ],
  measurement: {
    status: 'planned',
    owner: 'interlaken-bike-tours',
    measures: [
      'Index coverage after approved release',
      'Organic impressions and clicks by public page',
      'Search queries leading to tour details',
    ],
  },
}

const review = reviewSearchPlan(searchPlan)
if (review.status !== 'declared') throw new Error(review.findings.join(' '))
export const searchPage = (path: string) => {
  const page = searchPlan.pages.find((page) => page.path === path)
  if (!page) throw new Error(`No reviewed search page for ${path}`)
  return page
}
