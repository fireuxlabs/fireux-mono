import { homeSearch } from './content/tour-pages'
import { defineFireuxMeta } from 'fireux-core/runtime/app/literature/define-meta'
export const metaContent = defineFireuxMeta({
  app: {
    id: 'swiss-alpine-guides',
    name: 'Swiss Alpine Guides',
    ecosystem: 'slap',
  },
  copy: {
    big_personality: 'Swiss Alpine Guides',
    headline: 'Mountain activities & courses',
    positioning_html:
      'Summer and winter mountain activities with Swiss Alpine Guides, Interlaken.',
    promise_html:
      'Guided activities, mountain courses, equipment rentals, gift vouchers and enquiries.',
    workspace_bridge_html:
      'Contact Swiss Alpine Guides for dates and reservations.',
  },
  seo: homeSearch,
})
