import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'interlaken-essen',
    name: 'Interlaken Essen',
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: 'Interlaken Essen',
    headline: 'Local food, offered nearby.',
    positioning_html:
      'A simple marketplace for food made, grown, and shared around Interlaken.',
    promise_html:
      'Help neighbours and local businesses find each other, buy locally, and waste less food.',
    console_bridge_html:
      'Marketplace tools will be added only after the local community proves what it needs.',
  },
  seo: {
    title: 'Interlaken Essen',
    description:
      'A local marketplace for food made, grown, and shared around Interlaken.',
  },
})
