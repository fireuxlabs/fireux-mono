import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'ausfinn-apartments',
    name: 'AUSFinn Apartments',
    ecosystem: 'buenohost',
  },
  copy: {
    big_personality: 'AUSFinn Apartments',
    headline: 'Your place between the lakes and mountains.',
    positioning_html:
      'Distinctive apartments, houses and an alpine villa around Interlaken.',
    promise_html:
      'Find the right stay, ask about dates and speak directly with the AUSFinn team.',
    workspace_bridge_html:
      'BuenoHost property tools coordinate AUSFinn availability, guest information and operations.',
  },
  seo: {
    title: 'AUSFinn Apartments',
    description:
      'Apartments, houses and an alpine villa around Interlaken, Unterseen, Ringgenberg and Bönigen.',
  },
})
