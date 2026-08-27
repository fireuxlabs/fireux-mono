import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'sharer-app',
    name: 'Sharer',
    ecosystem: 'sharer',
  },
  copy: {
    big_personality: 'Share in person',
    headline: 'Your links, ready to share.',
    positioning_html:
      'Save your social and contact links, then open one screen whenever someone wants to follow you.',
    promise_html:
      'Show one profile QR or open a direct QR for a single link.',
    workspace_bridge_html:
      'The free Sharer App carries Sharer branding. A premium business gets its own branded PWA.',
  },
  seo: {
    title: 'Sharer',
    description:
      'Save your links and keep them ready to share from one installed App.',
  },
})
