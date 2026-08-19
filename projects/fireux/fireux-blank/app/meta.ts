import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'fireux-blank',
    name: 'FireUX Blank',
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'Blank Console',
    headline: 'A clean console spine harness.',
    positioning_html:
      'FireUX Blank exists to test the Console baseline with one minimal read-only Demo target and no entity-specific Operations.',
    promise_html:
      'Keep the console boring first. Then real console families can copy the proven shape.',
    console_bridge_html: 'Blank is a harness, not a product family.',
  },
  seo: {
    title: 'FireUX Blank',
    description:
      'A clean FireUX Console spine harness with one minimal Demo target, the baked-in capabilities, and no test data.',
  },
  operations: [],
})
