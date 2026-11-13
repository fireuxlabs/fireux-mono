import { homeSearch } from './content/tour-pages'
import { defineFireuxMeta } from 'fireux-core/runtime/app/utils/define-app-meta'
export const metaContent = defineFireuxMeta({
  app: {
    id: 'swiss-alpine-guides',
    name: 'Swiss Alpine Guides',
    ecosystem: 'slap',
  },
  copy: {
    big_personality: 'Swiss Alpine Guides',
    headline: 'Heliskiing & Heliboarding',
    positioning_html:
      'Heliskiing and heliboarding tours with Swiss Alpine Guides, Interlaken.',
    promise_html:
      'Tour routes, flight counts, descent information, requirements and enquiries.',
    workspace_bridge_html:
      'Contact Swiss Alpine Guides for dates and reservations.',
  },
  seo: homeSearch,
})
