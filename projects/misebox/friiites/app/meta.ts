import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'friiites',
    name: 'Friiites',
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: 'Friiites',
    headline: 'Hand-cut. Brined. Triple-fried.',
    positioning_html:
      'Friiites is a simple fries place built around a repeatable kitchen method.',
    promise_html:
      'Potatoes are hand-cut, brined, and triple-fried in beef tallow.',
    console_bridge_html:
      'Misebox connects each location\'s recipes, preparation, menus, service, and orders.',
  },
  seo: {
    title: 'Friiites',
    description:
      'Hand-cut fries, brined and triple-fried in beef tallow. Developed in Switzerland.',
  },
})
