// packages/core/fireux-core/src/runtime/composables/app/nav/useNav.ts
import { computed } from 'vue'

// Nuxt auto-imports; declare for type-safety in packages
declare function useRouter(): { getRoutes: () => any[] }

type Item = { label: string; icon?: string; to: string }

export function useNav() {
  const router = useRouter()
  const routes = computed(() => router.getRoutes())

  const byKey = computed(() => {
    const map = new Map<string, any>()
    for (const r of routes.value) {
      const nav = r.meta?.nav
      if (nav?.key) map.set(nav.key, r)
    }
    return map
  })

  const toItem = (r: any): Item => ({
    label: r.meta.nav.label ?? r.path,
    icon: r.meta.nav.icon,
    to: r.path,
  })

  // Desktop: just the basics in fixed order
  const BASICS = ['home', 'products', 'blog']
  const desktop = computed<Item[]>(() =>
    BASICS.map((k) => byKey.value.get(k))
      .filter(Boolean)
      .map(toItem)
  )

  // Mobile: basics + any route that declares mobile:true
  const mobile = computed<Item[]>(() => {
    const extras = routes.value
      .filter((r) => r.meta?.nav?.mobile === true)
      .filter((r) => !BASICS.includes(r.meta.nav.key))
      .map(toItem)
    return [...desktop.value, ...extras]
  })

  return { desktop, mobile }
}
