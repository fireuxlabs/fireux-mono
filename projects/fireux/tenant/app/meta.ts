import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const metaContent = defineFireuxMeta({
  app: {
    id: 'fireux-tenant',
    name: 'FireUX Tenant',
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'Tenant Runtime',
    headline: 'Thin FireUX child app.',
    positioning_html:
      'A minimal FireUX tenant runtime for validating auth, setup, and membership.',
    promise_html:
      'Keep tenant apps lean while FireUX owns the shared runtime spine.',
    console_bridge_html:
      'Tenant setup and ownership are managed through FireUX.',
  },
  seo: {
    title: 'FireUX Tenant',
    description:
      'Thin FireUX tenant child app for runtime setup, onboarding, and member access.',
  },
})
