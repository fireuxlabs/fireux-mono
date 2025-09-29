import { createSharedComposable } from '@vueuse/core'
import { ref, watch } from 'vue'
// Avoid #app in packages; try to use vue-router composables if available
let useRoute: (() => import('vue-router').RouteLocationNormalizedLoaded) | undefined
let useRouter: (() => import('vue-router').Router) | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('vue-router') as any
  useRoute = mod.useRoute
  useRouter = mod.useRouter
} catch {
  // No-op: in pure typecheck without runtime, these may be undefined; guarded below
}
// defineShortcuts is provided by @vueuse/nuxt in app context; type it loosely in packages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const defineShortcuts: (map: Record<string, () => any>) => void

const _useDashboard = () => {
  const route = useRoute ? useRoute() : ({} as any)
  const router = useRouter ? useRouter() : ({ push: () => {} } as any)
  const isNotificationsSlideoverOpen = ref(false)

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-i': () => router.push('/inbox'),
    'g-c': () => router.push('/customers'),
    'g-s': () => router.push('/settings'),
    n: () =>
      (isNotificationsSlideoverOpen.value =
        !isNotificationsSlideoverOpen.value),
  })

  watch(
    () => route.fullPath,
    () => {
      isNotificationsSlideoverOpen.value = false
    }
  )

  return {
    isNotificationsSlideoverOpen,
  }
}

export const useDashboard = createSharedComposable(_useDashboard)
export const useDashboardRoutes = useDashboard
