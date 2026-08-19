import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: { id: 'lifeguard-community', name: 'Lifeguard Community', ecosystem: 'fireux' },
  copy: {
    big_personality: 'Lifeguard Community',
    headline: 'A community for lifeguards.',
    positioning_html: 'A member space for professional discussion and extracurricular learning.',
    promise_html: 'Join discussions, enrol in community programmes, and see your participation in one place.',
    console_bridge_html: 'Programme completion and merchandise eligibility are community records, not professional credentials.',
  },
  seo: {
    title: 'Lifeguard Community',
    description: 'A member community for lifeguard discussion and extracurricular learning.',
  },
})
