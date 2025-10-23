// FILE: /packages/core/fireux-core/src/runtime/composables/app/utils/useBreadcrumbs.ts
import { computed } from 'vue'
import { useRoute, type RouteLocationMatched } from 'vue-router'

export function useBreadcrumbs() {
  const route = useRoute()

  return computed(() => {
    if (route.path === '/') return []

    const homeIcon = 'i-lucide-home'
    const defaultIcon = 'i-lucide-link'

    const links = [{ label: 'Home', icon: homeIcon, to: '/' }]

    const lastMatch: RouteLocationMatched | undefined =
      route.matched[route.matched.length - 1]

    const currentLabel =
      (lastMatch?.meta as any)?.breadcrumb ||
      route.name ||
      lastMatch?.name ||
      route.path

    links.push({
      label: String(currentLabel || ''),
      icon: defaultIcon,
      to: route.path,
    })

    return links
  })
}
