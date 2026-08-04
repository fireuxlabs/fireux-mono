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
      'FireUX Blank exists to test the console shell with one minimal read-only Demo target, its Identity Operation, and no child records.',
    promise_html:
      'Keep the console boring first. Then real console families can copy the proven shape.',
    console_bridge_html: 'Blank is a harness, not a product family.',
  },
  seo: {
    title: 'FireUX Blank',
    description:
      'A clean FireUX console spine harness with one minimal Demo target, its Identity Operation, and no test data.',
  },
  operations: [
    {
      id: 'blank.identity',
      slug: 'identity',
      title: 'Identity',
      description: 'Review the selected Blank target identity.',
      to: '/console/blank/identity',
      console: {
        id: 'blank',
        name: 'Blank console',
        to: '/console/blank',
      },
      icon: 'i-lucide-info',
    },
  ],
})
