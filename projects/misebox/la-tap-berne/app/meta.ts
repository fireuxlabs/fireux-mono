import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'la-tap-berne',
    name: 'La Tap Berne',
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: 'La Tap Berne',
    headline: 'Bar, food, and menu in Bern.',
    positioning_html:
      'La Tap Berne is a Misebox tenant app for venue and menu surfaces.',
    promise_html:
      'Show the menu clearly and keep venue data connected to the Misebox ecosystem.',
    console_bridge_html:
      'Kitchen and menu records are managed through Misebox.',
  },
  seo: {
    title: 'La Tap Berne',
    description: 'Menu and venue page for La Tap Berne.',
  },
})
