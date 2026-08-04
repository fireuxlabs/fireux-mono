import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'fireux-tenant',
    name: 'Michel AG Metallbau',
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'Metall- und Stahlbau',
    headline: 'Metallbau im Berner Oberland.',
    positioning_html:
      'Michel AG Metallbau berät, plant, fertigt, liefert und montiert Metallbauaufträge.',
    promise_html:
      'Stahlbau, Metallbau und Tore aus Goldswil.',
    console_bridge_html:
      'Kontakt und Öffnungszeiten auf einen Blick.',
  },
  seo: {
    title: 'Michel AG Metallbau | Goldswil',
    description:
      'Metall- und Stahlbau, Tore sowie Beratung, Planung und Montage in Goldswil im Berner Oberland.',
  },
})
