import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'yellow-velo',
    name: 'Yellow Velo',
    ecosystem: 'slap',
  },
  copy: {
    big_personality: 'Ride Yellow',
    headline: 'Bicycles, kit, and daily ride goods.',
    positioning_html:
      'Yellow Velo is a bicycle company for city riders, weekend climbers, and anyone who wants gear that looks good off the bike too.',
    promise_html:
      'Shop tuned bicycles, useful accessories, and simple merchandise with a crisp Slap storefront.',
    console_bridge_html:
      'Yellow Velo keeps app-local brand pages small while products, stories, SEO, and runtime surfaces stay reusable.',
  },
  seo: {
    title: 'Yellow Velo',
    description:
      'Yellow Velo sells modern bicycles, cycling accessories, and merchandise for everyday riders.',
  },
})
