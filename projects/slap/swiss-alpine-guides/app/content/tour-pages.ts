import { tours } from './tours'

export const homeSearch = {
  title: 'Heliskiing & Heliboarding in Interlaken | Swiss Alpine Guides',
  description: 'Compare Swiss Alpine Guides heliskiing and heliboarding routes from Interlaken: Ebnefluh, Petersgrat and Sustenlimi. View descents, requirements and enquiry options.',
}

export const tourPages = [
  { slug: 'ebnefluh-petersgrat', name: 'Ebnefluh & Petersgrat', title: 'Ebnefluh & Petersgrat Heliskiing Combination | Swiss Alpine Guides', description: 'Two flights and two guided descents with Swiss Alpine Guides: Ebnefluh and Petersgrat. Compare the route, up to 35 km of descent, requirements and enquiry options.', routeIds: ['ebnefluh-petersgrat'] },
  { slug: 'ebnefluh', name: 'Ebnefluh heliskiing', title: 'Ebnefluh Heliskiing from Interlaken | Swiss Alpine Guides', description: 'Explore the Ebnefluh heliskiing route with Swiss Alpine Guides: a flight from Gsteigwiler and a 21 km descent towards Blatten. View requirements and enquire.', routeIds: ['ebnefluh'] },
  { slug: 'petersgrat', name: 'Petersgrat heliskiing & heliboarding', title: 'Petersgrat Heliskiing: Blatten & Stechelberg | Swiss Alpine Guides', description: 'Compare Petersgrat descents to Blatten and Stechelberg: route distances, vertical descent, ski and snowboard requirements, and enquiries with Swiss Alpine Guides.', routeIds: ['petersgrat-blatten', 'petersgrat-stechelberg'] },
  { slug: 'sustenlimi', name: 'Sustenlimi heliskiing', title: 'Sustenlimi Heliskiing: Steingletscher & Gadmen | Swiss Alpine Guides', description: 'View Swiss Alpine Guides’ Sustenlimi heliskiing route: a flight from Steingletscher and a 12 km descent towards Gadmen, with an optional second rotation.', routeIds: ['sustenlimi'] },
].map(page => ({ ...page, path: `/heliskiing/${page.slug}`, routes: tours.filter(tour => page.routeIds.includes(tour.id)) }))

export type TourPage = (typeof tourPages)[number]
export function tourPageForRoute(id: string) {
  const page = tourPages.find(page => page.routeIds.includes(id))
  if (!page) throw new Error(`No public tour page for ${id}`)
  return page
}

export const tourPlanning = [
  { label: 'What experience is required?', content: 'These are guided off-piste descents. Check the requirement for your chosen route and describe your skiing or snowboarding experience when enquiring. Stechelberg is listed for experienced freeride skiers; the Petersgrat route to Blatten is also listed for snowboarders.' },
  { label: 'When can a tour depart?', content: 'The published route seasons are shown above. Every departure depends on suitable snow and weather conditions. Ask Swiss Alpine Guides to confirm your preferred date and the current season’s arrangements.' },
  { label: 'What is included?', content: 'The operator lists the helicopter flight or flights, an IVBV mountain guide, the guided descent and a harness. Return transport is additional. Participants arrange their own insurance.' },
  { label: 'What equipment should I bring?', content: 'Bring complete ski or snowboard equipment, an avalanche transceiver, backpack, goggles, food, a drink and sun protection. Snowboarders should also bring telescopic poles. Confirm any rental needs with the operator.' },
  { label: 'Where do we meet and how much does it cost?', content: 'The meeting point is arranged in Interlaken. The operator’s website lists a minimum of seven participants and private mountain guides on request. Its language versions show conflicting prices, so confirm the current price, equipment and departure directly with Swiss Alpine Guides.' },
]
