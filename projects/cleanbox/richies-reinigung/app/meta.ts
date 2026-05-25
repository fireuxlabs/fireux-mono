import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'richies-reinigung',
    name: 'Richies',
    ecosystem: 'cleanbox',
  },
  copy: {
    big_personality: 'Cleaning That Shows',
    headline: 'Reliable cleaning in the mountains.',
    positioning_html:
      'Richies Reinigung provides professional cleaning services for homes and businesses in Interlaken, Lauterbrunnen, and Wengen.',
    promise_html:
      'Simple contact, clear service, and reliable cleaning for recurring and one-off jobs.',
    console_bridge_html:
      'Richies is a tenant app in the Cleanbox ecosystem.',
  },
  seo: {
    title: 'Richies Reinigung - Cleaning services in Interlaken',
    description:
      'Professional cleaning services for homes and businesses in Interlaken, Lauterbrunnen, and Wengen.',
  },
})
