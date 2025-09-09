import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useBreadcrumbs() {
  const route = useRoute()

  return computed(() => {
    // Hide breadcrumbs on the home page
    if (route.path === '/') {
      return []
    }

    // Default icons - using dummy data for now
    const homeIcon = 'i-lucide-home'
    const defaultIcon = 'i-lucide-link'

    const links = [{ label: 'Home', icon: homeIcon, to: '/' }]

    const lastMatch = route.matched[route.matched.length - 1] || {}
    const currentLabel =
  (lastMatch as any)?.meta?.breadcrumb || (route as any)?.name || (lastMatch as any)?.name || route.path

    const currentIcon = defaultIcon // Simple default for now

    links.push({
      label: String(currentLabel || ''),
      icon: currentIcon,
      to: route.path,
    })

    return links
  })
}
