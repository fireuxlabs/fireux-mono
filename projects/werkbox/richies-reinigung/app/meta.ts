// Concurrent edit — 2026-07-21 12:17 CEST — Cleanbox-to-Werkbox app migration: preserve Richies identity under Werkbox.
import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'richies-reinigung',
    name: 'Richies',
    ecosystem: 'werkbox',
  },
  copy: {
    big_personality: 'Cleaning That Shows',
    headline: 'Reliable cleaning in the mountains.',
    positioning_html:
      'Richies Reinigung provides professional cleaning services for homes and businesses in Interlaken, Lauterbrunnen, and Wengen.',
    promise_html:
      'Simple contact, clear service, and reliable cleaning for recurring and one-off jobs.',
    console_bridge_html:
      'Richies is a branded cleaning tenant inside the general Werkbox practical-work hub.',
  },
  seo: {
    title: 'Richies Reinigung - Cleaning services around Interlaken',
    description:
      'Professional cleaning services for homes and businesses in Interlaken, Lauterbrunnen, and Wengen.',
  },
})
