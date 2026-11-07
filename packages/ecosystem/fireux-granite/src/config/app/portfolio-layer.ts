import type { NuxtConfig } from '@nuxt/schema'

/** Native composition for the declared portfolio Workspace. */
export default {
  extends: [
    'fireux-properties/layer',
    'fireux-compliance/layer',
    'fireux-documents/layer',
    'fireux-tasks/layer',
    '../../runtime/nuxt.config.ts',
  ],
} satisfies NuxtConfig
