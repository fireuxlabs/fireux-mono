import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'fireux-template',
    name: 'FireUX Template',
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'App Starter',
    headline: 'A neutral FireUX app starter.',
    positioning_html:
      'FireUX Template is a minimal app starter with the baseline FireUX runtime.',
    promise_html:
      'Use it to validate shared pages, products, blogs, auth, and app shape.',
    console_bridge_html:
      'The template keeps app-local code small and shared behavior in FireUX.',
  },
  seo: {
    title: 'FireUX Template',
    description:
      'A neutral FireUX app starter for validating and extending the FireUX runtime.',
  },
})
