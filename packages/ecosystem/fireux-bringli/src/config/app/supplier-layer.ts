import type { NuxtConfig } from '@nuxt/schema'

/** Native composition for the declared supplier Workspace. */
export default {
  extends: ['fireux-suppliers/layer', '../../runtime/nuxt.config.ts'],
} satisfies NuxtConfig
