import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'baeren-ringgenberg',
    name: 'Hotel Bären Ringgenberg',
    ecosystem: 'misebox',
  },
  copy: {
    big_personality: 'Hotel Bären Ringgenberg',
    headline: 'Hotel, restaurant, bar, and menu in Ringgenberg.',
    positioning_html:
      'Hotel Bären Ringgenberg is a Misebox tenant app over the existing Bären kitchen.',
    promise_html:
      'Show the menu clearly and keep venue data connected to the Misebox ecosystem.',
    console_bridge_html:
      'Kitchen and menu records are managed through Misebox.',
  },
  seo: {
    title: 'Hotel Bären Ringgenberg',
    description: 'Menu and venue page for Hotel Bären Ringgenberg.',
  },
})
