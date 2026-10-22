import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'
export const metaContent = defineFireuxMeta({
  app: {
    id: 'interlaken-bike-tours',
    name: 'Interlaken Bike Tours',
    ecosystem: 'slap',
  },
  copy: {
    big_personality: 'Your kind of day.',
    headline: 'Private bike adventures in the Swiss Alps.',
    positioning_html:
      'Compare private guided rides around Interlaken, Lauterbrunnen and Lake Brienz.',
    promise_html: 'Plan your ride directly with your local guide.',
    workspace_bridge_html:
      'Tour enquiries open WhatsApp or your email app. Availability is confirmed by your guide.',
  },
  seo: {
    title: 'Interlaken Bike Tours',
    description:
      'Private guided bike tours in Interlaken and the Swiss Alps. Find your ride and enquire directly with your local guide.',
  },
})
