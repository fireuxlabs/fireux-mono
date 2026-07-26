import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'book-with-nats',
    name: 'Book with Nats',
    ecosystem: 'buenohost',
  },
  copy: {
    big_personality: 'Book with Nats',
    headline: 'Stay somewhere with a little soul.',
    positioning_html:
      'A personal BuenoHost booking and contact surface for Nats’ apartment.',
    promise_html:
      'Make it easy to understand the stay, ask about dates and speak directly with Nats.',
    console_bridge_html:
      'BuenoHost property tools can manage this apartment and future stays through the shared property family.',
  },
  seo: {
    title: 'Book with Nats',
    description:
      'A warm private apartment in the Swiss Alps, hosted personally by Nats.',
  },
})
