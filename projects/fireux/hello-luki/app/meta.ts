import { defineFireuxMeta } from 'fireux-core/runtime/app/literature/define-meta'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'hello-luki',
    name: 'Hello Luki',
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'Hello Luki',
    headline: 'Hello Luki!',
    positioning_html: 'A tiny greeting built with FireUX.',
    promise_html: 'One prompt. One small App.',
    workspace_bridge_html: 'No Workspace is needed for this demo.',
  },
  seo: {
    title: 'Hello Luki!',
    description: 'A tiny greeting app created with FireUX.',
  },
})
