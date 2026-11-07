import type { NuxtConfig } from '@nuxt/schema'

/** Native composition for the declared property Workspace. */
export default {
  extends: [
    'fireux-properties/layer',
    'fireux-reservations/layer',
    '../../runtime/nuxt.config.ts',
  ],
} satisfies NuxtConfig
