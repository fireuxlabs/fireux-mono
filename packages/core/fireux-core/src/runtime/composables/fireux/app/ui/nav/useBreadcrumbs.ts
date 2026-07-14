import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFireUXConfig } from '../../FireUXConfig'

export interface FireuxBreadcrumbItem {
  label: string
  icon?: string
  to?: string
}

type BreadcrumbMeta = {
  breadcrumb?: string | false
  nav?: { label?: string }
  title?: string
}

const text = (value: unknown) => String(value ?? '').trim()

function segmentLabel(segment: string) {
  let decoded = segment
  try {
    decoded = decodeURIComponent(segment)
  } catch {
    // Keep malformed route text visible rather than breaking navigation chrome.
  }

  return decoded
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

function metaLabel(meta: BreadcrumbMeta | undefined) {
  if (!meta || meta.breadcrumb === false) return ''
  return text(meta.breadcrumb || meta.nav?.label || meta.title)
}

export function useBreadcrumbs(
  currentLabel?: MaybeRefOrGetter<string | undefined>
) {
  const route = useRoute()
  const router = useRouter()
  const { appShortName } = useFireUXConfig()

  const items = computed<FireuxBreadcrumbItem[]>(() => {
    const path = text(route.path) || '/'
    if (path === '/') return []

    const segments = path.split('/').filter(Boolean)
    const breadcrumbs: FireuxBreadcrumbItem[] = [
      {
        label: appShortName,
        icon: 'i-lucide-house',
        to: '/',
      },
    ]

    segments.forEach((segment, index) => {
      const to = `/${segments.slice(0, index + 1).join('/')}`
      const isCurrent = index === segments.length - 1
      const resolved = router.resolve(to)
      const record = resolved.matched[resolved.matched.length - 1]
      const meta = (isCurrent ? route.meta : record?.meta) as BreadcrumbMeta | undefined
      const override = isCurrent ? text(toValue(currentLabel)) : ''
      const label = override || metaLabel(meta) || segmentLabel(segment)

      if (!label) return
      breadcrumbs.push({
        label,
        ...(isCurrent ? {} : { to }),
      })
    })

    return breadcrumbs
  })

  return {
    items,
    visible: computed(() => items.value.length > 1),
  }
}
