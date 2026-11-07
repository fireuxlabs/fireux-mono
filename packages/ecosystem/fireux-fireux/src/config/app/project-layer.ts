import type { NuxtConfig } from '@nuxt/schema'

/** Native Project and FireUX ecosystem composition. */
export default {
  extends: ['fireux-projects/layer', '../../runtime/nuxt.config.ts'],
} satisfies NuxtConfig
