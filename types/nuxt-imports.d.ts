declare module '#imports' {
  export * from 'nuxt/app'
  export { useAdminMetrics } from 'fireux-core/runtime/composables/admin/useAdminMetrics.ts'
}

declare module '#pwa' {
  export * from '@vite-pwa/nuxt/dist/runtime/composables/index.d.ts'
}
