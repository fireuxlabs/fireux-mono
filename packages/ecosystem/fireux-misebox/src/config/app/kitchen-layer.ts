import type { NuxtConfig } from '@nuxt/schema'

/** Native composition for the declared kitchen Workspace. */
export default {
  extends: ['fireux-kitchens/layer', '../../runtime/nuxt.config.ts'],
} satisfies NuxtConfig
